# Marchetti Motors — site da revenda

Site completo de uma revenda de seminovos: vitrine de estoque com busca e filtros, página individual de cada veículo com URL amigável, simulador de financiamento, formulário de avaliação/troca com upload de fotos, favoritos, integração com WhatsApp em todos os pontos de contato e SEO com dados estruturados.

Construído em **Next.js 16 (App Router) + React 19 + TypeScript + CSS Modules**, sem nenhuma biblioteca de UI — o visual é próprio, do design token ao ícone.

---

## Começando

```bash
npm install
npm run dev      # http://localhost:3000
```

Outros comandos:

```bash
npm run build      # build de produção
npm start          # sobe o build
npm run typecheck  # tsc --noEmit
```

Requisitos: Node.js 20.9+.

---

## O que já está pronto

| Rota | O que faz |
|---|---|
| `/` | Hero, busca rápida, selos de confiança, destaques, categorias, marcas, como funciona, venda seu carro, financiamento, depoimentos |
| `/estoque` | Filtros avançados, ordenação, paginação — tudo refletido na URL (link compartilhável) |
| `/estoque/[slug]` | Galeria com lightbox, ficha técnica, opcionais, descrição, caixa de preço, simulador, formulário e similares |
| `/financiamento` | Como funciona, simulador, documentos, bancos parceiros, FAQ |
| `/avaliacao` | Formulário "Quero avaliar meu carro" com upload de fotos |
| `/sobre` | História, missão e valores, números, fotos da loja, depoimentos, localização |
| `/contato` | Canais, formulário, horários e mapa |
| `/favoritos` | Lista salva no navegador do visitante |
| `/admin` | Painel da loja: cadastrar, editar, marcar como vendido, excluir |
| `/api/leads` | Recebe os formulários e devolve protocolo |

Também: `sitemap.xml`, `robots.txt`, página 404 própria, JSON-LD (`AutoDealer`, `WebSite`, `Car`, `BreadcrumbList`, `FAQPage`), Open Graph e Twitter Cards.

---

## Estrutura

```
src/
  app/(site)/          rotas públicas do site
  app/admin/           painel administrativo
  app/api/             rotas de API (leads e painel)
  components/
    ui/                Button, Icon, Badge, Field, Modal, Rating, SectionHeading, Skeleton
    layout/            Header, Footer, Logo, WhatsAppFloat, Breadcrumbs
    vehicle/           VehicleCard, VehicleGrid, FavoriteButton, ShareButton
    vehicle/filters/   VehicleFilters, SortSelect, ActiveFilters, QuickSearch, Pagination
    vehicle/detail/    VehicleGallery, VehicleSpecs, VehicleFeatures, VehiclePriceBox, RelatedVehicles
    forms/             InterestForm, TradeInForm, FinancingSimulator, ContactForm, FormStatus
    home/              seções da home
    institucional/     sobre, números, depoimentos, mapa, FAQ
  config/site.ts       dados da revenda (telefone, endereço, horários, redes, financiamento)
  data/                estoque de demonstração, taxonomia, mídia, depoimentos
  hooks/               favoritos, media query, scroll lock, reveal
  lib/                 formatação, slug, SEO, validação, busca/filtro, cn
  services/            vehicleRepository, inventoryStore, photoStorage, whatsapp, financing, leadService
  styles/tokens.css    design tokens (cores, tipografia, espaçamento, sombras)
docs/arquitetura.md    contrato de arquitetura e design do projeto
```

---

## Personalizando para a sua loja

**1. Dados da revenda** — `src/config/site.ts`. Nome, WhatsApp, telefone, e-mail, endereço, coordenadas do mapa, horários, redes sociais, números institucionais e parâmetros do financiamento. Trocar aqui muda o site inteiro, incluindo os links de WhatsApp, o mapa e os dados estruturados do Google.

**2. Estoque** — `src/data/vehicles.ts`. Cada carro é declarado com `defineVehicle`, que gera a URL amigável automaticamente:

```ts
defineVehicle({
  id: "mm1042",
  brand: "Volkswagen",
  model: "T-Cross",
  version: "Highline 1.4 250 TSI",
  year: 2023,
  manufactureYear: 2022,
  price: 139900,
  mileage: 28400,
  // ...
})
// vira /estoque/volkswagen-t-cross-highline-1-4-250-tsi-2023-mm1042
```

**3. Fotos** — `src/data/media.ts` concentra as imagens que não são de veículos (hero, categorias, loja, avatares). As fotos de cada carro ficam no próprio objeto do veículo. Ao usar um domínio próprio de imagens, adicione-o em `next.config.ts` → `images.remotePatterns`.

**4. Identidade visual** — `src/styles/tokens.css`. Cor, tipografia, raio, sombra e espaçamento saem todos daí; nenhum componente tem cor fixa no código.

---

## Painel administrativo

Área em `/admin` para a loja cadastrar e atualizar o estoque pelo navegador, sem mexer em código nem fazer deploy a cada carro novo.

