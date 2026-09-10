import { promises as fs } from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";

/**
 * Armazenamento das fotos dos anúncios.
 *
 * • Local  — grava em `public/veiculos/` e devolve `/veiculos/arquivo.jpg`.
 * • Vercel — grava no Vercel Blob quando existe BLOB_READ_WRITE_TOKEN.
 *
 * Na Vercel o disco é temporário, por isso o bucket é obrigatório lá.
 * Para trocar por S3, Cloudinary ou Supabase Storage, basta escrever outro
 * `PhotoStorage` e devolvê-lo em `getPhotoStorage()`.
 */
export interface PhotoStorage {
  save(file: File): Promise<{ url: string }>;
  readonly name: string;
}

export const MAX_PHOTO_MB = 8;
export const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

function buildFileName(file: File): string {
  const extension = EXTENSIONS[file.type] ?? "jpg";
  const base = file.name
    .replace(/\.[^.]+$/, "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return `${base || "foto"}-${randomBytes(4).toString("hex")}.${extension}`;
}

class LocalPhotoStorage implements PhotoStorage {
  readonly name = "disco local";

  async save(file: File): Promise<{ url: string }> {
    const dir = path.join(process.cwd(), "public", "veiculos");
    await fs.mkdir(dir, { recursive: true });

    const fileName = buildFileName(file);
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(path.join(dir, fileName), buffer);

    return { url: `/veiculos/${fileName}` };
  }
}

class BlobPhotoStorage implements PhotoStorage {
  readonly name = "Vercel Blob";

  async save(file: File): Promise<{ url: string }> {
    const { put } = await import("@vercel/blob");
    const result = await put(`veiculos/${buildFileName(file)}`, file, {
      access: "public",
      contentType: file.type,
    });
    return { url: result.url };
  }
}

export function getPhotoStorage(): PhotoStorage {
  return process.env.BLOB_READ_WRITE_TOKEN ? new BlobPhotoStorage() : new LocalPhotoStorage();
}

export function validatePhotoFile(file: File): string | null {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return `${file.name}: formato não aceito (use JPG, PNG, WEBP ou AVIF).`;
  }
  if (file.size > MAX_PHOTO_MB * 1024 * 1024) {
    return `${file.name}: passa de ${MAX_PHOTO_MB}MB.`;
  }
  return null;
}
