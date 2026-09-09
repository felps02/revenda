import type {
  BodyType,
  FacetOption,
  FuelType,
  TransmissionType,
  Vehicle,
  VehicleCategory,
  VehicleFacets,
  VehicleFilters,
  VehicleSort,
} from "@/types";
import { CATEGORY_LABELS } from "@/data/taxonomy";

/**
 * Toda a logica de busca/filtro/ordenacao vive aqui, em funcoes puras.
 * O servidor usa para renderizar a pagina de estoque; o cliente usa para
 * refiltrar sem recarregar. Quando o estoque migrar para uma API, estas
 * mesmas funcoes viram os parametros da query.
 */

export const EMPTY_FILTERS: VehicleFilters = {};

export const DEFAULT_SORT: VehicleSort = "recentes";
export const DEFAULT_PER_PAGE = 12;

/** Nomes dos parametros na URL - em portugues, para links compartilhaveis. */
export const QUERY_KEYS = {
  q: "q",
  brands: "marca",
  models: "modelo",
  bodies: "carroceria",
  categories: "categoria",
  transmissions: "cambio",
  fuels: "combustivel",
  colors: "cor",
  features: "opcional",
  yearMin: "anoMin",
  yearMax: "anoMax",
  priceMin: "precoMin",
  priceMax: "precoMax",
  mileageMax: "kmMax",
  onlyFinancing: "financiamento",
  onlyFeatured: "destaque",
  sort: "ordem",
  page: "pagina",
} as const;

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

function includesAny(list: string[] | undefined, value: string): boolean {
  if (!list || list.length === 0) return true;
  return list.some((item) => normalize(item) === normalize(value));
}

/** Texto indexado para a busca livre (marca, modelo, versao, cor, opcionais). */
function searchIndex(vehicle: Vehicle): string {
  return normalize(
    [
      vehicle.brand,
      vehicle.model,
      vehicle.version,
      vehicle.body,
      vehicle.color,
      vehicle.fuel,
      vehicle.transmission,
      vehicle.engine,
      String(vehicle.year),
      ...vehicle.features,
    ].join(" "),
  );
}

export function matchesFilters(vehicle: Vehicle, filters: VehicleFilters = {}): boolean {
  if (filters.ids && filters.ids.length > 0 && !filters.ids.includes(vehicle.id)) return false;

  if (filters.q && filters.q.trim()) {
    const haystack = searchIndex(vehicle);
    const terms = normalize(filters.q).split(/\s+/).filter(Boolean);
    if (!terms.every((term) => haystack.includes(term))) return false;
  }

  if (!includesAny(filters.brands, vehicle.brand)) return false;
  if (!includesAny(filters.models, vehicle.model)) return false;
  if (!includesAny(filters.bodies, vehicle.body)) return false;
  if (!includesAny(filters.categories, vehicle.category)) return false;
  if (!includesAny(filters.transmissions, vehicle.transmission)) return false;
  if (!includesAny(filters.fuels, vehicle.fuel)) return false;
  if (!includesAny(filters.colors, vehicle.color)) return false;

  if (filters.features && filters.features.length > 0) {
    const owned = vehicle.features.map(normalize);
    const hasAll = filters.features.every((feature) => owned.includes(normalize(feature)));
    if (!hasAll) return false;
  }

  if (typeof filters.yearMin === "number" && vehicle.year < filters.yearMin) return false;
  if (typeof filters.yearMax === "number" && vehicle.year > filters.yearMax) return false;
  if (typeof filters.priceMin === "number" && vehicle.price < filters.priceMin) return false;
  if (typeof filters.priceMax === "number" && vehicle.price > filters.priceMax) return false;
  if (typeof filters.mileageMax === "number" && vehicle.mileage > filters.mileageMax) return false;

  if (filters.onlyFinancing && !vehicle.financingAvailable) return false;
  if (filters.onlyFeatured && !vehicle.featured) return false;

  return true;
}

export function filterVehicles(vehicles: Vehicle[], filters: VehicleFilters = {}): Vehicle[] {
  return vehicles.filter((vehicle) => matchesFilters(vehicle, filters));
}

const SOLD_LAST = (a: Vehicle, b: Vehicle) => {
  const rank = (v: Vehicle) => (v.status === "disponivel" ? 0 : v.status === "reservado" ? 1 : 2);
  return rank(a) - rank(b);
};

