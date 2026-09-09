"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Icon from "@/components/ui/Icon";
import {
  activeFilterChips,
  filtersFromSearchParams,
  filtersToSearchParams,
  sortFromSearchParams,
  type ActiveFilterChip,
} from "@/lib/vehicleQuery";
import type { VehicleFacets, VehicleFilters as Filters } from "@/types";
import styles from "./ActiveFilters.module.css";

/**
 * Pílulas do que está filtrado agora. Cada X tira só aquele valor da URL,
 * mantendo o resto dos filtros, a ordenação e voltando para a página 1.
 */

export interface ActiveFiltersProps {
  facets?: VehicleFacets;
}

function drop<T extends string>(list: T[] | undefined, value: string): T[] | undefined {
  const next = (list ?? []).filter((item) => item !== value);
  return next.length > 0 ? next : undefined;
}

function removeChip(
  filters: Filters,
  chip: ActiveFilterChip,
  facets: VehicleFacets | undefined,
): Filters {
  const value = chip.value ?? "";

  switch (chip.key) {
    case "q":
      return { ...filters, q: undefined };
    case "brands": {
      const brands = drop(filters.brands, value);
      if (!brands) return { ...filters, brands: undefined, models: undefined };
      if (!facets) return { ...filters, brands };
      // Sem a marca na lista, os modelos dela não fazem mais sentido.
      const allowed = new Set(
        brands.flatMap((brand) => (facets.modelsByBrand[brand] ?? []).map((item) => item.value)),
      );
      const models = (filters.models ?? []).filter((model) => allowed.has(model));
      return { ...filters, brands, models: models.length > 0 ? models : undefined };
    }
    case "models":
      return { ...filters, models: drop(filters.models, value) };
    case "bodies":
      return { ...filters, bodies: drop(filters.bodies, value) };
    case "categories":
      return { ...filters, categories: drop(filters.categories, value) };
    case "transmissions":
      return { ...filters, transmissions: drop(filters.transmissions, value) };
    case "fuels":
      return { ...filters, fuels: drop(filters.fuels, value) };
    case "colors":
      return { ...filters, colors: drop(filters.colors, value) };
    case "features":
      return { ...filters, features: drop(filters.features, value) };
    case "yearMin":
      return { ...filters, yearMin: undefined };
    case "yearMax":
      return { ...filters, yearMax: undefined };
    case "priceMin":
      return { ...filters, priceMin: undefined };
    case "priceMax":
      return { ...filters, priceMax: undefined };
    case "mileageMax":
      return { ...filters, mileageMax: undefined };
    case "onlyFinancing":
      return { ...filters, onlyFinancing: undefined };
    case "onlyFeatured":
      return { ...filters, onlyFeatured: undefined };
    default:
      return filters;
  }
}

export default function ActiveFilters({ facets }: ActiveFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();

  const filters = useMemo(
    () => filtersFromSearchParams(new URLSearchParams(queryString)),
    [queryString],
  );
  const sort = useMemo(
    () => sortFromSearchParams(new URLSearchParams(queryString)),
    [queryString],
  );
  const chips = useMemo(() => activeFilterChips(filters), [filters]);

  const push = useCallback(
    (next: Filters) => {
      const query = filtersToSearchParams(next, sort, 1).toString();
      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, sort],
  );

  if (chips.length === 0) return null;

  return (
    <div className={styles.root}>
      <span className={styles.label}>Filtros ativos</span>

      <ul className={styles.list}>
        {chips.map((chip) => (
          <li key={`${chip.key}-${chip.value ?? "unico"}`}>
            <button
              type="button"
              className={styles.chip}
              aria-label={`Remover o filtro ${chip.label}`}
              onClick={() => push(removeChip(filters, chip, facets))}
            >
              <span className={styles.chipLabel}>{chip.label}</span>
              <Icon name="close" size={14} className={styles.chipIcon} />
            </button>
          </li>
        ))}
      </ul>

      {chips.length >= 2 ? (
        <button
          type="button"
          className={styles.clear}
          title={facets ? `Voltar aos ${facets.total} veículos do estoque` : undefined}
          onClick={() => push({})}
        >
          Limpar tudo
        </button>
      ) : null}
    </div>
  );
}
