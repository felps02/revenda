import { vehicles as demoVehicles } from "@/data/vehicles";
import {
  DEFAULT_PER_PAGE,
  DEFAULT_SORT,
  buildFacets,
  filterVehicles,
  paginate,
  sortVehicles,
} from "@/lib/vehicleQuery";
import { getInventoryStore, isDatabaseConfigured, type InventoryStore } from "@/services/inventoryStore";
import type {
  Vehicle,
  VehicleFacets,
  VehicleListResult,
  VehicleQuery,
} from "@/types";

/**
 * Camada de acesso ao estoque.
 *
 * A interface nunca conversa com o banco: ela fala com o `VehicleRepository`.
 * Hoje os dados vêm do `InventoryStore` (arquivo local ou Postgres) e o painel
 * administrativo grava por ali. Trocar por um ERP é implementar esta interface.
 */
export interface VehicleRepository {
  list(query?: VehicleQuery): Promise<VehicleListResult>;
  all(): Promise<Vehicle[]>;
  getBySlug(slug: string): Promise<Vehicle | null>;
  getById(id: string): Promise<Vehicle | null>;
  getManyByIds(ids: string[]): Promise<Vehicle[]>;
  featured(limit?: number): Promise<Vehicle[]>;
  related(vehicle: Vehicle, limit?: number): Promise<Vehicle[]>;
  facets(): Promise<VehicleFacets>;
  count(): Promise<number>;
}

/** Regras de vitrine compartilhadas por qualquer fonte de dados. */
abstract class BaseVehicleRepository implements VehicleRepository {
  abstract all(): Promise<Vehicle[]>;

  async list(query: VehicleQuery = {}): Promise<VehicleListResult> {
    const source = await this.all();
    const filtered = filterVehicles(source, query.filters);
    const sorted = sortVehicles(filtered, query.sort ?? DEFAULT_SORT);
    return paginate(sorted, query.page ?? 1, query.perPage ?? DEFAULT_PER_PAGE);
  }

  async getBySlug(slug: string): Promise<Vehicle | null> {
    const source = await this.all();
    return source.find((vehicle) => vehicle.slug === slug) ?? null;
  }

  async getById(id: string): Promise<Vehicle | null> {
    const target = id.toLowerCase();
    const source = await this.all();
    return source.find((vehicle) => vehicle.id.toLowerCase() === target) ?? null;
  }

  async getManyByIds(ids: string[]): Promise<Vehicle[]> {
    const wanted = new Set(ids.map((id) => id.toLowerCase()));
    const source = await this.all();
    return source.filter((vehicle) => wanted.has(vehicle.id.toLowerCase()));
  }

  async featured(limit = 6): Promise<Vehicle[]> {
    const source = await this.all();
    const available = source.filter((vehicle) => vehicle.status !== "vendido");
    const featured = available.filter((vehicle) => vehicle.featured);
    const rest = available.filter((vehicle) => !vehicle.featured);
    return sortVehicles([...featured, ...rest], "recentes").slice(0, limit);
  }

  /**
   * Relacionados: mesma categoria/carroceria e faixa de preço próxima,
   * priorizando a mesma marca. Nunca inclui o próprio veículo.
   */
  async related(vehicle: Vehicle, limit = 4): Promise<Vehicle[]> {
    const source = await this.all();
    const candidates = source.filter(
      (item) => item.id !== vehicle.id && item.status !== "vendido",
    );
    const score = (item: Vehicle) => {
      let value = 0;
      if (item.category === vehicle.category) value += 3;
      if (item.body === vehicle.body) value += 3;
      if (item.brand === vehicle.brand) value += 2;
      if (item.fuel === vehicle.fuel) value += 1;
      const delta = Math.abs(item.price - vehicle.price) / Math.max(vehicle.price, 1);
      if (delta <= 0.2) value += 3;
      else if (delta <= 0.35) value += 2;
      else if (delta <= 0.6) value += 1;
      return value;
    };
    return candidates
      .map((item) => ({ item, value: score(item) }))
      .sort((a, b) => b.value - a.value || a.item.price - b.item.price)
      .slice(0, limit)
      .map((entry) => entry.item);
  }

  async facets(): Promise<VehicleFacets> {
    return buildFacets(await this.all());
  }

  async count(): Promise<number> {
    const source = await this.all();
    return source.filter((vehicle) => vehicle.status === "disponivel").length;
  }
}

