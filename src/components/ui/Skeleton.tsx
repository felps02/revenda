import { cn } from "@/lib/cn";
import styles from "./Skeleton.module.css";

/** Bloco de carregamento. Use com o mesmo tamanho do conteudo que vai entrar. */

export interface SkeletonProps {
  width?: string;
  height?: string;
  radius?: string;
  className?: string;
}

export function Skeleton({
  width = "100%",
  height = "1rem",
  radius = "var(--r-sm)",
  className,
}: SkeletonProps) {
  return (
    <span
      className={cn(styles.skeleton, className)}
      style={{ width, height, borderRadius: radius }}
      aria-hidden="true"
    />
  );
}

export default Skeleton;
