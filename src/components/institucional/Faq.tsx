"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import { cn } from "@/lib/cn";
import { siteConfig } from "@/config/site";
import { waMessage, whatsappUrl } from "@/services/whatsapp";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import SectionHeading from "@/components/ui/SectionHeading";
import styles from "./Faq.module.css";

/**
 * Acordeao das duvidas de quem compra seminovo. Um painel aberto por vez,
 * com aria-expanded/aria-controls e navegacao por setas entre as perguntas.
 */

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

const DEFAULT_ITEMS: FaqItem[] = [
  {
    id: "garantia",
    question: "Como funciona a garantia de 90 dias?",
    answer:
      "Todo carro sai com 90 dias de garantia de motor e câmbio, contados da data da nota fiscal e sem limite de quilometragem. Se aparecer ruído ou falha nesses conjuntos, você agenda pelo WhatsApp e o carro entra na nossa oficina no Batel: o diagnóstico é gratuito e o reparo coberto não custa nada, peça nem mão de obra. Itens de desgaste — pastilhas, pneus, embreagem, bateria, palhetas — ficam de fora, e a gente informa o estado deles antes da compra.",
  },
  {
    id: "mecanico",
    question: "Posso levar o carro ao meu mecânico antes de fechar?",
    answer:
      "Pode, e a gente incentiva. Você agenda com o consultor, leva o carro à oficina da sua confiança em Curitiba ou região metropolitana e devolve no mesmo dia — um consultor vai junto, com a placa e a documentação em ordem. Se o seu mecânico apontar algo que não está na ficha, ou corrigimos antes da entrega ou abatemos do preço. Sempre por escrito, na proposta.",
  },
  {
    id: "troca",
    question: "Vocês aceitam meu carro na troca?",
    answer:
      "Aceitamos, inclusive carros que ainda estão financiados. A avaliação leva cerca de 40 minutos na loja: conferimos documentação, histórico de manutenção, laudo e fazemos o teste de rodagem. Você recebe a proposta na hora, com a tabela FIPE do modelo e a explicação de quanto estamos pagando acima ou abaixo dela e por quê. Fechando negócio, quitamos o financiamento em aberto direto com o banco e cuidamos da transferência.",
  },
  {
    id: "entrada",
    question: "Qual a entrada mínima do financiamento?",
    answer:
      "Trabalhamos com entrada a partir de 20% do valor do veículo — em um carro de R$ 100 mil, R$ 20 mil — e parcelamos em até 60 vezes. Entrada maior derruba a taxa, e o seu carro usado pode entrar como entrada. Enviamos a proposta para os cinco bancos parceiros de uma vez e a resposta costuma sair em até 24 horas úteis, com o custo efetivo total na mesa antes de qualquer assinatura.",
  },
  {
    id: "transferencia",
    question: "Quanto tempo demora a transferência?",
    answer:
      "Na compra à vista, com a documentação em dia, a transferência no Detran-PR fica pronta em 5 a 10 dias úteis. Financiado, some o registro do contrato: de 10 a 15 dias úteis. Vistoria, despachante e emplacamento são por nossa conta e o documento chega no seu endereço. Você sai dirigindo o carro no dia da entrega, com a documentação provisória em mãos, e recebe aviso por WhatsApp a cada etapa.",
  },
  {
    id: "outros-estados",
    question: "Vocês vendem para outros estados?",
    answer:
      "Vendemos — cerca de um em cada cinco carros sai de Curitiba. O processo é o mesmo: vídeo chamada mostrando o carro por inteiro, inclusive os detalhes que ninguém gosta de filmar, laudo cautelar e fotos em alta resolução por WhatsApp. O pagamento só acontece depois que você aprova tudo. O envio é por cegonha com seguro, com frete orçado conforme o destino, e a transferência já sai no seu nome, no seu estado.",
  },
];

export interface FaqProps {
  items?: FaqItem[];
  className?: string;
}

export function Faq({ items = DEFAULT_ITEMS, className }: FaqProps) {
  const [openId, setOpenId] = useState<string | null>(null);
  const triggersRef = useRef<Array<HTMLButtonElement | null>>([]);
  const baseId = useId();

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const total = items.length;
    let target = -1;

    if (event.key === "ArrowDown") target = (index + 1) % total;
    else if (event.key === "ArrowUp") target = (index - 1 + total) % total;
    else if (event.key === "Home") target = 0;
    else if (event.key === "End") target = total - 1;

    if (target < 0) return;
    event.preventDefault();
    triggersRef.current[target]?.focus();
  };

  return (
    <section className={cn("section", styles.section, className)} aria-labelledby="faq-titulo">
      <div className="container">
        <div className={styles.grid}>
          <div className={styles.intro}>
            <SectionHeading
              id="faq-titulo"
              eyebrow="Dúvidas frequentes"
              title="As perguntas que todo mundo faz antes de fechar"
              description="Se a sua não estiver aqui, chame no WhatsApp: um consultor responde em minutos no horário da loja."
            />

            <div className={styles.help}>
              <Button
                href={whatsappUrl(waMessage.generic())}
                external
                variant="whatsapp"
                size="md"
              >
                Tirar dúvida no WhatsApp
              </Button>
              <span className={styles.helpText}>
                Ou ligue para {siteConfig.contact.phoneDisplay}, de segunda a sábado.
              </span>
            </div>
          </div>

          <ul className={styles.list}>
            {items.map((item, index) => {
              const isOpen = openId === item.id;
              const buttonId = `${baseId}-pergunta-${index}`;
              const panelId = `${baseId}-resposta-${index}`;

              return (
                <li key={item.id} className={cn(styles.item, isOpen ? styles.itemOpen : undefined)}>
                  <h3 className={styles.heading}>
                    <button
                      type="button"
                      id={buttonId}
                      ref={(node) => {
                        triggersRef.current[index] = node;
                      }}
                      className={styles.trigger}
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => setOpenId(isOpen ? null : item.id)}
                      onKeyDown={(event) => onKeyDown(event, index)}
                    >
                      <span className={styles.question}>{item.question}</span>
                      <span className={styles.chevron} aria-hidden="true">
                        <Icon name="chevron-down" size={20} />
                      </span>
                    </button>
                  </h3>

                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={buttonId}
                    className={cn(styles.panel, isOpen ? styles.panelOpen : undefined)}
                  >
                    <div className={styles.panelInner}>
                      <p className={styles.answer}>{item.answer}</p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}

export default Faq;
