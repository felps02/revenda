"use client";

import { useCallback, useId, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SelectInput } from "@/components/ui/Field";
import { SORT_OPTIONS } from "@/data/taxonomy";
import { cn } from "@/lib/cn";
import { formatNumber, pluralize } from "@/lib/format";
import {
  filtersFromSearchParams,
  filtersToSearchParams,
  sortFromSearchParams,
} from "@/lib/vehicleQuery";
import styles from "./SortSelect.module.css";

/**
 * Contagem do resultado + ordenação. Trocar a ordem preserva todos os filtros
 * da URL e volta para a primeira página.
 */

export interface SortSelectProps {
  resultCount: number;
}

export default function SortSelect({ resultCount }: SortSelectProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();
  const selectId = useId();

  const sort = useMemo(
    () => sortFromSearchParams(new URLSearchParams(queryString)),
    [queryString],
  );

  const changeSort = useCallback(
    (value: string) => {
      const filters = filtersFromSearchParams(new URLSearchParams(queryString));
      const next = SORT_OPTIONS.find((option) => option.value === value)?.value;
      const query = filtersToSearchParams(filters, next ?? sort, 1).toString();
      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, queryString, router, sort],
  );

  return (
    <div className={styles.root}>
      <p className={styles.count} aria-live="polite">
        {resultCount === 0 ? (
          "Nenhum veículo encontrado"
        ) : (
          <>
            <strong className={cn(styles.number, "tnum")}>{formatNumber(resultCount)}</strong>{" "}
            {pluralize(resultCount, "veículo encontrado", "veículos encontrados")}
          </>
        )}
      </p>

      <div className={styles.sort}>
        <label htmlFor={selectId} className={styles.label}>
          Ordenar por
        </label>
        <SelectInput
          id={selectId}
          className={styles.select}
          value={sort}
          options={SORT_OPTIONS.map((option) => ({ value: option.value, label: option.label }))}
          onChange={(event) => changeSort(event.target.value)}
        />
      </div>
    </div>
  );
}
