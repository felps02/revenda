import { BODY_TYPES, FUELS, TRANSMISSIONS, CATEGORY_LABELS } from "@/data/taxonomy";
import { buildVehicleSlug, slugify } from "@/lib/slug";
import type {
  BodyType,
  FuelType,
  TransmissionType,
  Vehicle,
  VehicleCategory,
  VehicleImage,
  VehicleStatus,
} from "@/types";

/**
 * Ponte entre o formulário do painel (tudo texto) e o objeto `Vehicle`.
 * Usada tanto pela tela quanto pela API, para a validação ser a mesma nos dois.
 */

export interface VehicleDraft {
  id: string;
  brand: string;
  model: string;
  version: string;
  year: string;
  manufactureYear: string;
  price: string;
  previousPrice: string;
  mileage: string;
  transmission: string;
  fuel: string;
  body: string;
  category: string;
  color: string;
  doors: string;
  engine: string;
  power: string;
  plateEnd: string;
  licensed: boolean;
  singleOwner: boolean;
  warranty: string;
  featured: boolean;
  financingAvailable: boolean;
  status: string;
  location: string;
  createdAt: string;
  description: string;
  highlights: string[];
  features: string[];
  images: VehicleImage[];
}

export const STATUS_LABELS: Record<VehicleStatus, string> = {
  disponivel: "Disponível",
  reservado: "Reservado",
  vendido: "Vendido",
};

export const CATEGORY_OPTIONS = Object.entries(CATEGORY_LABELS).map(([value, label]) => ({
  value,
  label,
}));

export function emptyDraft(): VehicleDraft {
  const now = new Date();
  return {
    id: "",
    brand: "",
    model: "",
    version: "",
    year: String(now.getFullYear()),
    manufactureYear: String(now.getFullYear() - 1),
    price: "",
    previousPrice: "",
    mileage: "",
    transmission: "Automático",
    fuel: "Flex",
    body: "SUV",
    category: "familia",
    color: "",
    doors: "4",
    engine: "",
    power: "",
    plateEnd: "0",
    licensed: true,
    singleOwner: false,
    warranty: "",
    featured: false,
    financingAvailable: true,
    status: "disponivel",
    location: "Unidade Batel - Curitiba/PR",
    createdAt: now.toISOString(),
    description: "",
    highlights: [],
    features: [],
    images: [],
  };
}

export function vehicleToDraft(vehicle: Vehicle): VehicleDraft {
  return {
    id: vehicle.id,
    brand: vehicle.brand,
    model: vehicle.model,
    version: vehicle.version,
    year: String(vehicle.year),
    manufactureYear: String(vehicle.manufactureYear),
    price: String(vehicle.price),
    previousPrice: vehicle.previousPrice ? String(vehicle.previousPrice) : "",
    mileage: String(vehicle.mileage),
    transmission: vehicle.transmission,
    fuel: vehicle.fuel,
    body: vehicle.body,
    category: vehicle.category,
    color: vehicle.color,
    doors: String(vehicle.doors),
    engine: vehicle.engine,
    power: String(vehicle.power),
    plateEnd: String(vehicle.plateEnd),
    licensed: vehicle.licensed,
    singleOwner: vehicle.singleOwner,
    warranty: vehicle.warranty ?? "",
    featured: vehicle.featured,
    financingAvailable: vehicle.financingAvailable,
    status: vehicle.status,
    location: vehicle.location,
    createdAt: vehicle.createdAt,
    description: vehicle.description,
    highlights: vehicle.highlights,
    features: vehicle.features,
    images: vehicle.images,
  };
}

export type DraftErrors = Partial<Record<keyof VehicleDraft, string>>;

function toInt(value: string): number {
  const digits = String(value).replace(/[^\d]/g, "");
  return digits ? Number(digits) : 0;
}

