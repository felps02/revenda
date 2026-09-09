import Button from "@/components/ui/Button";
import SectionHeading from "@/components/ui/SectionHeading";
import { cn } from "@/lib/cn";
import { waMessage, whatsappUrl } from "@/services/whatsapp";
import styles from "./Steps.module.css";

/** Os quatro passos entre a primeira visita ao site e a entrega da chave. */

interface Step {
  number: string;
  title: string;
  text: string;
}

const STEPS: Step[] = [
  {
    number: "01",
    title: "Escolha o carro no site",
    text: "Filtre por marca, preço ou parcela e veja fotos reais, ficha completa e o histórico de cada veículo.",
  },
  {
    number: "02",
    title: "Agende o test drive",
    text: "Marque o horário pelo WhatsApp. O carro fica separado, limpo e abastecido esperando por você.",
  },
  {
    number: "03",
    title: "Simule o financiamento",
    text: "Sua proposta vai para cinco bancos parceiros e a melhor condição volta em até 24 horas.",
  },
  {
    number: "04",
    title: "Leve para casa",
    text: "Assinatura, transferência e garantia de 90 dias por nossa conta. Você sai dirigindo no mesmo dia.",
  },
];

export function Steps() {
  return (
    <section className={cn("section", styles.section)} aria-labelledby="passos-titulo">
      <div className="container">
        <SectionHeading
          id="passos-titulo"
          eyebrow="Como funciona"
          title="Quatro passos até a chave na sua mão"
          description="Sem letra miúda e sem retrabalho: você acompanha cada etapa com um consultor só seu."
        />

        <ol className={styles.list}>
          {STEPS.map((step) => (
            <li key={step.number} className={styles.item} data-reveal>
              <span className={styles.number} aria-hidden="true">
                {step.number}
              </span>
              <h3 className={styles.title}>{step.title}</h3>
              <p className={styles.text}>{step.text}</p>
            </li>
          ))}
        </ol>

        <div className={styles.cta}>
          <p className={styles.ctaText}>
            Começa agora: escolha o carro no estoque ou chame um consultor para separar as opções
            dentro do seu orçamento.
          </p>
          <div className={styles.ctaActions}>
            <Button href="/estoque" variant="primary" iconRight="arrow-right">
              Ver o estoque
            </Button>
            <Button href={whatsappUrl(waMessage.generic())} external variant="whatsapp">
              Falar com um consultor
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Steps;
