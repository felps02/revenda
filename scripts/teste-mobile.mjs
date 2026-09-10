/**
 * Abre o site no motor do Safari (WebKit) numa tela de iPhone 16 e reporta o
 * que está realmente visível, além de salvar as capturas de tela.
 *
 *   node scripts/teste-mobile.mjs
 */
import { webkit, devices } from "playwright";
import { mkdir } from "node:fs/promises";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const SAIDA = "screenshots";

const PAGINAS = [
  { nome: "home", url: "/" },
  { nome: "estoque", url: "/estoque" },
  { nome: "veiculo", url: "/estoque/toyota-corolla-xei-2-0-flex-2021-mm2011" },
  { nome: "financiamento", url: "/financiamento" },
  { nome: "sobre", url: "/sobre" },
];

await mkdir(SAIDA, { recursive: true });

const browser = await webkit.launch();
const context = await browser.newContext({
  ...devices["iPhone 15 Pro"],
  deviceScaleFactor: 1,
  locale: "pt-BR",
});

const erros = [];
const page = await context.newPage();
page.on("pageerror", (e) => erros.push(`[JS] ${e.message}`));
page.on("console", (m) => {
  if (m.type() === "error") erros.push(`[console] ${m.text()}`);
});
page.on("requestfailed", (r) => erros.push(`[rede] ${r.url()} — ${r.failure()?.errorText}`));

for (const alvo of PAGINAS) {
  await page.goto(BASE + alvo.url, { waitUntil: "networkidle", timeout: 90_000 });
  await page.waitForTimeout(2500);

  // conta o que está de fato visível para o usuário
  const invisiveis = await page.evaluate(() => {
    const escondidos = [];
    for (const el of document.querySelectorAll("section, header, footer, [data-reveal]")) {
      const estilo = getComputedStyle(el);
      const caixa = el.getBoundingClientRect();
      if (
        Number(estilo.opacity) < 0.1 ||
        estilo.visibility === "hidden" ||
        (estilo.display !== "none" && caixa.height === 0 && el.textContent.trim().length > 0)
      ) {
        escondidos.push((el.className || el.tagName).toString().slice(0, 60));
      }
    }
    return escondidos;
  });

  const estouro = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );

  await page.screenshot({ path: `${SAIDA}/${alvo.nome}.png` });

  console.log(`\n== ${alvo.nome} (${alvo.url})`);
  console.log(`   invisíveis: ${invisiveis.length ? invisiveis.join(" | ") : "nenhum"}`);
  console.log(`   estouro horizontal: ${estouro > 0 ? estouro + "px" : "não"}`);
}

// interações que dependem de JavaScript
await page.goto(BASE + "/estoque", { waitUntil: "networkidle" });
const btnFiltrar = page.getByRole("button", { name: /filtrar/i }).first();
console.log(`\n== interações`);
console.log(`   botão "Filtrar" visível: ${await btnFiltrar.isVisible().catch(() => false)}`);
if (await btnFiltrar.isVisible().catch(() => false)) {
  await btnFiltrar.click();
  await page.waitForTimeout(800);
  const gaveta = await page.locator("text=Limpar").first().isVisible().catch(() => false);
  console.log(`   gaveta de filtros abriu: ${gaveta}`);
  await page.screenshot({ path: `${SAIDA}/filtros-abertos.png` });
}

await page.goto(BASE + "/estoque/toyota-corolla-xei-2-0-flex-2021-mm2011", { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
const ampliar = page.getByRole("button", { name: /ampliar/i }).first();
console.log(`   botão de ampliar foto visível: ${await ampliar.isVisible().catch(() => false)}`);
const menu = page.getByRole("button", { name: /menu|abrir menu/i }).first();
console.log(`   botão de menu visível: ${await menu.isVisible().catch(() => false)}`);

console.log(`\n== erros capturados: ${erros.length}`);
for (const e of [...new Set(erros)].slice(0, 15)) console.log("   " + e);

await browser.close();
