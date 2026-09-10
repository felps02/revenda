import { webkit, devices } from "playwright";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const browser = await webkit.launch();
const context = await browser.newContext({ ...devices["iPhone 15 Pro"], locale: "pt-BR" });
const page = await context.newPage();

for (const url of ["/", "/estoque", "/sobre"]) {
  await page.goto(BASE + url, { waitUntil: "networkidle", timeout: 90_000 });
  await page.waitForTimeout(2000);

  const dados = await page.evaluate(() => {
    const alturaTotal = document.documentElement.scrollHeight;
    const gigantes = [];
    for (const el of document.querySelectorAll("*")) {
      const r = el.getBoundingClientRect();
      if (r.height > 3000 || r.width > 1200) {
        const filhos = [...el.children].filter((c) => {
          const cr = c.getBoundingClientRect();
          return cr.height > 3000 || cr.width > 1200;
        });
        // só reporta o mais interno da cadeia
        if (filhos.length === 0) {
          gigantes.push({
            tag: el.tagName.toLowerCase(),
            classe: String(el.className).slice(0, 55),
            altura: Math.round(r.height),
            largura: Math.round(r.width),
          });
        }
      }
    }
    return { alturaTotal, gigantes: gigantes.slice(0, 12) };
  });

  console.log(`\n=== ${url}  altura total: ${dados.alturaTotal}px`);
  for (const g of dados.gigantes) {
    console.log(`   ${g.altura}x${g.largura}  <${g.tag}> ${g.classe}`);
  }
}

await browser.close();
