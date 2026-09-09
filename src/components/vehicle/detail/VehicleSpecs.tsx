import Icon, { type IconName } from "@/components/ui/Icon";
import { CATEGORY_LABELS } from "@/data/taxonomy";
import { cn } from "@/lib/cn";
import { formatMileage, formatNumber, formatYearPair } from "@/lib/format";
import type { BodyType, Vehicle } from "@/types";
import styles from "./VehicleSpecs.module.css";

/** Ficha tecnica do anuncio: grade de cartoes + linhas de procedencia. */

const BODY_ICON: Record<BodyType, IconName> = {
  SUV: "suv",
  Hatch: "hatch",
  Picape: "pickup",
  "Sedã": "car",
  "Cupê": "car",
  Perua: "car",
  Minivan: "car",
  "Conversível": "car",
};

interface SpecItem {
  icon: IconName;
  label: string;
  value: string;
  numeric?: boolean;
}

interface TrustItem {
  icon: IconName;
  title: string;
  text: string;
}

export interface VehicleSpecsProps {
  vehicle: Vehicle;
  className?: string;
}

export function VehicleSpecs({ vehicle, className }: VehicleSpecsProps) {
  const items: SpecItem[] = [
    {
      icon: "calendar",
      label: "Ano",
      value: formatYearPair(vehicle.manufactureYear, vehicle.year),
      numeric: true,
    },
    { icon: "gauge", label: "Quilometragem", value: formatMileage(vehicle.mileage), numeric: true },
    { icon: "gearbox", label: "Câmbio", value: vehicle.transmission },
    { icon: "fuel", label: "Combustível", value: vehicle.fuel },
    { icon: "paint", label: "Cor", value: vehicle.color },
    { icon: "door", label: "Portas", value: `${vehicle.doors} portas`, numeric: true },
    { icon: "engine", label: "Motor", value: vehicle.engine },
    {
      icon: "sparkles",
      label: "Potência",
      value: `${formatNumber(vehicle.power)} cv`,
      numeric: true,
    },
    { icon: "info", label: "Final da placa", value: String(vehicle.plateEnd), numeric: true },
    { icon: BODY_ICON[vehicle.body], label: "Carroceria", value: vehicle.body },
    { icon: "trophy", label: "Categoria", value: CATEGORY_LABELS[vehicle.category] },
    { icon: "key", label: "Código do anúncio", value: vehicle.id.toUpperCase(), numeric: true },
  ];

  const trust: TrustItem[] = [];
  if (vehicle.licensed) {
    trust.push({
      icon: "badge-check",
      title: "IPVA pago",
      text: "Licenciamento do ano em dia, sem multas nem débitos para transferir.",
    });
  }
  if (vehicle.singleOwner) {
    trust.push({
      icon: "users",
      title: "Único dono",
      text: "Um só proprietário desde o primeiro emplacamento, com histórico conferido.",
    });
  }
  if (vehicle.warranty) {
    trust.push({ icon: "shield", title: "Garantia", text: vehicle.warranty });
  }

  return (
    <div className={cn(styles.root, className)}>
      <dl className={styles.grid}>
        {items.map((item) => (
          <div key={item.label} className={styles.card}>
            <Icon name={item.icon} size={20} className={styles.icon} />
            <dt className={styles.label}>{item.label}</dt>
            <dd className={cn(styles.value, item.numeric ? "tnum" : undefined)}>{item.value}</dd>
          </div>
        ))}
      </dl>

      {trust.length > 0 ? (
        <ul className={styles.trust}>
          {trust.map((item) => (
            <li key={item.title} className={styles.trustItem}>
              <span className={styles.trustIcon}>
                <Icon name={item.icon} size={18} />
              </span>
              <span className={styles.trustText}>
                <strong className={styles.trustTitle}>{item.title}</strong>
                {item.text}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export default VehicleSpecs;
