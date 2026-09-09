/** Contratos dos formularios/leads do site. */

export type LeadType = "interesse" | "financiamento" | "avaliacao" | "contato";

export interface LeadBase {
  type: LeadType;
  name: string;
  phone: string;
  email?: string;
  message?: string;
  /** Pagina/secao de origem, util para relatorio de conversao. */
  source?: string;
  vehicleId?: string;
  vehicleTitle?: string;
  vehicleUrl?: string;
}

export interface InterestLead extends LeadBase {
  type: "interesse";
  /** Cliente quer avaliar um usado na negociacao? */
  wantsTradeIn?: boolean;
  preferredContact?: "whatsapp" | "telefone" | "email";
}

export interface ContactLead extends LeadBase {
  type: "contato";
  subject?: string;
}

export interface FinancingLead extends LeadBase {
  type: "financiamento";
  vehiclePrice: number;
  downPayment: number;
  installments: number;
  estimatedInstallment: number;
}

export interface TradeInLead extends LeadBase {
  type: "avaliacao";
  car: {
    brand: string;
    model: string;
    year: number | string;
    mileage: number | string;
    expectedPrice?: number | string;
    notes?: string;
    /** Nomes dos arquivos enviados (o upload real vai para o CRM/bucket). */
    photos: string[];
  };
}

export type Lead = InterestLead | ContactLead | FinancingLead | TradeInLead;

export interface LeadResponse {
  ok: boolean;
  protocol?: string;
  message: string;
}
