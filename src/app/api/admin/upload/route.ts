import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getPhotoStorage, validatePhotoFile } from "@/services/photoStorage";

export const runtime = "nodejs";
export const maxDuration = 60;

/** Recebe as fotos do painel e devolve as URLs já publicadas. */
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ ok: false, message: "Sessão expirada." }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ ok: false, message: "Envio inválido." }, { status: 400 });
  }

  const files = form.getAll("fotos").filter((item): item is File => item instanceof File);

  if (files.length === 0) {
    return NextResponse.json({ ok: false, message: "Nenhuma foto enviada." }, { status: 400 });
  }

  const problems = files.map(validatePhotoFile).filter(Boolean);
  if (problems.length > 0) {
    return NextResponse.json({ ok: false, message: problems.join(" ") }, { status: 422 });
  }

  const storage = getPhotoStorage();

  try {
    const uploaded = await Promise.all(files.map((file) => storage.save(file)));
    return NextResponse.json({ ok: true, urls: uploaded.map((item) => item.url) }, { status: 201 });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        message: `Não foi possível salvar as fotos (${storage.name}). Tente novamente ou cole a URL da imagem.`,
      },
      { status: 500 },
    );
  }
}
