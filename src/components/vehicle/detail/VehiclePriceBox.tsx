"use client";

import { useEffect, useRef, useState } from "react";
import Badge, { type BadgeTone } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Icon, { type IconName } from "@/components/ui/Icon";
import Modal from "@/components/ui/Modal";
import FinancingSimulator from "@/components/forms/FinancingSimulator";
import InterestForm from "@/components/forms/InterestForm";
import FavoriteButton from "@/components/vehicle/FavoriteButton";
import ShareButton from "@/components/vehicle/ShareButton";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/cn";
import { formatCurrency } from "@/lib/format";
import { vehicleFullTitle } from "@/lib/slug";
import { FINANCING, minDownPayment, previewInstallment } from "@/services/financing";
import { vehicleUrl, waMessage, whatsappUrl } from "@/services/whatsapp";
import type { Vehicle, VehicleStatus } from "@/types";
import styles from "./VehiclePriceBox.module.css";

/**
 * Caixa de conversao da pagina do veiculo: preco, parcela estimada, selos de
 * confianca e os tres caminhos de contato. No celular ela vira barra fixa
 * assim que o cartao sai da tela.
 */

interface StatusInfo {
  label: string;
  tone: BadgeTone;
  icon: IconName;
  note?: string;
}

const STATUS: Record<VehicleStatus, StatusInfo> = {
  disponivel: { label: "Disponível no pátio", tone: "success", icon: "check-circle" },
  reservado: {
    label: "Reservado",
    tone: "alert",
    icon: "clock",
    note: "Reserva em andamento. Entre na lista de espera: se o negócio não fechar, você é o primeiro a saber.",
  },
  vendido: {
    label: "Vendido",
    tone: "neutral",
    icon: "info",
    note: "Este carro já saiu do pátio. Fale com um consultor e avisamos quando chegar um parecido.",
  },
};

const SEALS: { icon: IconName; label: string }[] = [
  { icon: "shield", label: "Laudo cautelar aprovado" },
  { icon: "badge-check", label: "90 dias de garantia" },
  { icon: "key", label: "Transferência inclusa" },
];

export interface VehiclePriceBoxProps {
  vehicle: Vehicle;
  className?: string;
}

export function VehiclePriceBox({ vehicle, className }: VehiclePriceBoxProps) {
  const [interestOpen, setInterestOpen] = useState(false);
  const [financingOpen, setFinancingOpen] = useState(false);
  const [barVisible, setBarVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // A barra do celular so aparece depois que o cartao passa para cima da tela.
  useEffect(() => {
    const card = cardRef.current;
    if (!card || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        setBarVisible(!entry.isIntersecting && entry.boundingClientRect.top < 0);
      },
      { threshold: 0 },
    );
    observer.observe(card);
    return () => observer.disconnect();
  }, []);

  const status = STATUS[vehicle.status];
  const fullTitle = vehicleFullTitle(vehicle);
  const savings =
    vehicle.previousPrice && vehicle.previousPrice > vehicle.price
      ? vehicle.previousPrice - vehicle.price
      : 0;
  const downPayment = minDownPayment(vehicle.price);
  const installments = FINANCING.defaultInstallments;
  const installmentValue = previewInstallment(vehicle.price, installments);
  const waHref = whatsappUrl(waMessage.vehicle(vehicle));

  return (
    <aside className={cn(styles.root, className)}>
      <div ref={cardRef} className={styles.card}>
        <div className={styles.top}>
          <Badge tone={status.tone} size="md" icon={status.icon}>
            {status.label}
          </Badge>
          <span className={styles.code}>
            Código <span className="tnum">{vehicle.id.toUpperCase()}</span>
          </span>
        </div>

        {status.note ? <p className={styles.note}>{status.note}</p> : null}

        <div className={styles.priceBlock}>
          <span className={styles.priceLabel}>Preço à vista</span>
          <strong className={cn(styles.price, "tnum")}>{formatCurrency(vehicle.price)}</strong>
          {savings > 0 && vehicle.previousPrice ? (
            <div className={styles.savings}>
              <s className={cn(styles.previousPrice, "tnum")}>
                {formatCurrency(vehicle.previousPrice)}
              </s>
              <Badge tone="bronze" icon="sparkles">
                Economia de {formatCurrency(savings)}
              </Badge>
            </div>
          ) : null}
        </div>

        {vehicle.financingAvailable ? (
          <div className={styles.financing}>
            <p className={styles.financingLine}>
              Entrada de <strong className="tnum">{formatCurrency(downPayment)}</strong>
              {" + "}
              <strong className="tnum">
                {installments}x de {formatCurrency(installmentValue)}
              </strong>
            </p>
            <p className={styles.financingNote}>
              Parcela estimada com taxa média de mercado. O valor final sai na análise de crédito.
            </p>
          </div>
        ) : null}

        <div className={styles.actions}>
          <Button
            variant="primary"
            size="lg"
            fullWidth
            iconRight="arrow-right"
            aria-haspopup="dialog"
            onClick={() => setInterestOpen(true)}
          >
            Tenho interesse
          </Button>
          <Button variant="whatsapp" size="lg" fullWidth href={waHref} external>
            Chamar no WhatsApp
          </Button>
          <Button
            variant="outline"
            size="lg"
            fullWidth
            icon="calculator"
            aria-haspopup="dialog"
            onClick={() => setFinancingOpen(true)}
          >
            Simular financiamento
          </Button>
        </div>

        <div className={styles.secondary}>
          <FavoriteButton vehicleId={vehicle.id} variant="inline" withLabel />
          <ShareButton url={vehicleUrl(vehicle)} title={fullTitle} variant="inline" withLabel />
        </div>

        <ul className={styles.seals}>
          {SEALS.map((seal) => (
            <li key={seal.label} className={styles.seal}>
              <Icon name={seal.icon} size={18} className={styles.sealIcon} />
              {seal.label}
            </li>
          ))}
        </ul>

        <a
          className={styles.address}
          href={siteConfig.address.mapsLink}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Icon name="map-pin" size={18} className={styles.addressIcon} />
          <span className={styles.addressText}>
            <span className={styles.addressLabel}>Onde ver o carro</span>
            {siteConfig.address.full}
            <span className={styles.addressLink}>
              Ver no mapa
              <Icon name="arrow-up-right" size={14} />
            </span>
          </span>
        </a>
      </div>

      <div
        className={cn(styles.bar, barVisible ? styles.barVisible : undefined)}
        aria-hidden={!barVisible}
      >
        <div className={styles.barPrice}>
          <span className={styles.barLabel}>Preço à vista</span>
          <strong className={cn(styles.barValue, "tnum")}>{formatCurrency(vehicle.price)}</strong>
        </div>
        <Button variant="whatsapp" size="md" href={waHref} external className={styles.barButton}>
          WhatsApp
        </Button>
      </div>

      <Modal
        open={interestOpen}
        onClose={() => setInterestOpen(false)}
        title="Tenho interesse"
        description={`${fullTitle} - código ${vehicle.id.toUpperCase()}`}
        size="md"
      >
        <InterestForm vehicle={vehicle} source="pagina-do-veiculo" />
      </Modal>

      <Modal
        open={financingOpen}
        onClose={() => setFinancingOpen(false)}
        title="Simular financiamento"
        description={fullTitle}
        size="lg"
      >
        <FinancingSimulator vehicle={vehicle} variant="compact" />
      </Modal>
    </aside>
  );
}

export default VehiclePriceBox;
