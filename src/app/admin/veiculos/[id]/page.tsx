import Link from "next/link";
import { notFound } from "next/navigation";
import VehicleForm from "@/components/admin/VehicleForm";
import Icon from "@/components/ui/Icon";
import { requireSession } from "@/lib/session";
import { vehicleToDraft } from "@/lib/vehicleForm";
import { vehicleRepository } from "@/services/vehicleRepository";
import styles from "../veiculos.module.css";

export const dynamic = "force-dynamic";

export default async function EditarVeiculoPage({ params }: { params: Promise<{ id: string }> }) {
  await requireSession();

  const { id } = await params;
  const vehicle = await vehicleRepository.getById(id);

  if (!vehicle) notFound();

  return (
    <>
      <Link href="/admin" className={styles.back}>
        <Icon name="chevron-left" size={16} />
        <span>Voltar ao estoque</span>
      </Link>

      <div className={styles.headRow}>
        <div>
          <h1 className={styles.title}>
            {vehicle.brand} {vehicle.model}
          </h1>
          <p className={styles.subtitle}>
            {vehicle.version} · código {vehicle.id.toUpperCase()}
          </p>
        </div>

        <Link
          href={`/estoque/${vehicle.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.viewLink}
        >
          <Icon name="arrow-up-right" size={16} />
          <span>Ver no site</span>
        </Link>
      </div>

      <VehicleForm initial={vehicleToDraft(vehicle)} vehicleId={vehicle.id} />
    </>
  );
}
