# Marchetti Motors — contrato de arquitetura e design

Documento único de referência do projeto. Todo componente novo segue o que está aqui.

---

## 1. Stack e convenções

- **Next.js 16 (App Router) + React 19 + TypeScript strict**, sem nenhuma biblioteca de UI.
- **CSS Modules** colocados ao lado do componente (`Botao.tsx` + `Botao.module.css`). Nada de CSS-in-JS, Tailwind ou styled-components.
- Import alias: `@/` → `src/`.
- Textos da interface **sempre em português do Brasil**.
- Comentários em português, curtos, só onde a intenção não é óbvia.
- `"use client"` **apenas** em componentes que usam estado, efeito, evento de DOM ou hook de navegação. Tudo mais é Server Component.
- Imagens sempre com `next/image` (`fill` + `sizes` corretos, ou `width`/`height`). `priority` só na primeira imagem visível da página.
- Acessibilidade não é opcional: `aria-label` em botões só de ícone, `alt` descritivo, foco visível (herda de `:focus-visible`), navegação por teclado em galeria/modal/drawer, `aria-expanded` em toggles.

### Regras de CSS

- **Só usar variáveis de `src/styles/tokens.css`.** Nenhum hex solto no código — a única exceção são gradientes/overlays em cima de foto (`rgba(12,15,17,.65)`).
- **Mobile-first**: estilo base é o do celular; refinamentos em `@media (min-width: 640px | 768px | 1024px | 1280px)`.
- Transições sempre com `var(--dur)` e `var(--ease)`. Microinterações discretas: elevação de sombra, leve `translateY(-2px)`, `scale(1.04)` em foto dentro de `overflow:hidden`. **Sem** bounce, glow colorido, neon ou gradiente arco-íris.
- Alvos de toque no celular ≥ 44px de altura.
- Números (preço, km, parcela) usam a classe global `.tnum`.
- Classes utilitárias globais disponíveis: `.container`, `.container-wide`, `.container-narrow`, `.section`, `.section-tight`, `.band-dark`, `.band-alt`, `.eyebrow`, `.lead`, `.sr-only`, `.tnum`, `[data-reveal]`.

### Identidade visual

| Papel | Token | Uso |
|---|---|---|
| Grafite | `--ink-900/800/700` | faixas escuras: header sólido, hero, CTA, rodapé |
| Osso | `--bone-50/100` | fundo das seções claras |
| Branco | `--surface` | cards |
| Bronze | `--brand-500/600` | acento: eyebrow, preço em destaque, ícones-chave, hover |
| Verde | `--whats-500` | exclusivo do WhatsApp |

- Tipografia: títulos em `var(--font-display)` (Sora, peso 700, tracking negativo); texto em `var(--font-sans)` (Inter). Microlabels: 11px, 600, `letter-spacing: .14em`, caixa alta.
- O bronze é **acento**, não fundo de seção inteira. Nada de botão bronze gigante em cima de foto.
- Cards: `--surface`, borda `1px solid var(--line)`, raio `--r-lg`, sombra `--sh-sm` → `--sh-md` no hover.

---

## 2. Estrutura de pastas

```
src/
  app/                 rotas (App Router) + globals.css
  components/
    ui/                kit base (Button, Icon, Badge, Field, Modal, Rating…)
    layout/            Header, Footer, Logo, WhatsAppFloat, Breadcrumbs
    vehicle/           card, grid, favoritos, compartilhar
    vehicle/filters/   filtros, ordenação, busca rápida
    vehicle/detail/    galeria, ficha técnica, opcionais, caixa de preço
    forms/             formulários (interesse, troca, financiamento, contato)
    home/              seções da home
    institucional/     sobre, números, depoimentos, mapa, FAQ
  config/site.ts       dados da revenda (telefone, endereço, horários, redes)
  data/                estoque de demonstração, taxonomia, mídia, depoimentos
  hooks/               useFavorites, useUi (media query, scroll lock, reveal…)
  lib/                 format, slug, seo, validation, vehicleQuery, cn
  services/            vehicleRepository, whatsapp, financing, leadService
  styles/tokens.css    design tokens
```

**Regra de ouro:** componente **nunca** importa `@/data/vehicles` direto. Dados de estoque vêm do `vehicleRepository` (server) ou por props.

---

## 3. API dos componentes (contrato entre agentes)

Todos com `export default`. Props extras opcionais podem ser adicionadas, mas as abaixo devem existir com esses nomes e tipos.

