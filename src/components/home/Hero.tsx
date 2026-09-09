import Image from "next/image";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import { siteMedia } from "@/data/media";
import { cn } from "@/lib/cn";
import { formatNumber, pluralize } from "@/lib/format";
import { waMessage, whatsappUrl } from "@/services/whatsapp";
import styles from "./Hero.module.css";

/**
 * Primeira dobra da home: foto do pátio em tela cheia, promessa de venda e os
 * dois caminhos que convertem (ver estoque e WhatsApp).
 *
 * O painel de busca rápida entra logo abaixo, sobreposto: por isso o hero
 * reserva espaço no rodapé e nunca recorta o que passa por cima dele.
 */

export interface HeroProps {
  /** Veículos disponíveis no momento, para a faixa de prova social. */
  stockCount: number;
}

export function Hero({ stockCount }: HeroProps) {
  const photo = siteMedia.hero.main;

  return (
    <section className={cn("band-dark", styles.hero)} aria-labelledby="hero-titulo">
      <div className={styles.media}>
        <Image
          src={photo.url}
          alt={photo.alt}
          fill
          priority
          quality={85}
          sizes="100vw"
          className={styles.photo}
        />
        <span className={styles.scrim} aria-hidden="true" />
        <span className={styles.vignette} aria-hidden="true" />
      </div>

      <div className={cn("container", styles.inner)}>
        <p className={cn("eyebrow", styles.eyebrow)}>Seminovos selecionados em Curitiba</p>

        <h1 id="hero-titulo" className={styles.title}>
          <span className={styles.titleLine}>Encontre seu</span>
          <span className={styles.titleAccent}>próximo carro</span>
        </h1>

        <p className={styles.text}>
          Procedência conferida carro a carro, laudo cautelar em todo o estoque, 90 dias de garantia
          de motor e câmbio e transferência inclusa. Você escolhe; a burocracia é com a gente.
        </p>

        <div className={styles.actions}>
          <Button href="/estoque" variant="light" size="lg" iconRight="arrow-right">
            Ver estoque
          </Button>
          <Button
            href={whatsappUrl(waMessage.stock())}
            external
            variant="whatsapp"
            size="lg"
          >
            Falar pelo WhatsApp
          </Button>
        </div>

        <ul className={styles.proof}>
          <li className={styles.proofItem}>
            <span className={cn(styles.proofValue, "tnum")}>{formatNumber(stockCount)}</span>
            <span className={styles.proofLabel}>
              {pluralize(stockCount, "veículo no pátio", "veículos no pátio")}
            </span>
          </li>
          <li className={styles.proofItem}>
            <span className={cn(styles.proofValue, "tnum")}>16</span>
            <span className={styles.proofLabel}>anos de mercado</span>
          </li>
          <li className={styles.proofItem}>
            <span className={cn(styles.proofValue, "tnum")}>
              <Icon name="star-filled" size={16} className={styles.proofStar} />
              4,9
            </span>
            <span className={styles.proofLabel}>no Google</span>
          </li>
        </ul>
      </div>
    </section>
  );
}

export default Hero;
