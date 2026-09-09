import Image from "next/image";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import { siteConfig } from "@/config/site";
import { siteMedia } from "@/data/media";
import { cn } from "@/lib/cn";
import { whatsappUrl } from "@/services/whatsapp";
import styles from "./SellCta.module.css";

/**
 * Faixa escura de troca/venda. No desktop a foto ocupa a metade direita;
 * no celular ela vira fundo, com véu forte para o texto continuar legível.
 */

const BULLETS = [
  "Avaliação completa em até 24 horas, na loja ou por fotos",
  "Pagamento à vista ou o valor abatido direto na troca",
  "Quitação de financiamento e transferência por nossa conta",
];

const WA_MESSAGE = `Olá! Quero avaliar meu carro para venda ou troca na ${siteConfig.name}. Posso enviar as fotos por aqui?`;

export function SellCta() {
  const photo = siteMedia.tradeIn;

  return (
    <section className={cn("band-dark", styles.section)} aria-labelledby="troca-titulo">
      <div className={styles.media}>
        <Image
          src={photo.url}
          alt={photo.alt}
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className={styles.photo}
        />
        <span className={styles.scrim} aria-hidden="true" />
      </div>

      <div className={cn("container", styles.inner)}>
        <div className={styles.content}>
          <p className="eyebrow">Troca ou venda</p>

          <h2 id="troca-titulo" className={styles.title}>
            Quer trocar ou vender seu carro?
          </h2>

          <p className={styles.text}>
            Avaliamos o seu usado com a tabela do dia e a procura real do mercado de Curitiba.
            Sem burocracia, sem consignação e sem prender o seu carro no pátio.
          </p>

          <ul className={styles.bullets}>
            {BULLETS.map((item) => (
              <li key={item} className={styles.bullet}>
                <Icon name="check" size={18} className={styles.bulletIcon} />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <div className={styles.actions}>
            <Button href="/avaliacao" variant="light" size="lg">
              Quero avaliar meu carro
            </Button>
            <Button href={whatsappUrl(WA_MESSAGE)} external variant="whatsapp" size="lg">
              Enviar fotos pelo WhatsApp
            </Button>
          </div>

          <p className={styles.note}>
            Avaliação gratuita e sem compromisso, de segunda a sábado.
          </p>
        </div>
      </div>
    </section>
  );
}

export default SellCta;
