import { createHmac, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/authConstants";

/**
 * Autenticação do painel administrativo.
 *
 * Login único da loja, guardado em variáveis de ambiente:
 *   ADMIN_EMAIL          e-mail de acesso
 *   ADMIN_PASSWORD_HASH  hash gerado por `npm run admin:senha`
 *   AUTH_SECRET          segredo que assina o cookie de sessão
 *
 * A senha nunca é gravada em texto puro e o cookie é assinado (HMAC-SHA256),
 * então não dá para forjar sessão sem o segredo. Sem dependência externa.
 */

const scryptAsync = promisify(scrypt);

export { SESSION_COOKIE, SESSION_MAX_AGE };

/** Gera "salt:hash" para guardar em ADMIN_PASSWORD_HASH. */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${derived.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, key] = stored.split(":");
  if (!salt || !key) return false;
  const derived = (await scryptAsync(password, salt, 64)) as Buffer;
  const expected = Buffer.from(key, "hex");
  if (expected.length !== derived.length) return false;
  return timingSafeEqual(expected, derived);
}

function secret(): string {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 16) {
    throw new Error(
      "AUTH_SECRET ausente ou curto demais. Gere um com: npm run admin:senha",
    );
  }
  return value;
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

/** Cria o valor do cookie: `<payload>.<assinatura>`. */
export function createSessionToken(email: string): string {
  const payload = Buffer.from(
    JSON.stringify({ email, exp: Date.now() + SESSION_MAX_AGE * 1000 }),
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export interface SessionData {
  email: string;
  exp: number;
}

/** Valida assinatura e validade. Retorna null para qualquer problema. */
export function readSessionToken(token: string | undefined): SessionData | null {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  let expected: string;
  try {
    expected = sign(payload);
  } catch {
    return null;
  }

  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as SessionData;
    if (!data.email || typeof data.exp !== "number" || data.exp < Date.now()) return null;
    return data;
  } catch {
    return null;
  }
}

/** O painel só funciona depois que as três variáveis estiverem definidas. */
export function isAdminConfigured(): boolean {
  return Boolean(
    process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD_HASH && process.env.AUTH_SECRET,
  );
}

export async function checkCredentials(email: string, password: string): Promise<boolean> {
  const expectedEmail = process.env.ADMIN_EMAIL;
  const storedHash = process.env.ADMIN_PASSWORD_HASH;
  if (!expectedEmail || !storedHash) return false;
  if (email.trim().toLowerCase() !== expectedEmail.trim().toLowerCase()) return false;
  return verifyPassword(password, storedHash);
}
