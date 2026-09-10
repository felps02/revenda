import Link from "next/link";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import { formatCurrency, formatNumber } from "@/lib/format";
import { requireSession } from "@/lib/session";
import { isDatabaseConfigured } from "@/services/inventoryStore";
import { vehicleRepository } from "@/services/vehicleRepository";
import VehicleTable from "./VehicleTable";
import styles from "./painel.module.css";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  await requireSession();

  const vehicles = await vehicleRepository.all();
  const available = vehicles.filter((vehicle) => vehicle.status === "disponivel");
  const reserved = vehicles.filter((vehicle) => vehicle.status === "reservado");
  const sold = vehicles.filter((vehicle) => vehicle.status === "vendido");
  const total = available.reduce((sum, vehicle) => sum + vehicle.price, 0);

  return (
    <>
      <div className={styles.header}>
        <div>
          <h1>Estoque</h1>
          <p>Cadastre, edite e mude o status dos veículos do site.</p>
        </div>
        <Button href="/admin/veiculos/novo" size="lg" icon="plus">
          Novo veículo
        </Button>
      </div>

      {!isDatabaseConfigured() ? (
        <p className={styles.notice} role="status">
          <Icon name="info" size={18} />
          <span>
            Rodando com o arquivo <code>data/estoque.json</code>, que serve para testar no seu computador. Ao publicar
            na Vercel, defina <code>DATABASE_URL</code> para os cadastros irem para o banco.
          </span>
        </p>
      ) : null}

      <ul className={styles.stats}>
        <li>
          <span>Disponíveis</span>
          <strong className="tnum">{formatNumber(available.length)}</strong>
        </li>
        <li>
          <span>Reservados</span>
          <strong className="tnum">{formatNumber(reserved.length)}</strong>
        </li>
        <li>
          <span>Vendidos</span>
          <strong className="tnum">{formatNumber(sold.length)}</strong>
        </li>
        <li>
          <span>Valor no pátio</span>
          <strong className="tnum">{formatCurrency(total)}</strong>
        </li>
      </ul>

      {vehicles.length === 0 ? (
        <div className={styles.empty}>
          <Icon name="car" size={40} />
          <h2>Nenhum veículo cadastrado</h2>
          <p>Cadastre o primeiro carro e ele aparece no site na hora.</p>
          <Button href="/admin/veiculos/novo" size="lg" icon="plus">
            Cadastrar veículo
          </Button>
        </div>
      ) : (
        <VehicleTable vehicles={vehicles} />
      )}

      <p className={styles.help}>
        Precisa de ajuda? O passo a passo de publicação está em{" "}
        <Link href="https://github.com/felps02/revenda#painel-administrativo" target="_blank" rel="noopener noreferrer">
          README do projeto
        </Link>
        .
      </p>
    </>
  );
}
