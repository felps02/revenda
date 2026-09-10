import Link from "next/link";
import VehicleForm from "@/components/admin/VehicleForm";
import Icon from "@/components/ui/Icon";
import { requireSession } from "@/lib/session";
import styles from "../veiculos.module.css";

export const dynamic = "force-dynamic";

export default async function NovoVeiculoPage() {
  await requireSession();

  return (
    <>
      <Link href="/admin" className={styles.back}>
        <Icon name="chevron-left" size={16} />
        <span>Voltar ao estoque</span>
      </Link>

      <h1 className={styles.title}>Cadastrar veículo</h1>
      <p className={styles.subtitle}>
        Assim que você salvar, o anúncio entra no site com URL própria, aparece nos filtros e no sitemap.
      </p>

      <VehicleForm />
    </>
  );
}
