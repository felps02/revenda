import { cn } from "@/lib/cn";
import { formatNumber, pluralize } from "@/lib/format";
import Icon from "./Icon";
import styles from "./Rating.module.css";

/**
 * Estrelas de avaliacao com suporte a fracao (4,5 = quatro estrelas e meia).
 * A camada preenchida e recortada por largura, entao qualquer nota funciona.
 */

const STARS = [0, 1, 2, 3, 4];

export interface RatingProps {
  value: number;
  size?: number;
  showValue?: boolean;
  reviews?: number;
  className?: string;
}

export function Rating({ value, size = 16, showValue = false, reviews, className }: RatingProps) {
  const clamped = Math.min(5, Math.max(0, Number.isFinite(value) ? value : 0));
  const rounded = Number(clamped.toFixed(1));
  const percent = (clamped / 5) * 100;
  const label =
    reviews === undefined
      ? `Nota ${formatNumber(rounded)} de 5`
      : `Nota ${formatNumber(rounded)} de 5, ${formatNumber(reviews)} ${pluralize(reviews, "avaliação", "avaliações")}`;

  return (
    <span className={cn(styles.rating, className)} role="img" aria-label={label}>
      <span className={styles.stars}>
        <span className={styles.track}>
          {STARS.map((index) => (
            <Icon key={index} name="star" size={size} className={styles.star} />
          ))}
        </span>
        <span className={styles.fill} style={{ width: `${percent}%` }}>
          {STARS.map((index) => (
            <Icon key={index} name="star-filled" size={size} className={styles.star} />
          ))}
        </span>
      </span>

      {showValue ? <span className={cn(styles.value, "tnum")}>{formatNumber(rounded)}</span> : null}

      {reviews !== undefined ? (
        <span className={styles.reviews}>
          ({formatNumber(reviews)} {pluralize(reviews, "avaliação", "avaliações")})
        </span>
      ) : null}
    </span>
  );
}

export default Rating;
