/**
 * Banco de imagens do site (fotos que não pertencem a um veículo do estoque):
 * hero, vitrines de categoria, fotos da loja, avatares de depoimentos.
 *
 * Ao publicar com fotos próprias, troque apenas as URLs abaixo — nenhum
 * componente referencia imagem diretamente.
 */

const unsplash = (id: string, width = 1600) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&q=80`;
const pexels = (id: string, width = 1600) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${width}`;

export interface MediaItem {
  url: string;
  alt: string;
}

export const siteMedia = {
  hero: {
    main: {
      url: unsplash("1503376780353-7e6692767b70", 2000),
      alt: "Sedã esportivo preto rodando ao entardecer",
    } as MediaItem,
    secondary: {
      url: unsplash("1614162692292-7ac56d7f7f1e"),
      alt: "Cupê esportivo branco parado em estrada de montanha",
    } as MediaItem,
  },

  /** Vitrines por carroceria na home (chave = valor de `BodyType`). */
  categories: {
    SUV: { url: pexels("5570662"), alt: "SUV preto em rua urbana" } as MediaItem,
    "Sedã": { url: unsplash("1616422285623-13ff0162193c"), alt: "Sedã branco de quatro portas" } as MediaItem,
    Hatch: { url: unsplash("1550355291-bbee04a92027"), alt: "Hatch esportivo vermelho" } as MediaItem,
    Picape: { url: unsplash("1551830820-330a71b99659"), alt: "Picape cabine dupla azul" } as MediaItem,
  },

  /** Fotos da loja e da oficina, usadas na página "A revenda". */
  showroom: [
    { url: pexels("164634"), alt: "Veículos seminovos alinhados no pátio da loja" },
    { url: unsplash("1583121274602-3e2820c69888"), alt: "Showroom coberto com veículo em exposição" },
    { url: pexels("6870313"), alt: "Técnico fazendo o diagnóstico eletrônico de um veículo" },
    { url: pexels("3806288"), alt: "Alinhamento e balanceamento na oficina da loja" },
    { url: pexels("3806249"), alt: "Troca de pneus na revisão de entrega" },
    { url: pexels("4489749"), alt: "Inspeção da suspensão com o carro no elevador" },
  ] as MediaItem[],

  about: {
    story: { url: pexels("164634"), alt: "Pátio da Marchetti Motors com os seminovos do mês" } as MediaItem,
    delivery: { url: unsplash("1583121274602-3e2820c69888"), alt: "Veículo preparado para a entrega no showroom" } as MediaItem,
    inspection: { url: pexels("6870313"), alt: "Avaliação de 120 itens na oficina própria" } as MediaItem,
  },

  financing: {
    url: unsplash("1449965408869-eaa3f722e40d"),
    alt: "Motorista dirigindo o carro recém-comprado ao entardecer",
  } as MediaItem,
  tradeIn: {
    url: pexels("5835359"),
    alt: "Avaliador conferindo o motor de um veículo usado",
  } as MediaItem,
  cta: {
    url: pexels("2365572"),
    alt: "Cupê esportivo em destaque no pátio",
  } as MediaItem,
} as const;

/** Avatares dos depoimentos (mesma ordem de `testimonials`). */
const avatar = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=200&h=200&q=80`;

export const avatarPool: string[] = [
  avatar("1500648767791-00dcc994a43e"),
  avatar("1494790108377-be9c29b29330"),
  avatar("1560250097-0b93528c311a"),
  avatar("1573496359142-b8d87734a5a2"),
  avatar("1507003211169-0a1dd7228f2d"),
  avatar("1438761681033-6461ffad8d80"),
  avatar("1472099645785-5658abf4ff4e"),
  avatar("1544005313-94ddf0286df2"),
  avatar("1519345182560-3f2917c472ef"),
  avatar("1487412720507-e7ab37603c6f"),
];
