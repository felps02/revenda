import Button from "@/components/ui/Button";
import SectionHeading from "@/components/ui/SectionHeading";
import VehicleGrid from "@/components/vehicle/VehicleGrid";
import { cn } from "@/lib/cn";
import type { Vehicle } from "@/types";
import styles from "./RelatedVehicles.module.css";

/** Faixa final da pagina do veiculo: carros do mesmo perfil ainda no patio. */

export interface RelatedVehiclesProps {
  vehicles: Vehicle[];
  title?: string;
  className?: string;
}

export function RelatedVehicles({
  vehicles,
  title = "Veículos parecidos",
  className,
}: RelatedVehiclesProps) {
  if (vehicles.length === 0) return null;

  return (
    <section className={cn("section", styles.root, className)}>
      <div className="container">
        <SectionHeading
          eyebrow="Continue olhando"
          title={title}
          description="Mesma faixa de preço e perfil de uso, com a mesma checagem de procedência."
          action={
            <Button variant="outline" size="sm" href="/estoque" iconRight="arrow-right">
              Ver todo o estoque
            </Button>
          }
        />
        <VehicleGrid vehicles={vehicles} columns={3} priorityCount={0} className={styles.grid} />
      </div>
    </section>
  );
}

export default RelatedVehicles;
