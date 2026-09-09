import Icon, { type IconName } from "@/components/ui/Icon";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/cn";
import styles from "./TrustStrip.module.css";

/**
 * Faixa de garantias logo abaixo da busca: responde em uma linha as quatro
 * dúvidas que travam a compra de um seminovo.
 */

interface Seal {
  icon: IconName;
  title: string;
  line: string;
}

const SEALS: Seal[] = [
  {
    icon: "shield",
    title: "Laudo cautelar em todo carro",
    line: "Chassi, histórico de leilão e sinistro conferidos antes de anunciar.",
  },
  {
    icon: "badge-check",
    title: "90 dias de garantia",
    line: "Motor e câmbio cobertos em toda venda, sem taxa extra.",
  },
  {
    icon: "wallet",
    title: "Financiamento em até 24h",
    line: "Cinco bancos parceiros disputando a melhor taxa para você.",
  },
  {
    icon: "key",
    title: "Aceitamos seu usado na troca",
    line: "Avaliação na hora e o valor abatido direto no carro escolhido.",
  },
];

export function TrustStrip() {
  return (
    <section className={cn("band-alt", styles.section)} aria-label={`Garantias da ${siteConfig.name}`}>
      <div className="container">
        <ul className={styles.list}>
          {SEALS.map((seal) => (
            <li key={seal.title} className={styles.item} data-reveal>
              <span className={styles.circle}>
                <Icon name={seal.icon} size={24} />
              </span>
              <p className={styles.title}>{seal.title}</p>
              <p className={styles.line}>{seal.line}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default TrustStrip;
