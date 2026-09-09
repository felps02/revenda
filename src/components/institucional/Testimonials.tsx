"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/cn";
import { formatNumber, pluralize } from "@/lib/format";
import { averageRating, testimonials, type Testimonial } from "@/data/testimonials";
import Badge from "@/components/ui/Badge";
import Rating from "@/components/ui/Rating";
import SectionHeading from "@/components/ui/SectionHeading";
import { type IconName } from "@/components/ui/Icon";
import styles from "./Testimonials.module.css";

/**
 * Depoimentos de quem comprou. Grade de tres colunas no desktop (alturas
 * naturais) e carrossel com scroll-snap e indicadores no celular.
 */

const SOURCE_ICON: Record<Testimonial["source"], IconName> = {
  Google: "badge-check",
  Instagram: "instagram",
  "Indicação": "users",
};

export interface TestimonialsProps {
  items?: Testimonial[];
  className?: string;
}

export function Testimonials({ items = testimonials, className }: TestimonialsProps) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);

  const summary = useMemo(() => {
    if (items.length === 0) return { average: averageRating, total: 0 };
    const sum = items.reduce((accumulator, item) => accumulator + item.rating, 0);
    return { average: Math.round((sum / items.length) * 10) / 10, total: items.length };
  }, [items]);

  // Descobre qual cartao esta encostado na borda esquerda do carrossel.
  const onScroll = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const cards = Array.from(track.children).filter(
      (child): child is HTMLElement => child instanceof HTMLElement,
    );
    const first = cards[0];
    if (!first) return;

    let closest = 0;
    let shortest = Number.POSITIVE_INFINITY;
    cards.forEach((card, index) => {
      const distance = Math.abs(card.offsetLeft - first.offsetLeft - track.scrollLeft);
      if (distance < shortest) {
        shortest = distance;
        closest = index;
      }
    });
    setActive(closest);
  }, []);

  const goTo = useCallback((index: number) => {
    const track = trackRef.current;
    if (!track) return;
    const cards = Array.from(track.children).filter(
      (child): child is HTMLElement => child instanceof HTMLElement,
    );
    const first = cards[0];
    const target = cards[index];
    if (!first || !target) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    track.scrollTo({ left: target.offsetLeft - first.offsetLeft, behavior: reduced ? "auto" : "smooth" });
  }, []);

  if (items.length === 0) return null;

  return (
    <section
      id="depoimentos"
      className={cn("section", styles.section, className)}
      aria-labelledby="depoimentos-titulo"
    >
      <div className="container">
        <SectionHeading
          id="depoimentos-titulo"
          eyebrow="Quem já comprou"
          title="Nota dada por quem levou o carro"
          description="Avaliações publicadas no Google e no Instagram por clientes que compraram, venderam ou trocaram o carro com a gente."
          action={
            <div className={styles.score}>
              <span className={cn(styles.scoreValue, "tnum")}>{formatNumber(summary.average)}</span>
              <span className={styles.scoreInfo}>
                <Rating value={summary.average} size={16} />
                <span className={styles.scoreText}>
                  {formatNumber(summary.total)} {pluralize(summary.total, "avaliação", "avaliações")} de
                  clientes
                </span>
              </span>
            </div>
          }
        />

        <ul className={styles.track} ref={trackRef} onScroll={onScroll}>
          {items.map((item) => (
            <li key={item.id} className={styles.slide}>
              <article className={styles.card}>
                <span className={styles.quote} aria-hidden="true">
                  &ldquo;
                </span>

                <Rating value={item.rating} size={16} className={styles.rating} />

                <p className={styles.text}>{item.text}</p>

                <footer className={styles.footer}>
                  <Image
                    src={item.avatar}
                    alt={`Foto de ${item.name}`}
                    width={48}
                    height={48}
                    sizes="48px"
                    className={styles.avatar}
                  />
                  <span className={styles.person}>
                    <span className={styles.name}>{item.name}</span>
                    <span className={styles.city}>{item.city}</span>
                    <span className={styles.vehicle}>{item.vehicle}</span>
                  </span>
                  <Badge tone="neutral" icon={SOURCE_ICON[item.source]} className={styles.source}>
                    {item.source}
                  </Badge>
                </footer>
              </article>
            </li>
          ))}
        </ul>

        <div className={styles.dots} role="group" aria-label="Navegar entre os depoimentos">
          {items.map((item, index) => (
            <button
              key={item.id}
              type="button"
              className={cn(styles.dot, index === active ? styles.dotActive : undefined)}
              onClick={() => goTo(index)}
              aria-label={`Ver o depoimento de ${item.name}`}
              aria-current={index === active ? "true" : undefined}
            >
              <span className={styles.dotMark} aria-hidden="true" />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Testimonials;
