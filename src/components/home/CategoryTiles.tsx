import Image from "next/image";
import Link from "next/link";
import Icon from "@/components/ui/Icon";
import SectionHeading from "@/components/ui/SectionHeading";
import { siteMedia } from "@/data/media";
import { cn } from "@/lib/cn";
import { formatNumber, pluralize } from "@/lib/format";
import { QUERY_KEYS } from "@/lib/vehicleQuery";
import styles from "./CategoryTiles.module.css";

/** Vitrines por carroceria: o atalho mais usado por quem já sabe o que quer. */

type TileKey = keyof typeof siteMedia.categories;

const TILES: TileKey[] = ["SUV", "Sedã", "Hatch", "Picape"];

export interface CategoryTilesProps {
  /** Quantidade de veículos por carroceria (chave = nome da carroceria). */
  counts: Record<string, number>;
}

export function CategoryTiles({ counts }: CategoryTilesProps) {
  return (
    <section className={cn("section", styles.section)} aria-labelledby="carrocerias-titulo">
      <div className="container">
        <SectionHeading
          id="carrocerias-titulo"
          eyebrow="Por carroceria"
          title="Escolha pelo formato do seu dia a dia"
          description="Do hatch de cidade à picape de trabalho: cada vitrine abre o estoque já filtrado."
        />

        <ul className={styles.grid}>
          {TILES.map((tile, index) => {
            const media = siteMedia.categories[tile];
            const count = counts[tile] ?? 0;
            const href = `/estoque?${QUERY_KEYS.bodies}=${encodeURIComponent(tile)}`;

            return (
              <li key={tile} className={styles.item} data-reveal>
                <Link href={href} className={styles.tile}>
                  <Image
                    src={media.url}
                    alt={media.alt}
                    fill
                    sizes={index === 0 ? "50vw" : "(min-width: 1024px) 25vw, 50vw"}
                    className={styles.photo}
                  />
                  <span className={styles.overlay} aria-hidden="true" />

                  <span className={styles.corner} aria-hidden="true">
                    <Icon name="arrow-up-right" size={18} />
                  </span>

                  <span className={styles.content}>
                    <span className={styles.name}>{tile}</span>
                    <span className={cn(styles.count, "tnum")}>
                      {count > 0
                        ? `${formatNumber(count)} ${pluralize(count, "veículo", "veículos")}`
                        : "Ver disponíveis"}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

export default CategoryTiles;
