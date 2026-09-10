import { NextResponse } from "next/server";
import { checkCredentials, createSessionToken, isAdminConfigured } from "@/lib/auth";
import { SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/authConstants";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isAdminConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        message:
          "Painel ainda não configurado. Rode `npm run admin:senha` e preencha o arquivo .env.local.",
      },
      { status: 503 },
    );
  }

  let body: { email?: string; password?: string };
  try {
    body = (await request.json()) as { email?: string; password?: string };
  } catch {
    return NextResponse.json({ ok: false, message: "Requisição inválida." }, { status: 400 });
  }

  const email = body.email ?? "";
  const password = body.password ?? "";

  if (!email || !password) {
    return NextResponse.json(
      { ok: false, message: "Informe e-mail e senha." },
      { status: 400 },
    );
  }

  const valid = await checkCredentials(email, password);

  // Resposta genérica de propósito: não revela se o e-mail existe.
  if (!valid) {
    return NextResponse.json(
      { ok: false, message: "E-mail ou senha incorretos." },
      { status: 401 },
    );
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, createSessionToken(email), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return response;
}
