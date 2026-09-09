import type { ReactNode } from "react";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { waMessage, whatsappUrl } from "@/services/whatsapp";
import type { Vehicle } from "@/types";
import VehicleCard from "./VehicleCard";
import styles from "./VehicleGrid.module.css";

/**
 * Grade da vitrine: 1 coluna no celular, 2 no tablet, 3 no desktop e 4 no
 * monitor largo (quando pedido). As primeiras fotos entram com `priority`
 * porque sao as unicas visiveis sem rolar a pagina.
 */

export interface VehicleGridProps {
  vehicles: Vehicle[];
  priorityCount?: number;
  columns?: 2 | 3 | 4;
  empty?: ReactNode;
  className?: string;
}

const COLUMN_CLASS: Record<2 | 3 | 4, string> = {
  2: styles.cols2,
  3: styles.cols3,
  4: styles.cols4,
};

export function VehicleGrid({
  vehicles,
  priorityCount = 0,
  columns = 3,
  empty,
  className,
}: VehicleGridProps) {
  if (vehicles.length === 0) {
    if (empty) return <>{empty}</>;

    return (
      <div className={cn(styles.empty, className)}>
        <span className={styles.emptyIcon}>
          <Icon name="search" size={26} />
        </span>
        <h3 className={styles.emptyTitle}>Nenhum veículo encontrado</h3>
        <p className={styles.emptyText}>
          Nenhum carro do pátio combina com esses filtros. Limpe alguma marca ou amplie a faixa
          de preço e de ano — o estoque gira toda semana e há carros chegando antes de irem
          para a vitrine.
        </p>
        <div className={styles.emptyActions}>
          <Button variant="outline" href="/estoque" icon="car">
            Ver todo o estoque
          </Button>
          <Button variant="whatsapp" href={whatsappUrl(waMessage.stock())} external>
            Procurar para mim
          </Button>
        </div>
      </div>
    );
  }

  return (
    <ul className={cn(styles.grid, COLUMN_CLASS[columns], className)}>
      {vehicles.map((vehicle, index) => (
        <li key={vehicle.id} className={styles.item}>
          <VehicleCard vehicle={vehicle} priority={index < priorityCount} />
        </li>
      ))}
    </ul>
  );
}

export default VehicleGrid;
