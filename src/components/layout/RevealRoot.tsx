"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useReveal } from "@/hooks/useUi";

function RevealScope({ children }: { children: ReactNode }) {
  const ref = useReveal<HTMLDivElement>();
  return <div ref={ref}>{children}</div>;
}

/**
 * Liga as animações [data-reveal] da página.
 * A chave por rota remonta o escopo a cada navegação, para o observador
 * enxergar os elementos da página nova.
 */
export default function RevealRoot({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return <RevealScope key={pathname}>{children}</RevealScope>;
}
