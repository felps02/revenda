import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import styles from "./SectionHeading.module.css";

/**
 * Cabecalho padrao das secoes: microlabel bronze, titulo em display e
 * (opcional) uma acao alinhada a direita no desktop.
 */

export interface SectionHeadingProps {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  tone?: "light" | "dark";
  action?: ReactNode;
  as?: "h1" | "h2" | "h3";
  className?: string;
  id?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  tone = "light",
  action,
  as = "h2",
  className,
  id,
}: SectionHeadingProps) {
  const Heading = as;

  return (
    <div
      className={cn(
        styles.root,
        align === "center" ? styles.center : styles.left,
        tone === "dark" ? styles.dark : undefined,
        action ? styles.withAction : undefined,
        className,
      )}
    >
      <div className={styles.text}>
        {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
        <Heading id={id} className={styles.title}>
          {title}
        </Heading>
        {description ? <p className={cn("lead", styles.description)}>{description}</p> : null}
      </div>
      {action ? <div className={styles.action}>{action}</div> : null}
    </div>
  );
}

export default SectionHeading;
