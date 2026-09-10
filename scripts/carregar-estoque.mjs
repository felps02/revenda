/**
 * Carrega no banco os veículos que estão hoje no arquivo local.
 *
 *   npm run estoque:carregar
 *
 * Use uma vez, depois de configurar DATABASE_URL, para levar o estoque de
 * demonstração (ou o que você já cadastrou localmente) para a produção.
 * Veículos com o mesmo código são atualizados, não duplicados.
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import postgres from "postgres";

const url = process.env.DATABASE_URL;

if (!url) {
  console.error("\n  Defina DATABASE_URL antes de rodar este comando.\n");
  process.exit(1);
}

const arquivo = path.join(process.cwd(), "data", "estoque.json");

let vehicles;
try {
  vehicles = JSON.parse(await readFile(arquivo, "utf8"));
} catch {
  console.error(`\n  Não encontrei ${arquivo}. Abra o site uma vez para gerá-lo.\n`);
  process.exit(1);
}

if (!Array.isArray(vehicles) || vehicles.length === 0) {
  console.error("\n  O arquivo de estoque está vazio.\n");
  process.exit(1);
}

const sql = postgres(url, { ssl: "require", max: 2, prepare: false });

try {
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

  for (const vehicle of vehicles) {
    await sql`
      INSERT INTO vehicles (id, slug, brand, model, year, price, mileage, status, created_at, data)
      VALUES (
        ${vehicle.id}, ${vehicle.slug}, ${vehicle.brand}, ${vehicle.model}, ${vehicle.year},
        ${vehicle.price}, ${vehicle.mileage}, ${vehicle.status}, ${vehicle.createdAt},
        ${sql.json(vehicle)}
      )
      ON CONFLICT (id) DO UPDATE SET
        slug = EXCLUDED.slug, brand = EXCLUDED.brand, model = EXCLUDED.model,
        year = EXCLUDED.year, price = EXCLUDED.price, mileage = EXCLUDED.mileage,
        status = EXCLUDED.status, created_at = EXCLUDED.created_at,
        updated_at = now(), data = EXCLUDED.data
    `;
  }

  console.log(`\n  ${vehicles.length} veículos carregados no banco.\n`);
} finally {
  await sql.end();
}
