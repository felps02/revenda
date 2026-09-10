import { NextResponse } from "next/server";
import { checkCredentials, createSessionToken, isAdminConfigured } from "@/lib/auth";
import { SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/authConstants";

export const runtime = "nodejs";

/**
 * O cookie só recebe a marca `Secure` quando a conexão é mesmo HTTPS.
 *
 * Amarrar isso ao modo de build quebrava o acesso pela rede local: o navegador
 * descarta cookies `Secure` em http://, então o login parecia dar certo mas a
 * sessão nunca era guardada. Na Vercel o cabeçalho x-forwarded-proto vem como
 * https e a proteção continua valendo.
 */
function isHttps(request: Request): boolean {
  const forwarded = request.headers.get("x-forwarded-proto");
  if (forwarded) return forwarded.split(",")[0].trim() === "https";
  try {
    return new URL(request.url).protocol === "https:";
  } catch {
    return false;
  }
}

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
    secure: isHttps(request),
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return response;
}
