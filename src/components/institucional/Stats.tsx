"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { siteConfig } from "@/config/site";
import styles from "./Stats.module.css";

/**
 * Faixa escura com os numeros da revenda. A contagem sobe uma unica vez,
 * quando a faixa entra na tela; com prefers-reduced-motion (ou sem JS) o
 * valor final ja vem renderizado.
 */

export interface StatItem {
  value: number;
  label: string;
  suffix?: string;
  /** Casas decimais exibidas (ex.: 1 para "4,9"). */
  decimals?: number;
}

export interface StatsProps {
  items?: StatItem[];
  title?: string;
  className?: string;
}

const DEFAULT_ITEMS: StatItem[] = siteConfig.stats.map((stat) => ({
  value: stat.value,
  label: stat.label,
  suffix: stat.suffix,
  decimals: "decimals" in stat ? stat.decimals : 0,
}));

const DURATION = 1500;

// useLayoutEffect no cliente evita o piscar do valor final antes da contagem.
const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function Stats({
  items = DEFAULT_ITEMS,
  title = "Dezesseis anos de Batel em quatro números",
  className,
}: StatsProps) {
  const sectionRef = useRef<HTMLElement>(null);
  // 1 = valor final. O cliente reinicia em 0 antes da primeira pintura.
  const [progress, setProgress] = useState(1);

  const formatters = useMemo(() => {
    const map = new Map<number, Intl.NumberFormat>();
    for (const item of items) {
      const decimals = item.decimals ?? 0;
      if (!map.has(decimals)) {
        map.set(
          decimals,
          new Intl.NumberFormat("pt-BR", {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
          }),
        );
      }
    }
    return map;
  }, [items]);

  useIsomorphicLayoutEffect(() => {
    if (typeof IntersectionObserver === "undefined" || prefersReducedMotion()) return;
    setProgress(0);
  }, []);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node || typeof IntersectionObserver === "undefined" || prefersReducedMotion()) return;

    let frame = 0;
    let startedAt = 0;

    const step = (now: number) => {
      if (startedAt === 0) startedAt = now;
      const elapsed = Math.min(1, (now - startedAt) / DURATION);
      setProgress(easeOutCubic(elapsed));
      if (elapsed < 1) frame = window.requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          observer.disconnect();
          frame = window.requestAnimationFrame(step);
        }
      },
      { threshold: 0.3, rootMargin: "0px 0px -10% 0px" },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
      if (frame !== 0) window.cancelAnimationFrame(frame);
    };
  }, []);

  const format = (value: number, decimals: number): string => {
    const formatter = formatters.get(decimals);
    return formatter ? formatter.format(value) : String(value);
  };

  return (
    <section
      ref={sectionRef}
      className={cn("band-dark", "section-tight", styles.section, className)}
      aria-label={`Números da ${siteConfig.name}`}
    >
      <div className="container">
        <p className={styles.title}>{title}</p>

        <ul className={styles.list}>
          {items.map((item) => {
            const decimals = item.decimals ?? 0;
            const current = item.value * progress;
            const suffix = item.suffix ?? "";

            return (
              <li key={item.label} className={styles.item}>
                <span className={styles.value} aria-hidden="true">
                  <span className="tnum">{format(current, decimals)}</span>
                  <span className={styles.suffix}>{suffix}</span>
                </span>
                <span className="sr-only">{`${format(item.value, decimals)}${suffix} — ${item.label}`}</span>
                <span className={styles.label} aria-hidden="true">
                  {item.label}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

export default Stats;
