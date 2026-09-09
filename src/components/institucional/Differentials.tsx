import { cn } from "@/lib/cn";
import Icon, { type IconName } from "@/components/ui/Icon";
import SectionHeading from "@/components/ui/SectionHeading";
import styles from "./Differentials.module.css";

/** Os seis compromissos que a loja assume em toda venda. */

export interface Differential {
  icon: IconName;
  title: string;
  text: string;
}

const DEFAULT_ITEMS: Differential[] = [
  {
    icon: "shield",
    title: "Laudo cautelar em todos os veículos",
    text: "Empresa independente checa chassi, motor, sinistro e leilão. O laudo vai junto do anúncio, antes de você perguntar.",
  },
  {
    icon: "badge-check",
    title: "Garantia de 90 dias de motor e câmbio",
    text: "Por escrito na nota, sem limite de quilometragem, com atendimento na nossa própria oficina no Batel.",
  },
  {
    icon: "calculator",
    title: "Preço pela tabela FIPE, com histórico",
    text: "Mostramos a FIPE do mês, o histórico de preço do modelo e por que este carro está acima ou abaixo dela.",
  },
  {
    icon: "engine",
    title: "Oficina própria e revisão antes da entrega",
    text: "Checagem de 120 itens, óleo e filtros trocados quando necessário e higienização completa antes da chave sair.",
  },
  {
    icon: "key",
    title: "Transferência e emplacamento inclusos",
    text: "Vistoria, despachante e Detran-PR por nossa conta. Você recebe o documento em casa, já no seu nome.",
  },
  {
    icon: "calendar",
    title: "Test drive com hora marcada, sem compromisso",
    text: "Você agenda pelo WhatsApp, o carro fica separado, lavado e abastecido — e ninguém vai ficar no seu pé.",
  },
];

export interface DifferentialsProps {
  items?: Differential[];
  className?: string;
}

export function Differentials({ items = DEFAULT_ITEMS, className }: DifferentialsProps) {
  return (
    <section className={cn("section", styles.section, className)} aria-labelledby="diferenciais">
      <div className="container">
        <SectionHeading
          id="diferenciais"
          eyebrow="Por que aqui"
          title="O que está incluído em toda venda"
          description="Nada aqui é cortesia de campanha: são as seis coisas que a loja entrega em qualquer carro do pátio, do hatch de R$ 60 mil ao sedã alemão."
        />

        <ul className={styles.grid}>
          {items.map((item) => (
            <li key={item.title} className={styles.card}>
              <span className={styles.icon}>
                <Icon name={item.icon} size={22} />
              </span>
              <h3 className={styles.title}>{item.title}</h3>
              <p className={styles.text}>{item.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default Differentials;