export function sortVehicles(vehicles: Vehicle[], sort: VehicleSort = DEFAULT_SORT): Vehicle[] {
  const list = [...vehicles];
  const comparators: Record<VehicleSort, (a: Vehicle, b: Vehicle) => number> = {
    recentes: (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    "menor-preco": (a, b) => a.price - b.price,
    "maior-preco": (a, b) => b.price - a.price,
    "menor-km": (a, b) => a.mileage - b.mileage,
    "ano-recente": (a, b) => b.year - a.year || a.mileage - b.mileage,
  };
  const comparator = comparators[sort] ?? comparators[DEFAULT_SORT];
  return list.sort((a, b) => SOLD_LAST(a, b) || comparator(a, b));
}

export function paginate<T>(items: T[], page = 1, perPage = DEFAULT_PER_PAGE) {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const current = Math.min(Math.max(1, page), totalPages);
  const start = (current - 1) * perPage;
  return {
    items: items.slice(start, start + perPage),
    total,
    page: current,
    perPage,
    totalPages,
  };
}

function countBy(vehicles: Vehicle[], pick: (v: Vehicle) => string | undefined): Map<string, number> {
  const map = new Map<string, number>();
  for (const vehicle of vehicles) {
    const key = pick(vehicle);
    if (!key) continue;
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return map;
}

function toOptions(
  map: Map<string, number>,
  label: (value: string) => string = (value) => value,
): FacetOption[] {
  return [...map.entries()]
    .map(([value, count]) => ({ value, label: label(value), count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "pt-BR"));
}

/** Monta as opcoes (com contagem) que alimentam os filtros da pagina de estoque. */
export function buildFacets(vehicles: Vehicle[]): VehicleFacets {
  const prices = vehicles.map((v) => v.price);
  const years = vehicles.map((v) => v.year);
  const mileages = vehicles.map((v) => v.mileage);

  const modelsByBrand: Record<string, FacetOption[]> = {};
  for (const brand of new Set(vehicles.map((v) => v.brand))) {
    const models = countBy(
      vehicles.filter((v) => v.brand === brand),
      (v) => v.model,
    );
    modelsByBrand[brand] = toOptions(models).sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));
  }

  const featureCount = new Map<string, number>();
  for (const vehicle of vehicles) {
    for (const feature of vehicle.features) {
      featureCount.set(feature, (featureCount.get(feature) ?? 0) + 1);
    }
  }

  return {
    brands: toOptions(countBy(vehicles, (v) => v.brand)).sort((a, b) =>
      a.label.localeCompare(b.label, "pt-BR"),
    ),
    modelsByBrand,
    models: toOptions(countBy(vehicles, (v) => v.model)).sort((a, b) =>
      a.label.localeCompare(b.label, "pt-BR"),
    ),
    bodies: toOptions(countBy(vehicles, (v) => v.body)),
    categories: toOptions(
      countBy(vehicles, (v) => v.category),
      (value) => CATEGORY_LABELS[value as VehicleCategory] ?? value,
    ),
    transmissions: toOptions(countBy(vehicles, (v) => v.transmission)),
    fuels: toOptions(countBy(vehicles, (v) => v.fuel)),
    colors: toOptions(countBy(vehicles, (v) => v.color)),
    features: toOptions(featureCount),
    year: { min: years.length ? Math.min(...years) : 2015, max: years.length ? Math.max(...years) : 2025 },
    price: { min: prices.length ? Math.min(...prices) : 0, max: prices.length ? Math.max(...prices) : 500_000 },
    mileage: { min: 0, max: mileages.length ? Math.max(...mileages) : 200_000 },
    total: vehicles.length,
  };
}

type RawParams = URLSearchParams | Record<string, string | string[] | undefined>;

function readAll(params: RawParams, key: string): string[] {
  if (params instanceof URLSearchParams) return params.getAll(key).flatMap((v) => v.split(","));
  const value = params[key];
  if (value === undefined) return [];
  return (Array.isArray(value) ? value : [value]).flatMap((v) => v.split(","));
}

function readOne(params: RawParams, key: string): string | undefined {
  const [first] = readAll(params, key);
  return first;
}

function readNumber(params: RawParams, key: string): number | undefined {
  const raw = readOne(params, key);
  if (raw === undefined || raw === "") return undefined;
  const parsed = Number(raw.replace(/\D/g, ""));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

/** URL -> filtros (usado pelo server component da pagina de estoque). */
export function filtersFromSearchParams(params: RawParams): VehicleFilters {
  const list = (key: string) => {
    const values = readAll(params, key).filter(Boolean);
    return values.length > 0 ? values : undefined;
  };

  return {
    q: readOne(params, QUERY_KEYS.q) || undefined,
    brands: list(QUERY_KEYS.brands),
    models: list(QUERY_KEYS.models),
    bodies: list(QUERY_KEYS.bodies) as BodyType[] | undefined,
    categories: list(QUERY_KEYS.categories) as VehicleCategory[] | undefined,
    transmissions: list(QUERY_KEYS.transmissions) as TransmissionType[] | undefined,
    fuels: list(QUERY_KEYS.fuels) as FuelType[] | undefined,
    colors: list(QUERY_KEYS.colors),
    features: list(QUERY_KEYS.features),
    yearMin: readNumber(params, QUERY_KEYS.yearMin),
    yearMax: readNumber(params, QUERY_KEYS.yearMax),
    priceMin: readNumber(params, QUERY_KEYS.priceMin),
    priceMax: readNumber(params, QUERY_KEYS.priceMax),
    mileageMax: readNumber(params, QUERY_KEYS.mileageMax),
    onlyFinancing: readOne(params, QUERY_KEYS.onlyFinancing) === "1",
    onlyFeatured: readOne(params, QUERY_KEYS.onlyFeatured) === "1",
  };
}

export function sortFromSearchParams(params: RawParams): VehicleSort {
  const raw = readOne(params, QUERY_KEYS.sort) as VehicleSort | undefined;
  const valid: VehicleSort[] = ["recentes", "menor-preco", "maior-preco", "menor-km", "ano-recente"];
  return raw && valid.includes(raw) ? raw : DEFAULT_SORT;
}

export function pageFromSearchParams(params: RawParams): number {
  return readNumber(params, QUERY_KEYS.page) ?? 1;
}

/** Filtros -> querystring (usado pelo cliente ao mexer nos filtros). */
export function filtersToSearchParams(
  filters: VehicleFilters,
  sort: VehicleSort = DEFAULT_SORT,
  page = 1,
): URLSearchParams {
  const params = new URLSearchParams();
  const setList = (key: string, values?: string[]) => {
    if (values && values.length > 0) params.set(key, values.join(","));
  };
  const setNumber = (key: string, value?: number) => {
    if (typeof value === "number" && Number.isFinite(value) && value > 0) {
      params.set(key, String(value));
    }
  };

  if (filters.q?.trim()) params.set(QUERY_KEYS.q, filters.q.trim());
  setList(QUERY_KEYS.brands, filters.brands);
  setList(QUERY_KEYS.models, filters.models);
  setList(QUERY_KEYS.bodies, filters.bodies);
  setList(QUERY_KEYS.categories, filters.categories);
  setList(QUERY_KEYS.transmissions, filters.transmissions);
  setList(QUERY_KEYS.fuels, filters.fuels);
  setList(QUERY_KEYS.colors, filters.colors);
  setList(QUERY_KEYS.features, filters.features);
  setNumber(QUERY_KEYS.yearMin, filters.yearMin);
  setNumber(QUERY_KEYS.yearMax, filters.yearMax);
  setNumber(QUERY_KEYS.priceMin, filters.priceMin);
  setNumber(QUERY_KEYS.priceMax, filters.priceMax);
  setNumber(QUERY_KEYS.mileageMax, filters.mileageMax);
  if (filters.onlyFinancing) params.set(QUERY_KEYS.onlyFinancing, "1");
  if (filters.onlyFeatured) params.set(QUERY_KEYS.onlyFeatured, "1");
  if (sort !== DEFAULT_SORT) params.set(QUERY_KEYS.sort, sort);
  if (page > 1) params.set(QUERY_KEYS.page, String(page));

  return params;
}

export function countActiveFilters(filters: VehicleFilters): number {
  let count = 0;
  if (filters.q?.trim()) count += 1;
  const lists: Array<string[] | undefined> = [
    filters.brands,
    filters.models,
    filters.bodies,
    filters.categories,
    filters.transmissions,
    filters.fuels,
    filters.colors,
    filters.features,
  ];
  for (const list of lists) count += list?.length ?? 0;
  for (const value of [filters.yearMin, filters.yearMax, filters.priceMin, filters.priceMax, filters.mileageMax]) {
    if (typeof value === "number") count += 1;
  }
  if (filters.onlyFinancing) count += 1;
  if (filters.onlyFeatured) count += 1;
  return count;
}

/** Rotulos das "pilulas" de filtro ativo, com callback de remocao. */
export interface ActiveFilterChip {
  key: keyof VehicleFilters;
  value?: string;
  label: string;
}

export function activeFilterChips(filters: VehicleFilters): ActiveFilterChip[] {
  const chips: ActiveFilterChip[] = [];
  const pushList = (key: keyof VehicleFilters, values: string[] | undefined, prefix = "") => {
    for (const value of values ?? []) {
      chips.push({
        key,
        value,
        label: prefix + (key === "categories" ? CATEGORY_LABELS[value as VehicleCategory] ?? value : value),
      });
    }
  };

  if (filters.q?.trim()) chips.push({ key: "q", label: `"${filters.q.trim()}"` });
  pushList("brands", filters.brands);
  pushList("models", filters.models);
  pushList("bodies", filters.bodies);
  pushList("categories", filters.categories);
  pushList("transmissions", filters.transmissions);
  pushList("fuels", filters.fuels);
  pushList("colors", filters.colors, "Cor: ");
  pushList("features", filters.features);
  if (typeof filters.yearMin === "number") chips.push({ key: "yearMin", label: `A partir de ${filters.yearMin}` });
  if (typeof filters.yearMax === "number") chips.push({ key: "yearMax", label: `Até ${filters.yearMax}` });
  if (typeof filters.priceMin === "number") {
    chips.push({ key: "priceMin", label: `Mín. R$ ${filters.priceMin.toLocaleString("pt-BR")}` });
  }
  if (typeof filters.priceMax === "number") {
    chips.push({ key: "priceMax", label: `Máx. R$ ${filters.priceMax.toLocaleString("pt-BR")}` });
  }
  if (typeof filters.mileageMax === "number") {
    chips.push({ key: "mileageMax", label: `Até ${filters.mileageMax.toLocaleString("pt-BR")} km` });
  }
  if (filters.onlyFinancing) chips.push({ key: "onlyFinancing", label: "Com financiamento" });
  if (filters.onlyFeatured) chips.push({ key: "onlyFeatured", label: "Destaques" });
  return chips;
}
