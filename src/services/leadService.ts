import type { Lead, LeadResponse } from "@/types";

/**
 * Envio de leads dos formularios.
 *
 * O endpoint /api/leads registra o contato e devolve um protocolo.
 * Para plugar um CRM (RD Station, Pipedrive, Bitrix...) basta trocar o corpo
 * do route handler: nenhum componente precisa mudar.
 */
export async function submitLead(lead: Lead): Promise<LeadResponse> {
  try {
    const response = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...lead, sentAt: new Date().toISOString() }),
    });

    const data = (await response.json().catch(() => null)) as LeadResponse | null;

    if (!response.ok || !data?.ok) {
      return {
        ok: false,
        message:
          data?.message ??
          "Não conseguimos registrar seu contato agora. Fale com a gente pelo WhatsApp que respondemos na hora.",
      };
    }

    return data;
  } catch {
    return {
      ok: false,
      message:
        "Sem conexão com o servidor. Você pode continuar pelo WhatsApp — o atendimento é imediato.",
    };
  }
}

/** Protocolo legivel para o cliente: MM-4F2K9. */
export function buildProtocol(seed: number = Date.now()): string {
  return `MM-${seed.toString(36).slice(-5).toUpperCase()}`;
}
