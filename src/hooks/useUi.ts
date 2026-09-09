"use client";

import { useEffect, useRef, useState } from "react";

/** Media query reativa (usada para trocar filtros por drawer no mobile). */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [query]);

  return matches;
}

/** Trava o scroll do body enquanto um drawer/modal estiver aberto. */
export function useLockBodyScroll(locked: boolean): void {
  useEffect(() => {
    if (!locked) return;
    const { body } = document;
    const previousOverflow = body.style.overflow;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    body.style.overflow = "hidden";
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;
    body.dataset.scrollLocked = "true";
    return () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = "";
      delete body.dataset.scrollLocked;
    };
  }, [locked]);
}

/** Fecha popovers ao clicar fora. */
export function useOnClickOutside<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  handler: () => void,
  enabled = true,
): void {
  useEffect(() => {
    if (!enabled) return;
    const listener = (event: MouseEvent | TouchEvent) => {
      const element = ref.current;
      if (!element || element.contains(event.target as Node)) return;
      handler();
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler, enabled]);
}

/** Fecha com Esc. */
export function useEscapeKey(handler: () => void, enabled = true): void {
  useEffect(() => {
    if (!enabled) return;
    const listener = (event: KeyboardEvent) => {
      if (event.key === "Escape") handler();
    };
    document.addEventListener("keydown", listener);
    return () => document.removeEventListener("keydown", listener);
  }, [handler, enabled]);
}

export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timeout);
  }, [value, delay]);
  return debounced;
}

/** Detecta se a pagina saiu do topo (header muda de estado). */
export function useScrolled(threshold = 24): boolean {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return scrolled;
}

/**
 * Revela elementos com [data-reveal] quando entram na viewport.
 * Microinteracao discreta: sobe 18px e faz fade, uma vez so.
 */
export function useReveal<T extends HTMLElement>(): React.RefObject<T | null> {
  const ref = useRef<T>(null);

  useEffect(() => {
    const root = ref.current ?? document.body;
    const targets = root.querySelectorAll<HTMLElement>("[data-reveal]");
    if (targets.length === 0) return;

    if (
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      targets.forEach((target) => target.setAttribute("data-reveal", "in"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.setAttribute("data-reveal", "in");
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );

    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, []);

  return ref;
}
