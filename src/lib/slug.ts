import type { Vehicle } from "@/types";

/** Remove acentos, pontuacao e espacos: "Sedã 2.0 TSI" -> "seda-2-0-tsi". */
export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type SlugSource = Pick<Vehicle, "brand" | "model" | "version" | "year" | "id">;

/**
 * URL amigavel e estavel do veiculo:
 * `/estoque/volkswagen-t-cross-highline-200-tsi-2022-mm1042`
 * O id no final garante unicidade mesmo com dois carros identicos no patio.
 */
export function buildVehicleSlug(vehicle: SlugSource): string {
  return [
    slugify(vehicle.brand),
    slugify(vehicle.model),
    slugify(vehicle.version),
    String(vehicle.year),
    slugify(vehicle.id),
  ]
    .filter(Boolean)
    .join("-");
}

/** Extrai o id a partir do slug (ultimo segmento). */
export function idFromSlug(slug: string): string {
  const parts = slug.split("-");
  return parts[parts.length - 1] ?? "";
}

/** Titulo curto do anuncio: "Volkswagen T-Cross Highline". */
export function vehicleTitle(vehicle: Pick<Vehicle, "brand" | "model">): string {
  return `${vehicle.brand} ${vehicle.model}`;
}

/** Titulo completo usado em <title>, WhatsApp e compartilhamento. */
export function vehicleFullTitle(
  vehicle: Pick<Vehicle, "brand" | "model" | "version" | "year">,
): string {
  return `${vehicle.brand} ${vehicle.model} ${vehicle.version} ${vehicle.year}`.replace(/\s+/g, " ").trim();
}