### `components/ui`

```ts
// Icon.tsx — biblioteca única de ícones do site (SVG inline, 24×24, stroke currentColor)
export type IconName =
  | "whatsapp" | "phone" | "mail" | "instagram" | "facebook" | "youtube"
  | "menu" | "close" | "search" | "filter" | "sort" | "sliders"
  | "chevron-down" | "chevron-left" | "chevron-right" | "arrow-right" | "arrow-up-right"
  | "heart" | "heart-filled" | "share" | "copy" | "check" | "check-circle" | "star" | "star-filled"
  | "map-pin" | "clock" | "shield" | "badge-check" | "sparkles" | "info" | "alert"
  | "gauge" | "fuel" | "gearbox" | "calendar" | "car" | "suv" | "hatch" | "pickup"
  | "key" | "wallet" | "calculator" | "camera" | "upload" | "trash" | "expand" | "sun"
  | "door" | "engine" | "paint" | "users" | "trophy" | "plus" | "minus" | "play";
interface IconProps { name: IconName; size?: number; className?: string; }

// Button.tsx
interface ButtonProps {
  variant?: "primary" | "dark" | "outline" | "ghost" | "whatsapp" | "light"; // primary = grafite; light = branco sobre fundo escuro
  size?: "sm" | "md" | "lg";
  href?: string;            // vira <Link>; com external vira <a target="_blank" rel="noopener noreferrer">
  external?: boolean;
  icon?: IconName;          // à esquerda
  iconRight?: IconName;
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  type?: "button" | "submit";
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
}

// Badge.tsx
interface BadgeProps { tone?: "bronze" | "neutral" | "success" | "alert" | "dark" | "outline"; size?: "sm" | "md"; icon?: IconName; children: React.ReactNode; className?: string }

// SectionHeading.tsx
interface SectionHeadingProps { eyebrow?: string; title: React.ReactNode; description?: React.ReactNode; align?: "left" | "center"; tone?: "light" | "dark"; action?: React.ReactNode; as?: "h1" | "h2" | "h3"; className?: string }

// Field.tsx — exporta Field (default), TextInput, TextArea, SelectInput, Checkbox
interface FieldProps { label: string; htmlFor: string; error?: string; hint?: string; required?: boolean; className?: string; children: React.ReactNode }
// TextInput/TextArea/SelectInput estendem os atributos nativos + { invalid?: boolean }
// SelectInput recebe options?: { value: string; label: string }[] OU children

// Rating.tsx
interface RatingProps { value: number; size?: number; showValue?: boolean; reviews?: number; className?: string }

// Modal.tsx  (client, portal no body, trava scroll, fecha em Esc/backdrop, foco preso)
interface ModalProps { open: boolean; onClose: () => void; title?: string; description?: string; size?: "md" | "lg" | "full"; children: React.ReactNode }

// Skeleton.tsx
interface SkeletonProps { width?: string; height?: string; radius?: string; className?: string }
```

### `components/layout`

```ts
// Logo.tsx  — monograma "MM" desenhado em SVG + wordmark; NÃO usar imagem externa
interface LogoProps { tone?: "light" | "dark"; compact?: boolean; className?: string }
// Header.tsx (client) — fixo; sobre o hero começa transparente e vira sólido ao rolar
interface HeaderProps { transparentOnTop?: boolean }
// Footer.tsx (server)
// WhatsAppFloat.tsx (client) — botão flutuante; no mobile vira barra fixa com "WhatsApp" + "Ligar"
// Breadcrumbs.tsx
interface BreadcrumbsProps { items: { label: string; href?: string }[]; tone?: "light" | "dark" }
// RevealRoot.tsx (client) — envolve children e ativa os [data-reveal] via useReveal()
```

### `components/vehicle`

```ts
// VehicleCard.tsx
interface VehicleCardProps { vehicle: Vehicle; priority?: boolean; compact?: boolean; className?: string }
// VehicleGrid.tsx
interface VehicleGridProps { vehicles: Vehicle[]; priorityCount?: number; columns?: 2 | 3 | 4; empty?: React.ReactNode; className?: string }
// FavoriteButton.tsx (client)
interface FavoriteButtonProps { vehicleId: string; variant?: "floating" | "inline"; withLabel?: boolean }
// ShareButton.tsx (client) — Web Share API, com fallback: copiar link, WhatsApp, Facebook
interface ShareButtonProps { url: string; title: string; variant?: "icon" | "inline"; withLabel?: boolean }
```

