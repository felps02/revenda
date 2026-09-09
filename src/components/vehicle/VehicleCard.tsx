import Image from "next/image";
import Link from "next/link";
import Badge, { type BadgeTone } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Icon, { type IconName } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import {
  formatCurrency,
  formatMileageShort,
  formatNumber,
  formatYearPair,
} from "@/lib/format";
import { vehicleFullTitle, vehicleTitle } from "@/lib/slug";
import { FINANCING, previewInstallment } from "@/services/financing";
import { waMessage, whatsappUrl } from "@/services/whatsapp";
import type { Vehicle } from "@/types";
import FavoriteButton from "./FavoriteButton";
import styles from "./VehicleCard.module.css";

/**
 * Anuncio do veiculo na vitrine.
 *
 * O card inteiro e clicavel: o link do titulo se estende por cima de tudo com
 * um `::after` (nenhum link fica aninhado dentro do outro). Favoritar, WhatsApp
 * e "Ver detalhes" ficam acima dessa camada e continuam funcionando sozinhos.
 */

export interface VehicleCardProps {
  vehicle: Vehicle;
  priority?: boolean;
  compact?: boolean;
  className?: string;
}

/** 1 coluna no celular, 2 no tablet, 3 no desktop, 4 no monitor largo. */
const PHOTO_SIZES =
  "(min-width: 1280px) 320px, (min-width: 1024px) 30vw, (min-width: 640px) 46vw, calc(100vw - 2.5rem)";

interface CardFlag {
  label: string;
  tone: BadgeTone;
  icon?: IconName;
}

/** No maximo dois selos: o que muda a decisao de compra vem primeiro. */
function buildFlags(vehicle: Vehicle): CardFlag[] {
  const flags: CardFlag[] = [];

  if (vehicle.status === "vendido") {
    flags.push({ label: "Vendido", tone: "dark" });
  } else if (vehicle.status === "reservado") {
    flags.push({ label: "Reservado", tone: "alert", icon: "clock" });
  }
  if (vehicle.featured) flags.push({ label: "Destaque", tone: "bronze", icon: "sparkles" });
  if (vehicle.singleOwner) flags.push({ label: "Único dono", tone: "neutral", icon: "key" });
  if (vehicle.licensed) flags.push({ label: "IPVA pago", tone: "neutral", icon: "badge-check" });

  return flags.slice(0, 2);
}

export function VehicleCard({
  vehicle,
  priority = false,
  compact = false,
  className,
}: VehicleCardProps) {
  const href = `/estoque/${vehicle.slug}`;
  const sold = vehicle.status === "vendido";
  const fullTitle = vehicleFullTitle(vehicle);

  const cover = vehicle.images[0];
  const second = vehicle.images[1];
  const photoCount = vehicle.images.length;

  const flags = buildFlags(vehicle);
  const previousPrice = vehicle.previousPrice ?? 0;
  const discount = previousPrice > vehicle.price ? previousPrice - vehicle.price : 0;
  const installment =
    vehicle.financingAvailable && !sold ? previewInstallment(vehicle.price) : 0;

  return (
    <article
      className={cn(styles.card, compact ? styles.compact : undefined, className)}
      aria-label={fullTitle}
    >
      <div className={cn(styles.media, sold ? styles.mediaSold : undefined)}>
        {cover ? (
          <Image
            src={cover.url}
            alt={cover.alt}
            fill
            sizes={PHOTO_SIZES}
            priority={priority}
            className={styles.photo}
          />
        ) : (
          <span className={styles.noPhoto}>
            <Icon name="car" size={30} />
          </span>
        )}

        {/* Segunda foto revelada em cross-fade no hover - troca so de CSS. */}
        {second && !sold ? (
          <Image
            src={second.url}
            alt=""
            fill
            sizes={PHOTO_SIZES}
            className={styles.photoHover}
          />
        ) : null}

        {flags.length > 0 ? (
          <div className={styles.flags}>
            {flags.map((flag) => (
              <Badge key={flag.label} tone={flag.tone} icon={flag.icon} className={styles.flag}>
                {flag.label}
              </Badge>
            ))}
          </div>
        ) : null}

        <FavoriteButton vehicleId={vehicle.id} variant="floating" className={styles.favorite} />

        {sold ? <span className={styles.soldTag}>Vendido</span> : null}

        {photoCount > 1 ? (
          <span className={styles.photoCount}>
            <Icon name="camera" size={14} />
            <span className="tnum">{formatNumber(photoCount)}</span>
            <span className="sr-only">fotos deste veículo</span>
          </span>
        ) : null}
      </div>

      <div className={styles.body}>
        <h3 className={styles.title}>
          <Link href={href} className={styles.titleLink}>
            {vehicleTitle(vehicle)}
          </Link>
        </h3>
        <p className={styles.version}>{vehicle.version}</p>

        <ul className={styles.specs}>
          <li className={styles.spec}>
            <Icon name="calendar" size={14} />
            <span className="sr-only">Ano&nbsp;</span>
            <span className="tnum">{formatYearPair(vehicle.manufactureYear, vehicle.year)}</span>
          </li>
          <li className={styles.spec}>
            <Icon name="gauge" size={14} />
            <span className="sr-only">Quilometragem&nbsp;</span>
            <span className="tnum">{formatMileageShort(vehicle.mileage)}</span>
          </li>
          <li className={styles.spec}>
            <Icon name="gearbox" size={14} />
            <span className="sr-only">Câmbio&nbsp;</span>
            {vehicle.transmission}
          </li>
          <li className={styles.spec}>
            <Icon name="fuel" size={14} />
            <span className="sr-only">Combustível&nbsp;</span>
            {vehicle.fuel}
          </li>
        </ul>

        <div className={styles.priceBlock}>
          <p className={styles.priceRow}>
            <span className={cn(styles.price, "tnum")}>{formatCurrency(vehicle.price)}</span>
            {discount > 0 ? (
              <span className={cn(styles.priceOld, "tnum")}>
                <span className="sr-only">Preço anterior&nbsp;</span>
                {formatCurrency(previousPrice)}
              </span>
            ) : null}
          </p>

          {discount > 0 ? (
            <Badge tone="bronze" icon="chevron-down" className={styles.discount}>
              {formatCurrency(discount)} abaixo
            </Badge>
          ) : null}

          {installment > 0 ? (
            <p className={styles.financing}>
              Financiamento a partir de{" "}
              <span className={cn(styles.installment, "tnum")}>
                {FINANCING.defaultInstallments}x de {formatCurrency(installment)}
              </span>
            </p>
          ) : null}
        </div>

        <div className={styles.footer}>
          {sold ? (
            <Button
              variant="outline"
              href={`/estoque?categoria=${vehicle.category}`}
              iconRight="arrow-right"
              fullWidth
            >
              Ver similares
            </Button>
          ) : (
            <>
              <Button variant="primary" href={href} fullWidth className={styles.detail}>
                Ver detalhes
              </Button>
              <Button
                variant="whatsapp"
                href={whatsappUrl(waMessage.vehicle(vehicle))}
                external
                className={styles.whats}
                aria-label="Falar sobre este veículo no WhatsApp"
              >
                <span className="sr-only">WhatsApp</span>
              </Button>
            </>
          )}
        </div>
      </div>
    </article>
  );
}

export default VehicleCard;
