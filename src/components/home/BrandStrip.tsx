import Link from "next/link";
import { cn } from "@/lib/cn";
import { formatNumber } from "@/lib/format";
import { QUERY_KEYS } from "@/lib/vehicleQuery";
import styles from "./BrandStrip.module.css";

/** Faixa discreta com as marcas presentes no pátio, cada uma abrindo o filtro. */

export interface BrandStripProps {
  brands: { value: string; count: number; label?: string }[];
}

export function BrandStrip({ brands }: BrandStripProps) {
  if (brands.length === 0) return null;

  return (
    <section className={styles.section} aria-labelledby="marcas-titulo">
      <div className={cn("container", styles.inner)}>
        <h2 id="marcas-titulo" className={styles.title}>
          Marcas no pátio
        </h2>

        <ul className={styles.list}>
          {brands.map((brand) => (
            <li key={brand.value} className={styles.item}>
              <Link
                href={`/estoque?${QUERY_KEYS.brands}=${encodeURIComponent(brand.value)}`}
                className={styles.pill}
              >
                <span className={styles.name}>{brand.label ?? brand.value}</span>
                <span className={cn(styles.count, "tnum")}>{formatNumber(brand.count)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default BrandStrip;
