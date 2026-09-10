import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import { draftToVehicle, validateDraft, type VehicleDraft } from "@/lib/vehicleForm";
import { getInventoryStore } from "@/services/inventoryStore";

export const runtime = "nodejs";

/** Cadastro de um veículo novo. */
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ ok: false, message: "Sessão expirada." }, { status: 401 });
  }

  let draft: VehicleDraft;
  try {
    draft = (await request.json()) as VehicleDraft;
  } catch {
    return NextResponse.json({ ok: false, message: "Dados inválidos." }, { status: 400 });
  }

  const errors = validateDraft(draft);
  if (Object.keys(errors).length > 0) {
    return NextResponse.json(
      { ok: false, message: "Confira os campos destacados.", errors },
      { status: 422 },
    );
  }

  const vehicle = draftToVehicle(draft);
  const store = getInventoryStore();

  if (await store.get(vehicle.id)) {
    return NextResponse.json(
      { ok: false, message: `Já existe um veículo com o código ${vehicle.id}.` },
      { status: 409 },
    );
  }

  await store.save(vehicle);

  revalidatePath("/");
  revalidatePath("/estoque");
  revalidatePath(`/estoque/${vehicle.slug}`);

  return NextResponse.json({ ok: true, vehicle }, { status: 201 });
}
