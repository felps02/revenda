"use client";

import { useCallback, useMemo } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import Icon from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { QUERY_KEYS } from "@/lib/vehicleQuery";
import styles from "./Pagination.module.css";

/**
 * Paginação do estoque. Só troca o parâmetro de página: filtros, busca e
 * ordenação continuam exatamente como estão na URL.
 */

export interface PaginationProps {
  page: number;
  totalPages: number;
}

type PageItem = { type: "page"; value: number } | { type: "gap"; id: string };

/** Até 7 páginas mostra tudo; acima disso usa reticências nas pontas. */
function buildItems(page: number, totalPages: number): PageItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => ({
      type: "page" as const,
      value: index + 1,
    }));
  }

  const items: PageItem[] = [{ type: "page", value: 1 }];
  const left = Math.max(2, Math.min(page - 1, totalPages - 4));
  const right = Math.min(totalPages - 1, Math.max(page + 1, 5));

  if (left > 2) items.push({ type: "gap", id: "inicio" });
  for (let value = left; value <= right; value += 1) items.push({ type: "page", value });
  if (right < totalPages - 1) items.push({ type: "gap", id: "fim" });
  items.push({ type: "page", value: totalPages });

  return items;
}

export default function Pagination({ page, totalPages }: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();

  const current = Math.min(Math.max(1, page), Math.max(1, totalPages));
  const items = useMemo(() => buildItems(current, totalPages), [current, totalPages]);

  const hrefFor = useCallback(
    (value: number) => {
      const params = new URLSearchParams(queryString);
      if (value <= 1) params.delete(QUERY_KEYS.page);
      else params.set(QUERY_KEYS.page, String(value));
      const query = params.toString();
      return query ? `${pathname}?${query}` : pathname;
    },
    [pathname, queryString],
  );

  if (totalPages <= 1) return null;

  const hasPrevious = current > 1;
  const hasNext = current < totalPages;

  return (
    <nav className={styles.root} aria-label="Paginação do estoque">
      {hasPrevious ? (
        <Link href={hrefFor(current - 1)} className={styles.step} aria-label="Página anterior">
          <Icon name="chevron-left" size={18} />
          <span className={styles.stepLabel}>Anterior</span>
        </Link>
      ) : (
        <span className={cn(styles.step, styles.stepOff)} aria-hidden="true">
          <Icon name="chevron-left" size={18} />
          <span className={styles.stepLabel}>Anterior</span>
        </span>
      )}

      <p className={styles.summary}>
        Página <strong className="tnum">{current}</strong> de{" "}
        <strong className="tnum">{totalPages}</strong>
      </p>

      <ul className={styles.list}>
        {items.map((item) =>
          item.type === "gap" ? (
            <li key={`gap-${item.id}`} className={styles.gap} aria-hidden="true">
              &hellip;
            </li>
          ) : (
            <li key={item.value}>
              {item.value === current ? (
                <span
                  className={cn(styles.page, styles.pageOn, "tnum")}
                  aria-current="page"
                  aria-label={`Página ${item.value}, página atual`}
                >
                  {item.value}
                </span>
              ) : (
                <Link
                  href={hrefFor(item.value)}
                  className={cn(styles.page, "tnum")}
                  aria-label={`Ir para a página ${item.value}`}
                >
                  {item.value}
                </Link>
              )}
            </li>
          ),
        )}
      </ul>

      {hasNext ? (
        <Link href={hrefFor(current + 1)} className={styles.step} aria-label="Próxima página">
          <span className={styles.stepLabel}>Próxima</span>
          <Icon name="chevron-right" size={18} />
        </Link>
      ) : (
        <span className={cn(styles.step, styles.stepOff)} aria-hidden="true">
          <span className={styles.stepLabel}>Próxima</span>
          <Icon name="chevron-right" size={18} />
        </span>
      )}
    </nav>
  );
}
