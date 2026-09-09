"use client";

import { useState } from "react";
import Icon from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { useFavorites } from "@/hooks/useFavorites";
import styles from "./FavoriteButton.module.css";

/**
 * Botao de favoritar do visitante (salvo no navegador).
 *
 * Enquanto o localStorage nao foi lido (`hydrated`), o botao renderiza o estado
 * neutro - identico ao do servidor - para nao quebrar a hidratacao.
 */

export interface FavoriteButtonProps {
  vehicleId: string;
  variant?: "floating" | "inline";
  withLabel?: boolean;
  className?: string;
}

const VARIANT_CLASS: Record<"floating" | "inline", string> = {
  floating: styles.floating,
  inline: styles.inline,
};

export function FavoriteButton({
  vehicleId,
  variant = "floating",
  withLabel = false,
  className,
}: FavoriteButtonProps) {
  const { isFavorite, toggle, hydrated } = useFavorites();
  const [bumping, setBumping] = useState(false);

  const active = hydrated && isFavorite(vehicleId);
  const label = active ? "Remover dos favoritos" : "Salvar nos favoritos";

  const handleClick = () => {
    const saved = toggle(vehicleId);
    if (saved) setBumping(true);
  };

  return (
    <button
      type="button"
      className={cn(
        styles.root,
        VARIANT_CLASS[variant],
        active ? styles.active : undefined,
        className,
      )}
      onClick={handleClick}
      aria-pressed={active}
      aria-label={withLabel ? undefined : label}
      title={label}
    >
      <span
        className={cn(styles.icon, bumping ? styles.bump : undefined)}
        onAnimationEnd={() => setBumping(false)}
      >
        <Icon name={active ? "heart-filled" : "heart"} size={variant === "floating" ? 19 : 18} />
      </span>
      {withLabel ? <span className={styles.label}>{active ? "Salvo" : "Salvar"}</span> : null}
    </button>
  );
}

export default FavoriteButton;
