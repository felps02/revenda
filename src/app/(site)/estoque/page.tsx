import { Suspense } from "react";
import type { Metadata } from "next";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import Skeleton from "@/components/ui/Skeleton";
import VehicleGrid from "@/components/vehicle/VehicleGrid";
import ActiveFilters from "@/components/vehicle/filters/ActiveFilters";
import Pagination from "@/components/vehicle/filters/Pagination";
import SortSelect from "@/components/vehicle/filters/SortSelect";
import VehicleFilters from "@/components/vehicle/filters/VehicleFilters";
import { siteConfig } from "@/config/site";
import { CATEGORY_LABELS } from "@/data/taxonomy";
import { formatNumber, pluralize } from "@/lib/format";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo";
import {
  DEFAULT_PER_PAGE,
  filtersFromSearchParams,
  pageFromSearchParams,
  sortFromSearchParams,
} from "@/lib/vehicleQuery";
import { vehicleRepository } from "@/services/vehicleRepository";
import type { VehicleCategory, VehicleFilters as Filters } from "@/types";
import styles from "./page.module.css";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/** Título dinâmico: reflete o que o visitante está filtrando. */
function buildHeading(filters: Filters): { title: string; description: string } {
  const parts: string[] = [];
  if (filters.brands?.length === 1) parts.push(filters.brands[0]);
  if (filters.models?.length === 1) parts.push(filters.models[0]);
  if (filters.bodies?.length === 1) parts.push(`${filters.bodies[0]}s`);
  if (filters.categories?.length === 1) {
    parts.push(CATEGORY_LABELS[filters.categories[0] as VehicleCategory] ?? filters.categories[0]);
  }

  const subject = parts.length > 0 ? parts.join(" ") : "Estoque completo";
  const place = `${siteConfig.address.city}/${siteConfig.address.state}`;

  return {
    title: parts.length > 0 ? `${subject} à venda em ${siteConfig.address.city}` : subject,
    description:
      parts.length > 0
        ? `Seminovos ${subject} com laudo cautelar, garantia de 90 dias e financiamento em até 60x na ${siteConfig.name}, ${place}.`
        : `Todos os seminovos selecionados da ${siteConfig.name}. Laudo cautelar, garantia de 90 dias e financiamento aprovado em até 24 horas em ${place}.`,
  };
}

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const params = await searchParams;
  const filters = filtersFromSearchParams(params);
  const heading = buildHeading(filters);
  const hasFilters = Object.values(params).some(Boolean);

  return buildMetadata({
    title: heading.title,
    description: heading.description,
    path: "/estoque",
    // Combinações de filtro não entram no índice: o canônico aponta para /estoque.
    noIndex: hasFilters,
    keywords: ["estoque de seminovos", "carros à venda curitiba"],
  });
}

export default async function EstoquePage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const filters = filtersFromSearchParams(params);
  const sort = sortFromSearchParams(params);
  const page = pageFromSearchParams(params);

  const [result, facets] = await Promise.all([
    vehicleRepository.list({ filters, sort, page, perPage: DEFAULT_PER_PAGE }),
    vehicleRepository.facets(),
  ]);

  const heading = buildHeading(filters);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd([
              { name: "Início", path: "/" },
              { name: "Estoque", path: "/estoque" },
            ]),
          ),
        }}
      />

      <header className={styles.pageHeader}>
        <div className="container">
          <Breadcrumbs items={[{ label: "Início", href: "/" }, { label: "Estoque" }]} />
          <h1 className={styles.title}>{heading.title}</h1>
          <p className={styles.subtitle}>
            {formatNumber(result.total)} {pluralize(result.total, "veículo disponível", "veículos disponíveis")} · troca
            com avaliação na hora · financiamento em até 60x
          </p>
        </div>
      </header>

      <div className={`container ${styles.layout}`}>
        <aside className={styles.sidebar}>
          <Suspense fallback={<Skeleton height="520px" radius="var(--r-lg)" />}>
            <VehicleFilters facets={facets} resultCount={result.total} />
          </Suspense>
        </aside>

        <div className={styles.content}>
          <Suspense fallback={<Skeleton height="44px" radius="var(--r-sm)" />}>
            <div className={styles.toolbar}>
              <SortSelect resultCount={result.total} />
            </div>
            <ActiveFilters facets={facets} />
          </Suspense>

          <VehicleGrid vehicles={result.items} priorityCount={3} />

          {result.totalPages > 1 ? (
            <Suspense fallback={null}>
              <Pagination page={result.page} totalPages={result.totalPages} />
            </Suspense>
          ) : null}
        </div>
      </div>
    </>
  );
}
