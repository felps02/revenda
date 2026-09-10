import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { readSessionToken, type SessionData } from "@/lib/auth";
import { SESSION_COOKIE } from "@/lib/authConstants";

/** Sessão do administrador logado, ou null. Use em Server Components. */
export async function getSession(): Promise<SessionData | null> {
  const store = await cookies();
  return readSessionToken(store.get(SESSION_COOKIE)?.value);
}

/** Exige sessão; manda para o login quando não houver. */
export async function requireSession(): Promise<SessionData> {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  return session;
}
