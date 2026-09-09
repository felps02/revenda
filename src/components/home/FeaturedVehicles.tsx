import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import SectionHeading from "@/components/ui/SectionHeading";
import VehicleGrid from "@/components/vehicle/VehicleGrid";
import { cn } from "@/lib/cn";
import type { Vehicle } from "@/types";
import styles from "./FeaturedVehicles.module.css";

/**
 * Vitrine dos destaques. No celular a grade vira carrossel com encaixe
 * horizontal (CSS puro, sem estado); do tablet para cima volta a ser grade.
 */

export interface FeaturedVehiclesProps {
  vehicles: Vehicle[];
}

export function FeaturedVehicles({ vehicles }: FeaturedVehiclesProps) {
  if (vehicles.length === 0) return null;

  return (
    <section className={cn("section", styles.section)} aria-labelledby="destaques-titulo">
      <div className="container">
        <SectionHeading
          id="destaques-titulo"
          eyebrow="Estoque"
          title="Destaques da semana"
          description="Carros que acabaram de passar pela revisão de entrega e costumam sair rápido do pátio."
          action={
            <Button href="/estoque" variant="outline" iconRight="arrow-right">
              Ver todo o estoque
            </Button>
          }
        />

        <VehicleGrid
          vehicles={vehicles}
          columns={3}
          priorityCount={0}
          className={styles.rail}
        />

        {vehicles.length > 1 ? (
          <p className={styles.hint}>
            <Icon name="arrow-right" size={16} className={styles.hintIcon} />
            Arraste para o lado para ver os outros destaques
          </p>
        ) : null}
      </div>
    </section>
  );
}

export default FeaturedVehicles;
