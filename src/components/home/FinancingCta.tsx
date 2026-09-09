import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/cn";
import { formatCurrency } from "@/lib/format";
import {
  FINANCING,
  FINANCING_DISCLAIMER,
  minDownPayment,
  previewInstallment,
} from "@/services/financing";
import styles from "./FinancingCta.module.css";

/**
 * Bloco de financiamento da home: o argumento à esquerda e uma simulação
 * de exemplo à direita, calculada pelas mesmas funções do simulador.
 */

export interface FinancingCtaProps {
  /** Preço médio do estoque, usado no cartão de exemplo. */
  samplePrice: number;
}

const DOWN_PERCENT = Math.round(FINANCING.minDownPaymentPercent * 100);
const MAX_INSTALLMENTS = Math.max(...FINANCING.installmentOptions);

export function FinancingCta({ samplePrice }: FinancingCtaProps) {
  const price = Number.isFinite(samplePrice) ? Math.round(samplePrice) : 0;
  const showSample = price > 0;
  const downPayment = minDownPayment(price);
  const installments = FINANCING.defaultInstallments;
  const installmentValue = previewInstallment(price, installments);

  return (
    <section className={cn("section", styles.section)} aria-labelledby="financiamento-titulo">
      <div className={cn("container", styles.inner)}>
        <div className={styles.content}>
          <p className="eyebrow">Financiamento</p>

          <h2 id="financiamento-titulo" className={styles.title}>
            Aprovação em até 24 horas, com a taxa que o banco realmente te dá
          </h2>

          <p className={styles.text}>
            Enviamos a sua proposta para todos os bancos parceiros no mesmo dia e apresentamos as
            condições lado a lado. Você escolhe o prazo e a parcela que cabem no mês.
          </p>

          <ul className={styles.points}>
            <li className={styles.point}>
              <Icon name="check" size={18} className={styles.pointIcon} />
              <span>Entrada a partir de {DOWN_PERCENT}% do valor do veículo</span>
            </li>
            <li className={styles.point}>
              <Icon name="check" size={18} className={styles.pointIcon} />
              <span>Parcelamento em até {MAX_INSTALLMENTS}x, com a primeira para 30 dias</span>
            </li>
            <li className={styles.point}>
              <Icon name="check" size={18} className={styles.pointIcon} />
              <span>Análise sem custo e sem compromisso, direto pelo site</span>
            </li>
          </ul>

          <div className={styles.partners}>
            <span className={styles.partnersLabel}>Bancos parceiros</span>
            <ul className={styles.partnersList}>
              {siteConfig.financing.partners.map((partner) => (
                <li key={partner} className={styles.partner}>
                  {partner}
                </li>
              ))}
            </ul>
          </div>

          <Button href="/financiamento" variant="primary" size="lg" icon="calculator">
            Simular financiamento
          </Button>
        </div>

        {showSample ? (
          <aside className={styles.card} aria-label="Exemplo de simulação de financiamento">
            <header className={styles.cardTop}>
              <span className={styles.cardLabel}>Exemplo de simulação</span>
              <Icon name="calculator" size={20} className={styles.cardIcon} />
            </header>

            <dl className={styles.rows}>
              <div className={styles.row}>
                <dt className={styles.rowLabel}>Veículo</dt>
                <dd className={cn(styles.rowValue, "tnum")}>{formatCurrency(price)}</dd>
              </div>
              <div className={styles.row}>
                <dt className={styles.rowLabel}>Entrada ({DOWN_PERCENT}%)</dt>
                <dd className={cn(styles.rowValue, "tnum")}>{formatCurrency(downPayment)}</dd>
              </div>
            </dl>

            <div className={styles.installment}>
              <span className={styles.installmentLabel}>Parcela estimada</span>
              <p className={cn(styles.installmentValue, "tnum")}>
                <span className={styles.installmentCount}>{installments}x</span>
                <span className={styles.installmentAmount}>
                  {formatCurrency(installmentValue)}
                </span>
              </p>
            </div>

            <p className={styles.disclaimer}>
              <Icon name="info" size={16} className={styles.disclaimerIcon} />
              <span>{FINANCING_DISCLAIMER}</span>
            </p>
          </aside>
        ) : null}
      </div>
    </section>
  );
}

export default FinancingCta;