### `components/vehicle/filters` (todos client)

```ts
// VehicleFilters.tsx — desktop: coluna fixa; mobile: drawer acionado por botão "Filtrar"
interface VehicleFiltersProps { facets: VehicleFacets; resultCount: number }
// SortSelect.tsx
interface SortSelectProps { resultCount: number }
// ActiveFilters.tsx — pílulas do que está ativo + "limpar tudo"
interface ActiveFiltersProps { facets?: VehicleFacets }
// QuickSearch.tsx — busca rápida da home (marca, modelo, ano, preço mín/máx, carroceria)
interface QuickSearchProps { facets: VehicleFacets; variant?: "hero" | "inline" }
```

Todos leem e escrevem o estado na **URL** (`useSearchParams` + `router.push`), usando `filtersFromSearchParams` / `filtersToSearchParams` de `@/lib/vehicleQuery`. Nunca inventar nomes de parâmetro: use `QUERY_KEYS`.

### `components/vehicle/detail`

```ts
// VehicleGallery.tsx (client) — foto grande + miniaturas + lightbox; setas, teclado, swipe, contador "3/9"
interface VehicleGalleryProps { images: VehicleImage[]; title: string }
// VehicleSpecs.tsx — ficha técnica em grade de ícone + rótulo + valor
interface VehicleSpecsProps { vehicle: Vehicle }
// VehicleFeatures.tsx — opcionais agrupados por FEATURE_GROUPS
interface VehicleFeaturesProps { features: string[] }
// VehiclePriceBox.tsx (client) — preço, parcela estimada, selos e os 3 botões grandes
//   "Tenho interesse" (abre Modal com InterestForm) · "Chamar no WhatsApp" · "Simular financiamento"
interface VehiclePriceBoxProps { vehicle: Vehicle }
// RelatedVehicles.tsx
interface RelatedVehiclesProps { vehicles: Vehicle[]; title?: string }
```

### `components/forms` (todos client)

```ts
interface InterestFormProps { vehicle?: Vehicle | null; source?: string; onSuccess?: () => void; compact?: boolean }
interface TradeInFormProps { compact?: boolean }              // inclui upload de fotos com preview
interface FinancingSimulatorProps { vehicle?: Vehicle | null; variant?: "page" | "compact" }
interface ContactFormProps {}
interface FormStatusProps { state: "idle" | "loading" | "success" | "error"; message?: string; protocol?: string }
```

Fluxo obrigatório de todo formulário:
1. valida com `@/lib/validation` (erro por campo, `aria-invalid`, foco no primeiro campo com erro);
2. envia com `submitLead` (`@/services/leadService`);
3. mostra `FormStatus` com protocolo;
4. **sempre** oferece o atalho de WhatsApp com a mesma mensagem (`waMessage.*`), porque é o canal que converte.

### `components/home` e `components/institucional`

Seções recebem os dados por props (o Server Component da página busca no repositório). Nenhuma seção faz fetch.

---

## 4. Rotas

| Rota | Conteúdo |
|---|---|
| `/` | hero, busca rápida, selos de confiança, destaques, categorias, passos, faixa "venda seu carro", depoimentos, CTA |
| `/estoque` | filtros + ordenação + grade + paginação (URL com querystring) |
| `/estoque/[slug]` | galeria, ficha, opcionais, descrição, caixa de preço, relacionados, JSON-LD `Car` |
| `/financiamento` | como funciona, simulador, bancos parceiros, FAQ, CTA consultor |
| `/avaliacao` | "Quer trocar ou vender seu carro?" + formulário com upload |
| `/sobre` | história, missão/valores, diferenciais, números, fotos da loja, depoimentos |
| `/contato` | dados, horários, mapa incorporado, formulário |
| `/favoritos` | lista salva no navegador (client) |
| `/api/leads` | recebe os formulários e devolve protocolo |
| `sitemap.ts`, `robots.ts`, `not-found.tsx` | SEO |

Metadata de cada página via `buildMetadata` de `@/lib/seo`. JSON-LD injetado com `<script type="application/ld+json">`.

---

## 5. Qualidade

- `npm run build` e `npm run typecheck` precisam passar sem erro nem warning de tipo.
- Nada de `any` implícito, `@ts-ignore` ou `!` para calar o TypeScript.
- Sem `console.log` no código final.
- Testar mentalmente em 360px, 768px e 1440px antes de dar a tarefa por concluída.
