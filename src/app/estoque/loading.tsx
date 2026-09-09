import Skeleton from "@/components/ui/Skeleton";
import styles from "./page.module.css";

export default function EstoqueLoading() {
  return (
    <div className="container section-tight">
      <Skeleton width="220px" height="14px" />
      <div style={{ height: "var(--sp-5)" }} />
      <Skeleton width="min(420px, 80%)" height="42px" />
      <div style={{ height: "var(--sp-3)" }} />
      <Skeleton width="min(320px, 60%)" height="18px" />

      <div className={styles.loadingGrid}>
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className={styles.loadingCard}>
            <Skeleton height="200px" radius="var(--r-lg)" />
            <Skeleton width="70%" height="20px" />
            <Skeleton width="50%" height="14px" />
            <Skeleton width="40%" height="26px" />
            <Skeleton height="44px" radius="var(--r-sm)" />
          </div>
        ))}
      </div>
    </div>
  );
}
