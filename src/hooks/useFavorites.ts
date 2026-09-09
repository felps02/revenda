"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "marchetti:favoritos";
const SYNC_EVENT = "marchetti:favoritos:change";

function read(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

function write(ids: string[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    /* modo privado / cota cheia: favoritos seguem so na memoria da aba */
  }
  window.dispatchEvent(new CustomEvent(SYNC_EVENT, { detail: ids }));
}

/**
 * Favoritos do visitante (localStorage), sincronizados entre todos os
 * componentes montados e entre abas. `hydrated` evita divergencia SSR/CSR.
 */
export function useFavorites() {
  const [ids, setIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setIds(read());
    setHydrated(true);

    const sync = () => setIds(read());
    const onCustom = (event: Event) => {
      const detail = (event as CustomEvent<string[]>).detail;
      setIds(Array.isArray(detail) ? detail : read());
    };

    window.addEventListener(SYNC_EVENT, onCustom);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(SYNC_EVENT, onCustom);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const toggle = useCallback((id: string) => {
    const current = read();
    const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
    write(next);
    setIds(next);
    return next.includes(id);
  }, []);

  const remove = useCallback((id: string) => {
    const next = read().filter((item) => item !== id);
    write(next);
    setIds(next);
  }, []);

  const clear = useCallback(() => {
    write([]);
    setIds([]);
  }, []);

  const isFavorite = useCallback((id: string) => ids.includes(id), [ids]);

  return { ids, count: ids.length, isFavorite, toggle, remove, clear, hydrated };
}
