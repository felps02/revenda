import { NextResponse } from "next/server";
import { buildProtocol } from "@/services/leadService";
import type { Lead, LeadResponse } from "@/types";

export const runtime = "nodejs";

/**
 * Recebe os formulários do site.
 *
 * PONTO DE INTEGRAÇÃO: hoje o lead fica apenas em memória (some a cada deploy).
 * Em produção, troque o corpo de `persistLead` por uma destas opções — a
 * assinatura continua a mesma e nenhum componente precisa mudar:
 *   • CRM: POST na API do RD Station / Pipedrive / Bitrix;
 *   • Banco: insert via Prisma/Supabase;
 *   • E-mail: envio para vendas@ com Resend/SendGrid;
 *   • Planilha: append em uma aba do Google Sheets.
 */
const inbox: Array<Lead & { protocol: string; receivedAt: string }> = [];

async function persistLead(lead: Lead, protocol: string): Promise<void> {
  inbox.push({ ...lead, protocol, receivedAt: new Date().toISOString() });
  // Mantém a memória limitada enquanto não há banco de dados.
  if (inbox.length > 200) inbox.splice(0, inbox.length - 200);
}

function isValid(body: unknown): body is Lead {
  if (typeof body !== "object" || body === null) return false;
  const lead = body as Partial<Lead>;
  const validTypes = ["interesse", "financiamento", "avaliacao", "contato"];
  return (
    typeof lead.name === "string" &&
    lead.name.trim().length >= 3 &&
    typeof lead.phone === "string" &&
    lead.phone.replace(/\D/g, "").length >= 10 &&
    typeof lead.type === "string" &&
    validTypes.includes(lead.type)
  );
}

export async function POST(request: Request): Promise<NextResponse<LeadResponse>> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Não foi possível ler os dados enviados." }, { status: 400 });
  }

  if (!isValid(body)) {
    return NextResponse.json(
      { ok: false, message: "Confira o nome e o WhatsApp informados e tente novamente." },
      { status: 400 },
    );
  }

  const protocol = buildProtocol();
  await persistLead(body, protocol);

  return NextResponse.json(
    {
      ok: true,
      protocol,
      message: "Recebemos seu contato. Um consultor responde em até 1 hora útil.",
    },
    { status: 201 },
  );
}

export async function GET(): Promise<NextResponse<LeadResponse>> {
  return NextResponse.json(
    { ok: false, message: "Use POST para enviar um contato." },
    { status: 405, headers: { Allow: "POST" } },
  );
}
