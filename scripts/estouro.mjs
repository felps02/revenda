import { webkit, devices } from "playwright";
const browser = await webkit.launch();
const page = await browser.newPage({ ...devices["iPhone 15 Pro"], deviceScaleFactor: 1 });
await page.goto("http://localhost:3000/sobre", { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
const culpados = await page.evaluate(() => {
  const limite = document.documentElement.clientWidth;
  const lista = [];
  for (const el of document.querySelectorAll("*")) {
    const r = el.getBoundingClientRect();
    if (r.right > limite + 0.5 || r.left < -0.5) {
      lista.push({
        tag: el.tagName.toLowerCase(),
        classe: String(el.className).slice(0, 50),
        esquerda: Math.round(r.left),
        direita: Math.round(r.right),
        largura: Math.round(r.width),
      });
    }
  }
  return { limite, lista: lista.slice(0, 10) };
});
console.log("largura da tela:", culpados.limite);
for (const c of culpados.lista) {
  console.log(`  <${c.tag}> ${c.classe}  left=${c.esquerda} right=${c.direita} w=${c.largura}`);
}
await browser.close();
