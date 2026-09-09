/** Validacao dos formularios - sem dependencia externa, mensagens em pt-BR. */

export type FieldErrors<T extends string = string> = Partial<Record<T, string>>;

export function isFilled(value: unknown): boolean {
  return typeof value === "string" ? value.trim().length > 0 : value !== undefined && value !== null;
}

export function validateName(value: string): string | undefined {
  const name = value.trim();
  if (!name) return "Informe seu nome";
  if (name.length < 3) return "Nome muito curto";
  if (!/\s/.test(name)) return "Informe nome e sobrenome";
  return undefined;
}

/** Aceita (41) 99845-0220 / 41998450220 / +55 41 99845-0220. */
export function validatePhone(value: string): string | undefined {
  const digits = value.replace(/\D/g, "").replace(/^55/, "");
  if (!digits) return "Informe seu WhatsApp";
  if (digits.length < 10) return "Número incompleto";
  if (digits.length > 11) return "Número inválido";
  if (digits.length === 11 && digits[2] !== "9") return "Celular deve começar com 9";
  if (/^(\d)\1+$/.test(digits)) return "Número inválido";
  return undefined;
}

export function validateEmail(value: string, required = false): string | undefined {
  const email = value.trim();
  if (!email) return required ? "Informe seu e-mail" : undefined;
  if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email)) return "E-mail inválido";
  return undefined;
}

export function validateYear(value: string | number): string | undefined {
  const year = Number(String(value).replace(/\D/g, ""));
  if (!year) return "Informe o ano";
  const limit = new Date().getFullYear() + 1;
  if (year < 1970 || year > limit) return `Ano entre 1970 e ${limit}`;
  return undefined;
}

export function validateRequired(value: string, label = "Campo"): string | undefined {
  return value.trim() ? undefined : `${label} é obrigatório`;
}

export function validateMinLength(value: string, min: number, label = "Campo"): string | undefined {
  return value.trim().length >= min ? undefined : `${label} precisa de pelo menos ${min} caracteres`;
}

export function hasErrors(errors: FieldErrors): boolean {
  return Object.values(errors).some(Boolean);
}

/** Limites do upload de fotos no formulario de avaliacao. */
export const UPLOAD_LIMITS = {
  maxFiles: 8,
  maxSizeMb: 8,
  accept: "image/png,image/jpeg,image/webp,image/heic",
};

export function validatePhotos(files: File[]): string | undefined {
  if (files.length > UPLOAD_LIMITS.maxFiles) {
    return `Envie no máximo ${UPLOAD_LIMITS.maxFiles} fotos`;
  }
  const tooBig = files.find((file) => file.size > UPLOAD_LIMITS.maxSizeMb * 1024 * 1024);
  if (tooBig) return `Cada foto deve ter até ${UPLOAD_LIMITS.maxSizeMb}MB (${tooBig.name} é maior)`;
  return undefined;
}
