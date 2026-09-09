/**
 * Configuracao central da revenda.
 *
 * Trocar os dados abaixo (telefone, endereco, redes, horarios) e suficiente
 * para o site inteiro passar a falar em nome de outra loja: header, rodape,
 * links de WhatsApp, mapa, SEO e dados estruturados leem tudo daqui.
 */

export const siteConfig = {
  name: "Marchetti Motors",
  shortName: "Marchetti",
  legalName: "Marchetti Comércio de Veículos LTDA",
  cnpj: "12.345.678/0001-90",
  tagline: "Seminovos premium com procedência",
  slogan: "Cada carro com história limpa. Cada negócio com a conta aberta.",
  description:
    "Revenda de seminovos premium em Curitiba. Estoque selecionado com laudo cautelar, garantia de 90 dias e financiamento aprovado em até 24 horas.",
  foundedYear: 2009,
  /** Trocar pelo dominio real na publicacao (usado em canonical, OG e sitemap). */
  url: "https://www.marchettimotors.com.br",
  locale: "pt-BR",

  contact: {
    /** Formato E.164 sem simbolos - usado nos links wa.me. */
    whatsapp: "5541998450220",
    whatsappDisplay: "(41) 99845-0220",
    phone: "554133280220",
    phoneDisplay: "(41) 3328-0220",
    email: "contato@marchettimotors.com.br",
    salesEmail: "vendas@marchettimotors.com.br",
  },

  address: {
    street: "Av. do Batel, 1868",
    complement: "Loja 4",
    district: "Batel",
    city: "Curitiba",
    state: "PR",
    zip: "80420-090",
    country: "BR",
    full: "Av. do Batel, 1868 - Loja 4, Batel, Curitiba - PR, 80420-090",
    /** Coordenadas da loja (mapa e dados estruturados). */
    lat: -25.4437,
    lng: -49.2907,
    mapsLink: "https://www.google.com/maps/search/?api=1&query=Av.+do+Batel,+1868+-+Batel,+Curitiba+-+PR",
    /** Embed sem chave de API. */
    mapsEmbed:
      "https://www.google.com/maps?q=Av.%20do%20Batel%2C%201868%20-%20Batel%2C%20Curitiba%20-%20PR&z=16&output=embed",
  },

  hours: [
    { label: "Segunda a sexta", value: "09h às 19h", days: ["Mo", "Tu", "We", "Th", "Fr"], opens: "09:00", closes: "19:00" },
    { label: "Sábado", value: "09h às 17h", days: ["Sa"], opens: "09:00", closes: "17:00" },
    { label: "Domingo e feriados", value: "Plantão com hora marcada", days: ["Su"], opens: "10:00", closes: "14:00" },
  ],

  social: {
    instagram: "https://www.instagram.com/marchettimotors",
    instagramHandle: "@marchettimotors",
    facebook: "https://www.facebook.com/marchettimotors",
    youtube: "https://www.youtube.com/@marchettimotors",
  },

  /** Numeros institucionais exibidos na secao "Sobre". */
  stats: [
    { value: 4200, suffix: "+", label: "Veículos entregues" },
    { value: 9800, suffix: "+", label: "Clientes atendidos" },
    { value: 16, suffix: " anos", label: "De mercado em Curitiba" },
    { value: 4.9, suffix: "/5", label: "Avaliação média (Google)", decimals: 1 },
  ],

  /** Parametros padrao do simulador de financiamento. */
  financing: {
    /** Taxa de juros mensal media praticada pelos bancos parceiros. */
    defaultMonthlyRate: 0.0149,
    minDownPaymentPercent: 0.2,
    installmentOptions: [12, 24, 36, 48, 60],
    defaultInstallments: 48,
    /** Custo de cadastro/registro embutido na simulacao. */
    fees: 1890,
    partners: ["Banco Itaú", "Santander Financiamentos", "Bradesco Financiamentos", "BV Financeira", "Banco Safra"],
  },

  warranty: {
    months: 3,
    label: "90 dias de garantia de motor e câmbio",
  },
} as const;

export type SiteConfig = typeof siteConfig;

/** Navegacao principal (header e rodape). */
export const mainNav = [
  { label: "Estoque", href: "/estoque" },
  { label: "Financiamento", href: "/financiamento" },
  { label: "Venda seu carro", href: "/avaliacao" },
  { label: "A revenda", href: "/sobre" },
  { label: "Contato", href: "/contato" },
] as const;

export const footerNav = {
  estoque: [
    { label: "Todo o estoque", href: "/estoque" },
    { label: "SUVs", href: "/estoque?carroceria=SUV" },
    { label: "Sedãs", href: "/estoque?carroceria=Sed%C3%A3" },
    { label: "Hatchs", href: "/estoque?carroceria=Hatch" },
    { label: "Picapes", href: "/estoque?carroceria=Picape" },
    { label: "Meus favoritos", href: "/favoritos" },
  ],
  institucional: [
    { label: "A revenda", href: "/sobre" },
    { label: "Depoimentos", href: "/sobre#depoimentos" },
    { label: "Como compramos", href: "/sobre#procedencia" },
    { label: "Onde estamos", href: "/contato#localizacao" },
  ],
  servicos: [
    { label: "Financiamento", href: "/financiamento" },
    { label: "Simular parcelas", href: "/financiamento#simulador" },
    { label: "Vender ou trocar", href: "/avaliacao" },
    { label: "Falar com consultor", href: "/contato" },
  ],
} as const;
