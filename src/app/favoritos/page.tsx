import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { buildMetadata } from "@/lib/seo";
import { vehicleRepository } from "@/services/vehicleRepository";
import FavoritesList from "./FavoritesList";
import styles from "./page.module.css";

export const metadata = buildMetadata({
  title: "Meus favoritos",
  description: "Os veículos que você salvou para comparar com calma.",
  path: "/favoritos",
  noIndex: true,
});

export default async function FavoritosPage() {
  const vehicles = await vehicleRepository.all();

  return (
    <div className={styles.page}>
      <div className="container">
        <Breadcrumbs items={[{ label: "Início", href: "/" }, { label: "Favoritos" }]} />
        <h1 className={styles.title}>Meus favoritos</h1>
        <p className={styles.subtitle}>
          A lista fica salva neste navegador — não precisa criar conta. Quando decidir, envie tudo de uma vez para um
          consultor pelo WhatsApp.
        </p>

        <FavoritesList vehicles={vehicles} />
      </div>
    </div>
  );
}
