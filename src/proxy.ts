import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/authConstants";

/**
 * Barreira do painel: sem cookie de sessão, nem chega a renderizar /admin.
 * A validação da assinatura acontece no servidor (lib/session), porque aqui
 * roda o Edge Runtime, sem acesso ao módulo de criptografia do Node.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/login") return NextResponse.next();

  const hasCookie = Boolean(request.cookies.get(SESSION_COOKIE)?.value);
  if (hasCookie) return NextResponse.next();

  const loginUrl = new URL("/admin/login", request.url);
  if (pathname !== "/admin") loginUrl.searchParams.set("de", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*"],
};
