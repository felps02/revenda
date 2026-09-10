/**
 * Constantes de sessão sem nenhuma dependência do Node.
 *
 * O `proxy.ts` roda no Edge Runtime, onde `node:crypto` não existe — por isso
 * o nome do cookie mora aqui, separado de `lib/auth.ts`.
 */
export const SESSION_COOKIE = "marchetti_admin";
export const SESSION_MAX_AGE = 60 * 60 * 12; // 12 horas
