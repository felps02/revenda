import { promises as fs } from "node:fs";
import path from "node:path";
import type { Vehicle } from "@/types";

/**
 * Persistência do estoque.
 *
 * A mesma interface atende dois destinos:
 *   • JsonFileStore   — arquivo `data/estoque.json`, usado no computador local.
 *   • PostgresStore   — banco Postgres (Neon, Supabase, Vercel Postgres), usado
 *                       em produção. Basta definir DATABASE_URL.
 *
 * Filtro, ordenação e facetas continuam em `lib/vehicleQuery` (funções puras),
 * então a loja só precisa saber ler, gravar e apagar. Para centenas de veículos
 * isso é rápido e mantém o código simples.
 */
export interface InventoryStore {
  all(): Promise<Vehicle[]>;
  get(id: string): Promise<Vehicle | null>;
  save(vehicle: Vehicle): Promise<Vehicle>;
  remove(id: string): Promise<void>;
  /** Grava a lista inteira (usado pela carga inicial). */
  replaceAll(vehicles: Vehicle[]): Promise<void>;
}

/* ------------------------------------------------------------------ */
/* Arquivo local                                                       */
/* ------------------------------------------------------------------ */

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "estoque.json");

export class JsonFileStore implements InventoryStore {
  async all(): Promise<Vehicle[]> {
    try {
      const raw = await fs.readFile(DATA_FILE, "utf8");
      const parsed: unknown = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as Vehicle[]) : [];
    } catch {
      return [];
    }
  }

  async get(id: string): Promise<Vehicle | null> {
    const list = await this.all();
    return list.find((vehicle) => vehicle.id === id) ?? null;
  }

  async save(vehicle: Vehicle): Promise<Vehicle> {
    const list = await this.all();
    const index = list.findIndex((item) => item.id === vehicle.id);
    if (index >= 0) list[index] = vehicle;
    else list.unshift(vehicle);
    await this.replaceAll(list);
    return vehicle;
  }

  async remove(id: string): Promise<void> {
    const list = await this.all();
    await this.replaceAll(list.filter((vehicle) => vehicle.id !== id));
  }

  async replaceAll(vehicles: Vehicle[]): Promise<void> {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(vehicles, null, 2), "utf8");
  }
}

/* ------------------------------------------------------------------ */
/* Postgres                                                            */
/* ------------------------------------------------------------------ */

type SqlClient = import("postgres").Sql;

let sqlClient: SqlClient | null = null;
let schemaReady: Promise<void> | null = null;

async function getSql(): Promise<SqlClient> {
  if (!sqlClient) {
    const { default: postgres } = await import("postgres");
    sqlClient = postgres(process.env.DATABASE_URL as string, {
      ssl: "require",
      max: 3,
      idle_timeout: 20,
prepare: false,
    });
  }
  return sqlClient;
}

/**
 * Uma tabela só. Os campos usados em filtro viram colunas (para poder indexar
 * quando o estoque crescer); o resto do anúncio fica em JSONB.
 */
async function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    schemaReady = (async () => {
      const sql = await getSql();
      await sql`
        CREATE TABLE IF NOT EXISTS vehicles (
          id           TEXT PRIMARY KEY,
          slug         TEXT NOT NULL,
          brand        TEXT NOT NULL,
          model        TEXT NOT NULL,
          year         INTEGER NOT NULL,
          price        INTEGER NOT NULL,
          mileage      INTEGER NOT NULL,
          status       TEXT NOT NULL,
          created_at   TIMESTAMPTZ NOT NULL,
          updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
          data         JSONB NOT NULL
        )
      `;
      await sql`CREATE INDEX IF NOT EXISTS vehicles_slug_idx ON vehicles (slug)`;
      await sql`CREATE INDEX IF NOT EXISTS vehicles_created_idx ON vehicles (created_at DESC)`;
    })();
  }
  return schemaReady;
}

export class PostgresStore implements InventoryStore {
  async all(): Promise<Vehicle[]> {
    await ensureSchema();
    const sql = await getSql();
    const rows = await sql<{ data: Vehicle }[]>`
      SELECT data FROM vehicles ORDER BY created_at DESC
    `;
    return rows.map((row) => row.data);
  }

  async get(id: string): Promise<Vehicle | null> {
    await ensureSchema();
    const sql = await getSql();
    const rows = await sql<{ data: Vehicle }[]>`
      SELECT data FROM vehicles WHERE id = ${id} LIMIT 1
    `;
    return rows[0]?.data ?? null;
  }

  async save(vehicle: Vehicle): Promise<Vehicle> {
    await ensureSchema();
    const sql = await getSql();
    await sql`
      INSERT INTO vehicles (id, slug, brand, model, year, price, mileage, status, created_at, data)
      VALUES (
        ${vehicle.id}, ${vehicle.slug}, ${vehicle.brand}, ${vehicle.model}, ${vehicle.year},
        ${vehicle.price}, ${vehicle.mileage}, ${vehicle.status}, ${vehicle.createdAt},
        ${sql.json(vehicle as unknown as import("postgres").JSONValue)}
      )
      ON CONFLICT (id) DO UPDATE SET
        slug = EXCLUDED.slug,
        brand = EXCLUDED.brand,
        model = EXCLUDED.model,
        year = EXCLUDED.year,
        price = EXCLUDED.price,
        mileage = EXCLUDED.mileage,
        status = EXCLUDED.status,
        created_at = EXCLUDED.created_at,
        updated_at = now(),
        data = EXCLUDED.data
    `;
    return vehicle;
  }

  async remove(id: string): Promise<void> {
    await ensureSchema();
    const sql = await getSql();
    await sql`DELETE FROM vehicles WHERE id = ${id}`;
  }

  async replaceAll(vehicles: Vehicle[]): Promise<void> {
    for (const vehicle of vehicles) {
      await this.save(vehicle);
    }
  }
}

/* ------------------------------------------------------------------ */

let store: InventoryStore | null = null;

/** Postgres quando há DATABASE_URL; arquivo local caso contrário. */
export function getInventoryStore(): InventoryStore {
  if (!store) {
    store = process.env.DATABASE_URL ? new PostgresStore() : new JsonFileStore();
  }
  return store;
}

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}
