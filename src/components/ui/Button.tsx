"use client";

import type { MouseEvent, ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import Icon, { type IconName } from "./Icon";
import styles from "./Button.module.css";

/**
 * Botao unico do site. Vira <button>, <Link> ou <a> conforme as props,
 * mantendo exatamente a mesma aparencia em fundo claro e escuro.
 */

export type ButtonVariant = "primary" | "dark" | "outline" | "ghost" | "whatsapp" | "light";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Com href o botao vira link de navegacao. */
  href?: string;
  /** Link para fora do site: abre em nova aba com rel seguro. */
  external?: boolean;
  icon?: IconName;
  iconRight?: IconName;
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  type?: "button" | "submit";
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  className?: string;
  id?: string;
  title?: string;
  tabIndex?: number;
  "aria-label"?: string;
  "aria-expanded"?: boolean;
  "aria-controls"?: string;
  "aria-haspopup"?: boolean | "dialog" | "menu" | "listbox" | "true";
  children: ReactNode;
}

const ICON_SIZE: Record<ButtonSize, number> = { sm: 16, md: 18, lg: 20 };

export function Button({
  variant = "primary",
  size = "md",
  href,
  external = false,
  icon,
  iconRight,
  fullWidth = false,
  loading = false,
  disabled = false,
  type = "button",
  onClick,
  className,
  id,
  title,
  tabIndex,
  "aria-label": ariaLabel,
  "aria-expanded": ariaExpanded,
  "aria-controls": ariaControls,
  "aria-haspopup": ariaHasPopup,
  children,
}: ButtonProps) {
  const blocked = disabled || loading;
  // No verde do WhatsApp o icone da marca vem sozinho, sem precisar declarar.
  const leftIcon: IconName | undefined = icon ?? (variant === "whatsapp" ? "whatsapp" : undefined);
  const iconSize = ICON_SIZE[size];

  const shared = {
    className: cn(
      styles.root,
      styles[variant],
      styles[size],
      fullWidth ? styles.fullWidth : undefined,
      className,
    ),
    id,
    title,
    tabIndex,
    "aria-label": ariaLabel,
    "aria-expanded": ariaExpanded,
    "aria-controls": ariaControls,
    "aria-haspopup": ariaHasPopup,
  };

  const content = (
    <>
      {loading ? (
        <span className={styles.spinner} aria-hidden="true" />
      ) : leftIcon ? (
        <Icon name={leftIcon} size={iconSize} className={styles.icon} />
      ) : null}
      <span className={styles.label}>{children}</span>
      {iconRight ? <Icon name={iconRight} size={iconSize} className={styles.icon} /> : null}
    </>
  );

  if (href && !blocked) {
    if (external) {
      return (
        <a {...shared} href={href} target="_blank" rel="noopener noreferrer" onClick={onClick}>
          {content}
        </a>
      );
    }
    return (
      <Link {...shared} href={href} onClick={onClick}>
        {content}
      </Link>
    );
  }

  return (
    <button
      {...shared}
      type={type}
      disabled={blocked}
      aria-busy={loading || undefined}
      onClick={onClick}
    >
      {content}
    </button>
  );
}

export default Button;
