/** Faz o login do painel no motor do Safari, em tela de iPhone, pelo IP da rede. */
import { webkit, devices } from "playwright";

const BASE = process.env.BASE_URL ?? "http://10.0.0.57:3000";
const browser = await webkit.launch();
const context = await browser.newContext({
  ...devices["iPhone 15 Pro"],
  deviceScaleFactor: 1,
  locale: "pt-BR",
});
const page = await context.newPage();
const erros = [];
page.on("pageerror", (e) => erros.push(e.message));

await page.goto(`${BASE}/admin`, { waitUntil: "networkidle", timeout: 60_000 });
console.log("1. redirecionou para:", new URL(page.url()).pathname);

await page.locator("#email").fill("comercial@softin.com.br");
await page.locator("#senha").fill("marchetti2026");
await page.getByRole("button", { name: /entrar no painel/i }).click();
await page.waitForTimeout(4000);

console.log("2. depois do login:", new URL(page.url()).pathname);

const cookies = await context.cookies();
const sessao = cookies.find((c) => c.name === "marchetti_admin");
console.log("3. cookie guardado:", Boolean(sessao), sessao ? `(secure=${sessao.secure})` : "");

const titulo = await page.locator("h1").first().textContent().catch(() => null);
console.log("4. título da página:", titulo?.trim());

await page.screenshot({ path: "screenshots/admin-mobile.png" });

// navega para o cadastro para confirmar que a sessão persiste
await page.goto(`${BASE}/admin/veiculos/novo`, { waitUntil: "networkidle" });
console.log("5. cadastro acessível:", new URL(page.url()).pathname === "/admin/veiculos/novo");
await page.screenshot({ path: "screenshots/admin-novo-mobile.png" });

console.log("6. erros de JS:", erros.length ? erros.join(" | ") : "nenhum");
await browser.close();
