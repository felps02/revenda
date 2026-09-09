import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import Icon, { type IconName } from "./Icon";
import styles from "./Badge.module.css";

/** Selo curto: "Único dono", "IPVA pago", "Reservado", "-8% no preço". */

export type BadgeTone = "bronze" | "neutral" | "success" | "alert" | "dark" | "outline";

export interface BadgeProps {
  tone?: BadgeTone;
  size?: "sm" | "md";
  icon?: IconName;
  children: ReactNode;
  className?: string;
  title?: string;
}

export function Badge({
  tone = "neutral",
  size = "sm",
  icon,
  children,
  className,
  title,
}: BadgeProps) {
  return (
    <span className={cn(styles.badge, styles[tone], styles[size], className)} title={title}>
      {icon ? <Icon name={icon} size={size === "sm" ? 12 : 14} className={styles.icon} /> : null}
      <span className={styles.text}>{children}</span>
    </span>
  );
}

export default Badge;
