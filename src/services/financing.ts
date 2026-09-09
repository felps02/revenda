import { siteConfig } from "@/config/site";

/**
 * Simulador de financiamento (Tabela Price).
 *
 * Os valores sao estimativos: a taxa real sai da analise de credito do banco.
 * Toda tela que mostra parcela usa estas funcoes, para nunca divergir.
 */

export interface SimulationInput {
  price: number;
  downPayment: number;
  installments: number;
  /** Taxa mensal em decimal (0.0149 = 1,49% a.m.). */
  monthlyRate?: number;
  /** Somar tarifas de cadastro/registro ao montante financiado. */
  includeFees?: boolean;
}

export interface SimulationResult {
  valid: boolean;
  error?: string;
  financedAmount: number;
  installmentValue: number;
  installments: number;
  downPayment: number;
  totalPaid: number;
  totalInterest: number;
  monthlyRate: number;
  /** Taxa anual equivalente. */
  yearlyRate: number;
  minDownPayment: number;
}

export const FINANCING = siteConfig.financing;

export function minDownPayment(price: number): number {
  return Math.round(price * FINANCING.minDownPaymentPercent);
}

/** PMT = PV * i / (1 - (1 + i)^-n) */
export function priceTableInstallment(principal: number, monthlyRate: number, months: number): number {
  if (months <= 0) return 0;
  if (monthlyRate <= 0) return principal / months;
  const factor = Math.pow(1 + monthlyRate, -months);
  return (principal * monthlyRate) / (1 - factor);
}

export function simulateFinancing(input: SimulationInput): SimulationResult {
  const monthlyRate = input.monthlyRate ?? FINANCING.defaultMonthlyRate;
  const price = Math.max(0, Math.round(input.price || 0));
  const downPayment = Math.max(0, Math.round(input.downPayment || 0));
  const installments = Math.max(1, Math.round(input.installments || FINANCING.defaultInstallments));
  const minimum = minDownPayment(price);

  const base: SimulationResult = {
    valid: false,
    financedAmount: 0,
    installmentValue: 0,
    installments,
    downPayment,
    totalPaid: 0,
    totalInterest: 0,
    monthlyRate,
    yearlyRate: Math.pow(1 + monthlyRate, 12) - 1,
    minDownPayment: minimum,
  };

  if (price <= 0) return { ...base, error: "Informe o valor do veículo" };
  if (downPayment >= price) return { ...base, error: "A entrada não pode ser maior ou igual ao valor do veículo" };
  if (downPayment < minimum) {
    return {
      ...base,
      error: `Entrada mínima de ${Math.round(FINANCING.minDownPaymentPercent * 100)}% do valor do veículo`,
    };
  }

  const fees = input.includeFees === false ? 0 : FINANCING.fees;
  const financedAmount = price - downPayment + fees;
  const installmentValue = priceTableInstallment(financedAmount, monthlyRate, installments);
  const totalPaid = installmentValue * installments + downPayment;

  return {
    ...base,
    valid: true,
    financedAmount,
    installmentValue,
    totalPaid,
    totalInterest: installmentValue * installments - financedAmount,
  };
}

/** Parcela de vitrine ("48x de R$ 2.190") usada nos cards do estoque. */
export function previewInstallment(price: number, installments = FINANCING.defaultInstallments): number {
  const result = simulateFinancing({
    price,
    downPayment: minDownPayment(price),
    installments,
  });
  return result.valid ? result.installmentValue : 0;
}

export const FINANCING_DISCLAIMER =
  "Simulação com taxa média de mercado, sem compromisso. Os valores finais dependem da análise de crédito, do prazo e das condições do banco parceiro no dia da contratação.";
