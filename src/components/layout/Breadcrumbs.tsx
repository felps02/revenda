import Link from "next/link";
import Icon from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import styles from "./Breadcrumbs.module.css";

interface BreadcrumbsProps {
  items: { label: string; href?: string }[];
  /** "dark" = trilha escura sobre fundo claro. "light" = trilha clara sobre faixa grafite. */
  tone?: "light" | "dark";
  className?: string;
}

export default function Breadcrumbs({ items, tone = "dark", className }: BreadcrumbsProps) {
  if (items.length === 0) return null;

  return (
    <nav
      className={cn(styles.root, tone === "light" ? styles.light : styles.dark, className)}
      aria-label="Trilha de navegação"
    >
      <ol className={styles.list}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={`${item.href ?? "item"}-${item.label}`} className={styles.item}>
              {item.href && !isLast ? (
                <Link href={item.href} className={styles.link}>
                  {item.label}
                </Link>
              ) : (
                <span className={styles.current} aria-current={isLast ? "page" : undefined}>
                  {item.label}
                </span>
              )}

              {isLast ? null : (
                <span className={styles.separator} aria-hidden="true">
                  <Icon name="chevron-right" size={14} />
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