O que dá para fazer: cadastrar veículo com upload de fotos (arrastar e soltar, reordenar, definir a capa e a legenda de cada uma), editar qualquer campo do anúncio, marcar como **reservado** ou **vendido** direto na lista, colocar em destaque na home, excluir, e ver o anúncio publicado. Ao salvar, o site é atualizado na hora — o carro entra nos filtros, ganha URL própria e aparece no `sitemap.xml`.

### 1. Criar o acesso

```bash
npm run admin:senha
```

O comando pergunta e-mail e senha e imprime três linhas. Cole no arquivo `.env.local` na raiz do projeto:

```
ADMIN_EMAIL=voce@sualoja.com.br
ADMIN_PASSWORD_HASH=...
AUTH_SECRET=...
```

A senha nunca é gravada em texto puro: fica só o hash (scrypt). A sessão dura 12 horas e o cookie é assinado, então não dá para forjar acesso sem o `AUTH_SECRET`.

Reinicie o servidor e acesse http://localhost:3000/admin.

### 2. Onde os dados ficam

| | Sem `DATABASE_URL` | Com `DATABASE_URL` |
|---|---|---|
| Estoque | arquivo `data/estoque.json` | tabela `vehicles` no Postgres |
| Fotos | pasta `public/veiculos/` | Vercel Blob (`BLOB_READ_WRITE_TOKEN`) |

No seu computador funciona sem configurar nada. **Na Vercel o disco é temporário**, então banco e bucket são obrigatórios lá — sem eles, os cadastros somem no próximo deploy.

### 3. Publicar na Vercel

1. **Banco:** crie um Postgres gratuito no [Neon](https://neon.tech) ou no [Supabase](https://supabase.com) e copie a *connection string*.
2. **Fotos:** no painel da Vercel, aba *Storage*, crie um **Blob Store** e copie o token.
3. Em *Settings → Environment Variables*, cadastre:

```
DATABASE_URL=postgres://...
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...
ADMIN_EMAIL=voce@sualoja.com.br
ADMIN_PASSWORD_HASH=...
AUTH_SECRET=...
```

4. Leve o estoque atual para o banco (uma vez só):

```bash
DATABASE_URL="postgres://..." npm run estoque:carregar
```

A tabela é criada sozinha na primeira execução. Veículos com o mesmo código são atualizados, nunca duplicados.

### Trocar de armazenamento

O painel não conhece o banco: ele fala com `InventoryStore` ([src/services/inventoryStore.ts](src/services/inventoryStore.ts)) e com `PhotoStorage` ([src/services/photoStorage.ts](src/services/photoStorage.ts)). Para usar MySQL, S3, Cloudinary ou Supabase Storage, basta implementar a interface correspondente e devolvê-la na função `get...()` do arquivo — nenhuma tela muda.

---

## Trocando os dados por uma API ou banco

A interface **nunca** importa o estoque diretamente: ela fala com o `VehicleRepository` (`src/services/vehicleRepository.ts`).

- Hoje: `StoreVehicleRepository`, que lê o `InventoryStore` (arquivo local ou Postgres) alimentado pelo painel. O estoque de demonstração de `src/data/vehicles.ts` serve como carga inicial.
- Amanhã: defina `NEXT_PUBLIC_VEHICLES_API=https://api.sualoja.com.br/v1` e o `HttpVehicleRepository` — já implementado — assume, consumindo `/vehicles`, `/vehicles/:slug` e `/vehicles/facets`.
- Outro backend (Prisma, Supabase, ERP): basta implementar a interface `VehicleRepository` e devolvê-la em `getVehicleRepository()`. Nenhum componente muda.

A mesma ideia vale para os leads: `src/app/api/leads/route.ts` tem a função `persistLead` isolada, com os pontos de integração comentados (CRM, e-mail, planilha).

---

## Decisões de projeto

- **Filtros na URL.** Todo filtro, ordenação e página vivem na querystring (`/estoque?marca=Volkswagen&carroceria=SUV&precoMax=150000`). O cliente pode compartilhar a busca, o botão voltar funciona e o Google indexa.
- **Server Components por padrão.** Só vira client component o que tem interação de verdade (filtros, galeria, formulários, favoritos). Isso mantém o JavaScript enviado ao navegador pequeno.
- **Páginas de veículo estáticas.** `generateStaticParams` gera cada anúncio em build; com centenas de carros, o custo por página continua o mesmo para o visitante.
- **WhatsApp com contexto.** Todo botão verde monta uma mensagem pronta com modelo, ano, km, preço, código e link do anúncio (`src/services/whatsapp.ts`) — o consultor já abre a conversa sabendo do que se trata.
- **Formulário nunca é beco sem saída.** Se a API falhar, a tela oferece o mesmo contato pelo WhatsApp com os dados já preenchidos.
- **Favoritos no navegador.** `localStorage`, sem login. O visitante ainda pode enviar a lista inteira para um consultor pelo WhatsApp.

---

## Aviso sobre o conteúdo de demonstração

Os veículos, depoimentos, números e as fotos são fictícios/ilustrativos, apenas para demonstrar o funcionamento. Antes de publicar, substitua o conteúdo por dados reais da loja — em especial `src/config/site.ts`, `src/data/vehicles.ts`, `src/data/testimonials.ts` e o domínio em `siteConfig.url`.
