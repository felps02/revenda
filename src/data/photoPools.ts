import type { VehicleImage, VehicleImageKind } from "@/types";

/**
 * Bancos de fotos genéricas do estoque de demonstração.
 *
 * Fotos externas pertencem a cada veículo (ficam declaradas em `vehicles.ts`).
 * Já interior, painel, bancos, motor, porta-malas e detalhes são ilustrativos e
 * distribuídos de forma determinística entre os anúncios por `buildGallery`,
 * para que a mesma foto não se repita dentro de um anúncio nem em anúncios
 * vizinhos. Ao cadastrar o estoque real, cada veículo passa a ter suas próprias
 * fotos e este arquivo pode ser removido.
 */

export interface PoolImage {
  url: string;
  caption: string;
}

export const photoPools: Record<Exclude<VehicleImageKind, "exterior">, PoolImage[]> = {
  interior: [
    {
      url: "https://images.pexels.com/photos/193999/pexels-photo-193999.jpeg?auto=compress&cs=tinysrgb&w=1600",
      caption: "Interior em couro claro",
    },
  ],
  painel: [
    {
      url: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=1600&q=80",
      caption: "Painel e central multimidia",
    },
  ],
  bancos: [],
  motor: [
    {
      url: "https://images.pexels.com/photos/190574/pexels-photo-190574.jpeg?auto=compress&cs=tinysrgb&w=1600",
      caption: "Compartimento do motor",
    },
  ],
  "porta-malas": [],
  detalhe: [
    {
      url: "https://images.unsplash.com/photo-1554744512-d6c603f27c54?auto=format&fit=crop&w=1600&q=80",
      caption: "Farol em detalhe",
    },
    {
      url: "https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=1600&q=80",
      caption: "Lanterna traseira",
    },
    {
      url: "https://images.unsplash.com/photo-1573950940509-d924ee3fd345?auto=format&fit=crop&w=1600&q=80",
      caption: "Roda de liga leve",
    },
    {
      url: "https://images.pexels.com/photos/919073/pexels-photo-919073.jpeg?auto=compress&cs=tinysrgb&w=1600",
      caption: "Traseira em detalhe",
    },
  ],
};

/** Quantidade padrão de fotos por tipo em cada anúncio. */
const DEFAULT_PLAN: Array<{ kind: Exclude<VehicleImageKind, "exterior">; count: number }> = [
  { kind: "interior", count: 1 },
  { kind: "painel", count: 1 },
  { kind: "detalhe", count: 2 },
  { kind: "motor", count: 1 },
];

/** Hash estável (djb2) - mesma entrada, mesma galeria em todo build. */
function hash(seed: string): number {
  let value = 5381;
  for (let i = 0; i < seed.length; i += 1) {
    value = ((value << 5) + value + seed.charCodeAt(i)) >>> 0;
  }
  return value;
}

function pick(pool: PoolImage[], seed: string, count: number): PoolImage[] {
  if (pool.length === 0 || count <= 0) return [];
  const start = hash(seed) % pool.length;
  const stride = 1 + (hash(`${seed}-passo`) % Math.max(1, pool.length - 1));
  const chosen: PoolImage[] = [];
  const used = new Set<number>();
  for (let i = 0; chosen.length < Math.min(count, pool.length) && i < pool.length * 2; i += 1) {
    const index = (start + i * stride) % pool.length;
    if (used.has(index)) continue;
    used.add(index);
    chosen.push(pool[index]);
  }
  return chosen;
}

/**
 * Monta a galeria completa do anúncio: fotos externas do próprio carro
 * seguidas das internas/detalhes distribuídas a partir dos bancos.
 */
export function buildGallery(
  id: string,
  title: string,
  exterior: PoolImage[],
  plan = DEFAULT_PLAN,
): VehicleImage[] {
  const toImage = (item: PoolImage, kind: VehicleImageKind): VehicleImage => ({
    url: item.url,
    kind,
    caption: item.caption,
    alt: `${title} - ${item.caption.toLowerCase()}`,
  });

  const images = exterior.map((item) => toImage(item, "exterior"));

  for (const step of plan) {
    const pool = photoPools[step.kind];
    for (const item of pick(pool, `${id}-${step.kind}`, step.count)) {
      images.push(toImage(item, step.kind));
    }
  }

  return images;
}