/** Estoque gravado pelo painel administrativo (arquivo local ou Postgres). */
export class StoreVehicleRepository extends BaseVehicleRepository {
  constructor(private readonly store: InventoryStore = getInventoryStore()) {
    super();
  }

  async all(): Promise<Vehicle[]> {
    const saved = await this.store.all();

    // Primeira execução no computador local: carrega o estoque de demonstração
    // para o site não abrir vazio. Em produção (Postgres) a carga é explícita,
    // pelo comando `npm run estoque:carregar`.
    if (saved.length === 0 && !isDatabaseConfigured()) {
      await this.store.replaceAll(demoVehicles);
      return demoVehicles;
    }

    return saved;
  }
}

/** Estoque fixo em código, sem persistência (usado como alternativa). */
export class StaticVehicleRepository extends BaseVehicleRepository {
  constructor(private readonly source: Vehicle[] = demoVehicles) {
    super();
  }

  async all(): Promise<Vehicle[]> {
    return this.source;
  }
}

/**
 * Implementação HTTP pronta para quando existir uma API de estoque própria.
 * Defina NEXT_PUBLIC_VEHICLES_API (ex.: https://api.loja.com.br/v1) expondo
 * /vehicles, /vehicles/:slug e /vehicles/facets.
 */
export class HttpVehicleRepository implements VehicleRepository {
  constructor(
    private readonly baseUrl: string,
    private readonly revalidateSeconds = 300,
  ) {}

  private async request<T>(path: string, params?: URLSearchParams): Promise<T> {
    const url = `${this.baseUrl.replace(/\/$/, "")}${path}${params ? `?${params}` : ""}`;
    const response = await fetch(url, { next: { revalidate: this.revalidateSeconds } });
    if (!response.ok) throw new Error(`Falha ao consultar o estoque (${response.status})`);
    return (await response.json()) as T;
  }

  async all(): Promise<Vehicle[]> {
    const result = await this.list({ perPage: 500 });
    return result.items;
  }

  async list(query: VehicleQuery = {}): Promise<VehicleListResult> {
    const params = new URLSearchParams();
    if (query.sort) params.set("sort", query.sort);
    if (query.page) params.set("page", String(query.page));
    if (query.perPage) params.set("perPage", String(query.perPage));
    for (const [key, value] of Object.entries(query.filters ?? {})) {
      if (value === undefined || value === null || value === "") continue;
      params.set(key, Array.isArray(value) ? value.join(",") : String(value));
    }
    return this.request<VehicleListResult>("/vehicles", params);
  }

  async getBySlug(slug: string): Promise<Vehicle | null> {
    try {
      return await this.request<Vehicle>(`/vehicles/${encodeURIComponent(slug)}`);
    } catch {
      return null;
    }
  }

  async getById(id: string): Promise<Vehicle | null> {
    const result = await this.list({ filters: { ids: [id] }, perPage: 1 });
    return result.items[0] ?? null;
  }

  async getManyByIds(ids: string[]): Promise<Vehicle[]> {
    if (ids.length === 0) return [];
    const result = await this.list({ filters: { ids }, perPage: ids.length });
    return result.items;
  }

  async featured(limit = 6): Promise<Vehicle[]> {
    const result = await this.list({ filters: { onlyFeatured: true }, perPage: limit });
    return result.items;
  }

  async related(vehicle: Vehicle, limit = 4): Promise<Vehicle[]> {
    const result = await this.list({
      filters: { categories: [vehicle.category] },
      perPage: limit + 1,
    });
    return result.items.filter((item) => item.id !== vehicle.id).slice(0, limit);
  }

  async facets(): Promise<VehicleFacets> {
    return this.request<VehicleFacets>("/vehicles/facets");
  }

  async count(): Promise<number> {
    const result = await this.list({ perPage: 1 });
    return result.total;
  }
}

let instance: VehicleRepository | null = null;

export function getVehicleRepository(): VehicleRepository {
  if (!instance) {
    const apiUrl = process.env.NEXT_PUBLIC_VEHICLES_API;
    instance = apiUrl ? new HttpVehicleRepository(apiUrl) : new StoreVehicleRepository();
  }
  return instance;
}

/** Atalho usado pelos server components. */
export const vehicleRepository = getVehicleRepository();