/** Código do anúncio a partir da marca e do ano: "MM-HON23-4F2K". */
function generateId(brand: string, year: number): string {
  const prefix = slugify(brand).replace(/-/g, "").slice(0, 3).toUpperCase() || "MM";
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${prefix}${String(year).slice(-2)}${random}`;
}

export function validateDraft(draft: VehicleDraft): DraftErrors {
  const errors: DraftErrors = {};
  const currentYear = new Date().getFullYear();

  if (!draft.brand.trim()) errors.brand = "Informe a marca";
  if (!draft.model.trim()) errors.model = "Informe o modelo";
  if (!draft.version.trim()) errors.version = "Informe a versão (ex.: XEi 2.0 Flex)";

  const year = toInt(draft.year);
  if (year < 1970 || year > currentYear + 1) errors.year = `Ano entre 1970 e ${currentYear + 1}`;

  const manufactureYear = toInt(draft.manufactureYear);
  if (manufactureYear < 1970 || manufactureYear > year) {
    errors.manufactureYear = "Ano de fabricação inválido";
  }

  if (toInt(draft.price) <= 0) errors.price = "Informe o preço";
  if (draft.previousPrice && toInt(draft.previousPrice) <= toInt(draft.price)) {
    errors.previousPrice = "O preço anterior precisa ser maior que o atual";
  }
  if (toInt(draft.mileage) < 0) errors.mileage = "Quilometragem inválida";
  if (!draft.color.trim()) errors.color = "Informe a cor";
  if (!draft.engine.trim()) errors.engine = "Informe o motor (ex.: 1.0 Turbo)";
  if (toInt(draft.power) <= 0) errors.power = "Informe a potência em cv";
  if (draft.images.length === 0) errors.images = "Adicione pelo menos uma foto";
  if (draft.description.trim().length < 40) {
    errors.description = "Escreva uma descrição com pelo menos 40 caracteres";
  }

  if (!TRANSMISSIONS.includes(draft.transmission as TransmissionType)) {
    errors.transmission = "Câmbio inválido";
  }
  if (!FUELS.includes(draft.fuel as FuelType)) errors.fuel = "Combustível inválido";
  if (!BODY_TYPES.includes(draft.body as BodyType)) errors.body = "Carroceria inválida";
  if (!(draft.category in CATEGORY_LABELS)) errors.category = "Categoria inválida";

  return errors;
}

/** Converte o rascunho validado em um `Vehicle` pronto para gravar. */
export function draftToVehicle(draft: VehicleDraft): Vehicle {
  const year = toInt(draft.year);
  const id = draft.id.trim() || generateId(draft.brand, year);
  const previousPrice = toInt(draft.previousPrice);

  const base = {
    id,
    brand: draft.brand.trim(),
    model: draft.model.trim(),
    version: draft.version.trim(),
    year,
  };

  return {
    ...base,
    slug: buildVehicleSlug(base),
    manufactureYear: toInt(draft.manufactureYear) || year,
    price: toInt(draft.price),
    ...(previousPrice > 0 ? { previousPrice } : {}),
    mileage: toInt(draft.mileage),
    transmission: draft.transmission as TransmissionType,
    fuel: draft.fuel as FuelType,
    body: draft.body as BodyType,
    category: draft.category as VehicleCategory,
    color: draft.color.trim(),
    doors: toInt(draft.doors) || 4,
    engine: draft.engine.trim(),
    power: toInt(draft.power),
    plateEnd: toInt(draft.plateEnd),
    licensed: draft.licensed,
    singleOwner: draft.singleOwner,
    ...(draft.warranty.trim() ? { warranty: draft.warranty.trim() } : {}),
    features: draft.features.filter(Boolean),
    description: draft.description.trim(),
    highlights: draft.highlights.map((item) => item.trim()).filter(Boolean).slice(0, 3),
    images: draft.images,
    financingAvailable: draft.financingAvailable,
    featured: draft.featured,
    status: (draft.status as VehicleStatus) || "disponivel",
    createdAt: draft.createdAt || new Date().toISOString(),
    location: draft.location.trim() || "Unidade Batel - Curitiba/PR",
  };
}
