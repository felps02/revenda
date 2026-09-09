import { siteConfig } from "@/config/site";
import { cn } from "@/lib/cn";
import styles from "./Logo.module.css";

interface LogoProps {
  /** "dark" = tinta escura sobre fundo claro. "light" = tinta clara sobre faixa escura. */
  tone?: "light" | "dark";
  /** Só o selo do monograma (usado no header do celular). */
  compact?: boolean;
  className?: string;
}

/**
 * Marca da revenda desenhada em SVG (nunca imagem externa).
 * O tamanho pode ser ajustado por quem usa, sem prop nova, via custom properties:
 * `--logo-seal` (lado do selo) e `--logo-word` (corpo do wordmark).
 */
export default function Logo({ tone = "dark", compact = false, className }: LogoProps) {
  return (
    <span className={cn(styles.logo, tone === "light" ? styles.light : styles.dark, className)}>
      <svg className={styles.seal} viewBox="0 0 44 44" aria-hidden="true" focusable="false">
        <rect className={styles.sealBody} width="44" height="44" rx="12" />
        <rect className={styles.sealEdge} x="0.75" y="0.75" width="42.5" height="42.5" rx="11.25" />
        <g className={styles.mark}>
          <path d="M8.6 26V12.4l5.95 7.3 5.95-7.3V26" />
          <path d="M23.5 26V12.4l5.95 7.3 5.95-7.3V26" />
        </g>
        <rect className={styles.bar} x="8.6" y="29.8" width="13.2" height="2.2" rx="1.1" />
      </svg>

      {compact ? (
        <span className="sr-only">{siteConfig.name}</span>
      ) : (
        <span className={styles.lockup}>
          <span className={styles.wordmark}>MARCHETTI</span>
          <span className={styles.tagline}>
            <span>MOTORS</span>
            <span className={styles.taglineExtra}>
              <span className={styles.dot} aria-hidden="true">
                ·
              </span>
              <span>SEMINOVOS PREMIUM</span>
            </span>
          </span>
        </span>
      )}
    </span>
  );
}
