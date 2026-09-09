/**
 * Modelo de dominio do veiculo.
 *
 * Este arquivo e a fonte da verdade do estoque. A UI nunca importa dados
 * diretamente: ela conversa com o `vehicleRepository`, que hoje le um arquivo
 * estatico e amanha pode ler uma API/banco sem alterar nenhum componente.
 */

export type TransmissionType = "Manual" | "Automático" | "Automatizado" | "CVT";

export type FuelType =
  | "Flex"
  | "Gasolina"
  | "Diesel"
  | "Híbrido"
  | "Elétrico";

export type BodyType =
  | "Sedã"
  | "SUV"
  | "Hatch"
  | "Picape"
  | "Cupê"
  | "Perua"
  | "Minivan"
  | "Conversível";

/** Segmento comercial usado no filtro "Categoria" (diferente da carroceria). */
export type VehicleCategory =
  | "premium"
  | "familia"
  | "economico"
  | "esportivo"
  | "aventura"
  | "trabalho"
  | "primeiro-carro"
  | "eletrificado";

export type VehicleStatus = "disponivel" | "reservado" | "vendido";

export type VehicleImageKind =
  | "exterior"
  | "interior"
  | "painel"
  | "bancos"
  | "motor"
  | "porta-malas"
  | "detalhe";

export interface VehicleImage {
  url: string;
  alt: string;
  kind: VehicleImageKind;
  /** Legenda curta exibida na galeria (ex.: "Painel e multimidia"). */
  caption?: string;
}

export interface Vehicle {
  id: string;
  /** URL amigavel: `marca-modelo-versao-ano-id`. Gerado por `buildVehicleSlug`. */
  slug: string;
  brand: string;
  model: string;
  version: string;
  /** Ano do modelo (o que aparece no anuncio). */
  year: number;
  /** Ano de fabricacao. */
  manufactureYear: number;
  price: number;
  /** Preco de tabela anterior; quando existe, exibimos o selo de oportunidade. */
  previousPrice?: number;
  mileage: number;
  transmission: TransmissionType;
  fuel: FuelType;
  body: BodyType;
  category: VehicleCategory;
  color: string;
  doors: number;
  /** Motorizacao comercial, ex.: "2.0 TSI Turbo". */
  engine: string;
  /** Potencia em cavalos. */
  power: number;
  /** Final da placa (usado por clientes com rodizio). */
  plateEnd: number;
  /** IPVA do ano corrente quitado. */
  licensed: boolean;
  singleOwner: boolean;
  /** Garantia remanescente, quando houver. */
  warranty?: string;
  /** Opcionais do veiculo (rotulos canonicos do catalogo em data/taxonomy). */
  features: string[];
  description: string;
  /** Ate 3 argumentos curtos de venda exibidos na pagina do veiculo. */
  highlights: string[];
  images: VehicleImage[];
  financingAvailable: boolean;
  featured: boolean;
  status: VehicleStatus;
  /** ISO date - base da ordenacao "Mais recentes". */
  createdAt: string;
  /** Unidade/loja onde o carro esta fisicamente. */
  location: string;
}

export interface VehicleFilters {
  /** Busca livre por marca, modelo, versao ou opcional. */
  q?: string;
  brands?: string[];
  models?: string[];
  bodies?: BodyType[];
  categories?: VehicleCategory[];
  transmissions?: TransmissionType[];
  fuels?: FuelType[];
  colors?: string[];
  features?: string[];
  yearMin?: number;
  yearMax?: number;
  priceMin?: number;
  priceMax?: number;
  mileageMax?: number;
  onlyFinancing?: boolean;
  onlyFeatured?: boolean;
  /** Ids especificos (usado pela pagina de favoritos). */
  ids?: string[];
}

export type VehicleSort =
  | "recentes"
  | "menor-preco"
  | "maior-preco"
  | "menor-km"
  | "ano-recente";

export interface VehicleQuery {
  filters?: VehicleFilters;
  sort?: VehicleSort;
  page?: number;
  perPage?: number;
}

export interface VehicleListResult {
  items: Vehicle[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface FacetOption {
  value: string;
  label: string;
  count: number;
}

export interface RangeFacet {
  min: number;
  max: number;
}

export interface VehicleFacets {
  brands: FacetOption[];
  /** Modelos agrupados por marca, para o combo dependente de "Marca". */
  modelsByBrand: Record<string, FacetOption[]>;
  models: FacetOption[];
  bodies: FacetOption[];
  categories: FacetOption[];
  transmissions: FacetOption[];
  fuels: FacetOption[];
  colors: FacetOption[];
  features: FacetOption[];
  year: RangeFacet;
  price: RangeFacet;
  mileage: RangeFacet;
  total: number;
}
