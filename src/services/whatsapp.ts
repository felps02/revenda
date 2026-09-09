import { siteConfig } from "@/config/site";
import { formatCurrency, formatMileage } from "@/lib/format";
import { vehicleFullTitle } from "@/lib/slug";
import type { Vehicle } from "@/types";

/**
 * Central de mensagens do WhatsApp.
 * Todo botao verde do site passa por aqui, entao trocar o numero em
 * `siteConfig.contact.whatsapp` redireciona o site inteiro.
 */

export function whatsappUrl(message: string, phone: string = siteConfig.contact.whatsapp): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function vehicleUrl(vehicle: Pick<Vehicle, "slug">): string {
  return `${siteConfig.url}/estoque/${vehicle.slug}`;
}

export const waMessage = {
  generic(): string {
    return `Olá! Vim pelo site da ${siteConfig.name} e gostaria de falar com um consultor.`;
  },

  stock(): string {
    return `Olá! Vi o estoque no site da ${siteConfig.name} e quero ajuda para escolher um carro.`;
  },

  vehicle(vehicle: Vehicle): string {
    return [
      `Olá! Tenho interesse neste veículo do site da ${siteConfig.name}:`,
      "",
      `*${vehicleFullTitle(vehicle)}*`,
      `Ano: ${vehicle.manufactureYear}/${vehicle.year}`,
      `KM: ${formatMileage(vehicle.mileage)}`,
      `Preço: ${formatCurrency(vehicle.price)}`,
      `Código: ${vehicle.id.toUpperCase()}`,
      "",
      vehicleUrl(vehicle),
      "",
      "Ele ainda está disponível?",
    ].join("\n");
  },

  vehicleVisit(vehicle: Vehicle): string {
    return [
      `Olá! Gostaria de agendar um test drive do *${vehicleFullTitle(vehicle)}* (código ${vehicle.id.toUpperCase()}).`,
      "",
      vehicleUrl(vehicle),
    ].join("\n");
  },

  financing(input: {
    vehicle?: Vehicle | null;
    price: number;
    downPayment: number;
    installments: number;
    installmentValue: number;
  }): string {
    const lines = [
      `Olá! Fiz uma simulação de financiamento no site da ${siteConfig.name}:`,
      "",
      `Valor do veículo: ${formatCurrency(input.price)}`,
      `Entrada: ${formatCurrency(input.downPayment)}`,
      `Parcelas: ${input.installments}x de ${formatCurrency(input.installmentValue)}`,
    ];
    if (input.vehicle) {
      lines.push("", `Veículo: *${vehicleFullTitle(input.vehicle)}*`, vehicleUrl(input.vehicle));
    }
    lines.push("", "Quero saber as condições reais e enviar meus documentos para análise.");
    return lines.join("\n");
  },

  tradeIn(input: {
    name?: string;
    brand: string;
    model: string;
    year: string | number;
    mileage: string | number;
    expectedPrice?: string | number;
    notes?: string;
  }): string {
    const lines = [
      `Olá! Quero avaliar meu carro para venda ou troca na ${siteConfig.name}.`,
      "",
      input.name ? `Nome: ${input.name}` : "",
      `Veículo: ${input.brand} ${input.model} ${input.year}`,
      `KM: ${input.mileage}`,
      input.expectedPrice ? `Valor pretendido: ${input.expectedPrice}` : "",
      input.notes ? `Observações: ${input.notes}` : "",
      "",
      "Posso enviar as fotos por aqui?",
    ];
    return lines.filter(Boolean).join("\n");
  },

  interest(input: { name: string; phone: string; vehicle?: Vehicle | null; message?: string }): string {
    const lines = [
      `Olá! Sou ${input.name} e vim pelo site da ${siteConfig.name}.`,
      input.vehicle ? `Tenho interesse no *${vehicleFullTitle(input.vehicle)}*.` : "Gostaria de atendimento.",
      input.message ? `\n${input.message}` : "",
      input.vehicle ? `\n${vehicleUrl(input.vehicle)}` : "",
    ];
    return lines.filter(Boolean).join("\n");
  },
};

/** Link direto para ligacao telefonica. */
export const telUrl = `tel:+${siteConfig.contact.phone}`;
