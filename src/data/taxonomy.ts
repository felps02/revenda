import type {
  BodyType,
  FuelType,
  TransmissionType,
  VehicleCategory,
  VehicleSort,
} from "@/types";

/** Rotulos e agrupamentos usados por filtros, cards e pagina do veiculo. */

export const CATEGORY_LABELS: Record<VehicleCategory, string> = {
  premium: "Premium",
  familia: "Família",
  economico: "Econômico",
  esportivo: "Esportivo",
  aventura: "Aventura",
  trabalho: "Trabalho",
  "primeiro-carro": "Primeiro carro",
  eletrificado: "Eletrificado",
};

export const CATEGORY_DESCRIPTIONS: Record<VehicleCategory, string> = {
  premium: "Marcas de luxo, baixa quilometragem e pacote completo de opcionais.",
  familia: "Espaço interno, porta-malas grande e segurança para levar todo mundo.",
  economico: "Baixo consumo, manutenção barata e revenda garantida.",
  esportivo: "Motorização forte, câmbio rápido e postura de quem gosta de dirigir.",
  aventura: "Altura livre do solo, tração e disposição para estrada de terra.",
  trabalho: "Picapes e utilitários prontos para carga e serviço pesado.",
  "primeiro-carro": "Fácil de dirigir, seguro barato e documentação em dia.",
  eletrificado: "Híbridos e elétricos com custo por quilômetro imbatível.",
};

export const BODY_TYPES: BodyType[] = [
  "SUV",
  "Sedã",
  "Hatch",
  "Picape",
  "Cupê",
  "Perua",
  "Minivan",
  "Conversível",
];

export const TRANSMISSIONS: TransmissionType[] = [
  "Automático",
  "Manual",
  "Automatizado",
  "CVT",
];

export const FUELS: FuelType[] = ["Flex", "Gasolina", "Diesel", "Híbrido", "Elétrico"];

export const SORT_OPTIONS: { value: VehicleSort; label: string }[] = [
  { value: "recentes", label: "Mais recentes" },
  { value: "menor-preco", label: "Menor preço" },
  { value: "maior-preco", label: "Maior preço" },
  { value: "menor-km", label: "Menor quilometragem" },
  { value: "ano-recente", label: "Ano mais novo" },
];

export interface FeatureGroup {
  id: string;
  title: string;
  items: string[];
}

/** Catalogo canonico de opcionais. `Vehicle.features` sempre usa estes rotulos. */
export const FEATURE_GROUPS: FeatureGroup[] = [
  {
    id: "conforto",
    title: "Conforto",
    items: [
      "Ar-condicionado",
      "Ar-condicionado digital dual zone",
      "Ar-condicionado traseiro",
      "Direção elétrica",
      "Bancos em couro",
      "Bancos elétricos",
      "Bancos com aquecimento",
      "Banco do motorista com memória",
      "Vidros elétricos",
      "Travas elétricas",
      "Retrovisores elétricos",
      "Retrovisor interno eletrocrômico",
      "Partida sem chave (Keyless)",
      "Porta-malas elétrico",
      "Volante multifuncional",
    ],
  },
  {
    id: "tecnologia",
    title: "Tecnologia",
    items: [
      "Central multimídia",
      "Apple CarPlay e Android Auto",
      "Câmera de ré",
      "Câmera 360°",
      "Sensor de estacionamento traseiro",
      "Sensor de estacionamento dianteiro",
      "Piloto automático",
      "Controle de cruzeiro adaptativo",
      "Painel digital",
      "Head-up display",
      "Carregador por indução",
      "Som premium",
      "Computador de bordo",
    ],
  },
  {
    id: "seguranca",
    title: "Segurança",
    items: [
      "Airbags frontais",
      "Airbags laterais",
      "Airbag de cortina",
      "Controle de estabilidade",
      "Controle de tração",
      "Frenagem automática de emergência",
      "Alerta de ponto cego",
      "Assistente de permanência em faixa",
      "Freio de estacionamento eletrônico",
      "Fixação Isofix",
      "Alarme",
    ],
  },
  {
    id: "externo",
    title: "Externo e mecânica",
    items: [
      "Faróis full LED",
      "Faróis de neblina",
      "Rodas de liga leve",
      "Teto solar",
      "Teto solar panorâmico",
      "Tração 4x4",
      "Tração integral AWD",
      "Modos de condução",
      "Suspensão adaptativa",
      "Engate para reboque",
      "Protetor de caçamba",
      "Rack de teto",
      "Start-stop",
    ],
  },
];

export const ALL_FEATURES: string[] = FEATURE_GROUPS.flatMap((group) => group.items);

/** Opcionais que mais pesam na decisao - viram checkbox no filtro avancado. */
export const HIGHLIGHT_FEATURES: string[] = [
  "Teto solar",
  "Bancos em couro",
  "Câmera de ré",
  "Central multimídia",
  "Apple CarPlay e Android Auto",
  "Sensor de estacionamento traseiro",
  "Piloto automático",
  "Faróis full LED",
  "Tração 4x4",
  "Rodas de liga leve",
];

export function featureGroupOf(feature: string): FeatureGroup | undefined {
  return FEATURE_GROUPS.find((group) => group.items.includes(feature));
}
