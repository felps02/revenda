/** Formatadores pt-BR usados em todo o site (precos, km, datas, telefone). */

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

const brlCents = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const decimal = new Intl.NumberFormat("pt-BR");

export function formatCurrency(value: number): string {
  if (!Number.isFinite(value)) return "Sob consulta";
  return brl.format(value);
}

export function formatCurrencyCents(value: number): string {
  if (!Number.isFinite(value)) return "Sob consulta";
  return brlCents.format(value);
}

/** 189000 -> "R$ 189 mil" (usado em faixas de preco compactas). */
export function formatCurrencyShort(value: number): string {
  if (!Number.isFinite(value)) return "-";
  if (value >= 1_000_000) {
    const millions = value / 1_000_000;
    return `R$ ${decimal.format(Number(millions.toFixed(millions < 10 ? 1 : 0)))} mi`;
  }
  if (value >= 1000) return `R$ ${Math.round(value / 1000)} mil`;
  return brl.format(value);
}

export function formatNumber(value: number): string {
  return decimal.format(value);
}

export function formatMileage(km: number): string {
  if (km <= 0) return "0 km";
  return `${decimal.format(km)} km`;
}

/** 30000 -> "30 mil km" para cards compactos. */
export function formatMileageShort(km: number): string {
  if (km <= 0) return "0 km";
  if (km >= 1000) return `${decimal.format(Math.round(km / 1000))} mil km`;
  return `${decimal.format(km)} km`;
}

/** Ano de fabricacao/modelo no padrao de anuncio: "2021/2022". */
export function formatYearPair(manufactureYear: number, modelYear: number): string {
  return manufactureYear === modelYear
    ? String(modelYear)
    : `${manufactureYear}/${modelYear}`;
}

export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

/** "Há 3 dias" - usado no selo de recem-chegado. */
export function formatRelativeDays(iso: string, reference: Date = new Date()): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const days = Math.floor((reference.getTime() - date.getTime()) / 86_400_000);
  if (days <= 0) return "Chegou hoje";
  if (days === 1) return "Chegou ontem";
  if (days < 30) return `Há ${days} dias`;
  const months = Math.floor(days / 30);
  return months === 1 ? "Há 1 mês" : `Há ${months} meses`;
}

/** 5541998450220 -> "(41) 99845-0220" */
export function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "").replace(/^55/, "");
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return raw;
}

/** Mascara progressiva para input de telefone. */
export function maskPhoneInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits.replace(/(\d{0,2})/, "($1");
  if (digits.length <= 6) return digits.replace(/(\d{2})(\d{0,4})/, "($1) $2");
  if (digits.length <= 10) return digits.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
  return digits.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
}

/** Mascara de moeda para inputs ("120000" -> "R$ 120.000"). */
export function maskCurrencyInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 9);
  if (!digits) return "";
  return brl.format(Number(digits));
}

export function parseCurrencyInput(value: string): number {
  const digits = value.replace(/\D/g, "");
  return digits ? Number(digits) : 0;
}

export function pluralize(count: number, singular: string, plural: string): string {
  return count === 1 ? singular : plural;
}

export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
