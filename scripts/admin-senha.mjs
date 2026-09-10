/**
 * Gera as credenciais do painel administrativo.
 *
 *   npm run admin:senha
 *
 * Pergunta o e-mail e a senha, e imprime as três linhas para colar no
 * arquivo .env.local (ou nas variáveis de ambiente da Vercel).
 * A senha nunca é gravada em texto puro.
 */
import { createInterface } from "node:readline/promises";
import { randomBytes, scrypt } from "node:crypto";
import { promisify } from "node:util";
import { stdin, stdout } from "node:process";

const scryptAsync = promisify(scrypt);

async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const derived = await scryptAsync(password, salt, 64);
  return `${salt}:${derived.toString("hex")}`;
}

const rl = createInterface({ input: stdin, output: stdout });

try {
  console.log("\n  Credenciais do painel da Marchetti Motors\n");

  const email = (await rl.question("  E-mail de acesso: ")).trim();
  if (!email.includes("@")) {
    console.error("\n  E-mail inválido.\n");
    process.exit(1);
  }

  const password = (await rl.question("  Senha (mínimo 8 caracteres): ")).trim();
  if (password.length < 8) {
    console.error("\n  A senha precisa ter pelo menos 8 caracteres.\n");
    process.exit(1);
  }

  const hash = await hashPassword(password);
  const secret = randomBytes(32).toString("base64url");

  console.log("\n  Pronto. Copie as linhas abaixo para o arquivo .env.local:\n");
  console.log("  ------------------------------------------------------------");
  console.log(`  ADMIN_EMAIL=${email}`);
  console.log(`  ADMIN_PASSWORD_HASH=${hash}`);
  console.log(`  AUTH_SECRET=${secret}`);
  console.log("  ------------------------------------------------------------\n");
  console.log("  Na Vercel, cadastre as mesmas três em Settings > Environment Variables.");
  console.log("  Depois reinicie o servidor e acesse /admin.\n");
} finally {
  rl.close();
}
