import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import { draftToVehicle, validateDraft, type VehicleDraft } from "@/lib/vehicleForm";
import { getInventoryStore } from "@/services/inventoryStore";
import type { VehicleStatus } from "@/types";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

function refresh(slug?: string) {
  revalidatePath("/");
  revalidatePath("/estoque");
  if (slug) revalidatePath(`/estoque/${slug}`);
}

/** Edição completa do anúncio. */
export async function PUT(request: Request, { params }: Params) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ ok: false, message: "Sessão expirada." }, { status: 401 });
  }

  const { id } = await params;
  const store = getInventoryStore();
  const existing = await store.get(id);

  if (!existing) {
    return NextResponse.json({ ok: false, message: "Veículo não encontrado." }, { status: 404 });
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

  const vehicle = draftToVehicle({ ...draft, id });
  await store.save(vehicle);

  refresh(vehicle.slug);
  if (existing.slug !== vehicle.slug) refresh(existing.slug);

  return NextResponse.json({ ok: true, vehicle });
}

/** Mudança rápida de status (disponível / reservado / vendido). */
export async function PATCH(request: Request, { params }: Params) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ ok: false, message: "Sessão expirada." }, { status: 401 });
  }

  const { id } = await params;
  const store = getInventoryStore();
  const existing = await store.get(id);

  if (!existing) {
    return NextResponse.json({ ok: false, message: "Veículo não encontrado." }, { status: 404 });
  }

  let body: { status?: VehicleStatus; featured?: boolean };
  try {
    body = (await request.json()) as { status?: VehicleStatus; featured?: boolean };
  } catch {
    return NextResponse.json({ ok: false, message: "Dados inválidos." }, { status: 400 });
  }

  const valid: VehicleStatus[] = ["disponivel", "reservado", "vendido"];
  const updated = {
    ...existing,
    ...(body.status && valid.includes(body.status) ? { status: body.status } : {}),
    ...(typeof body.featured === "boolean" ? { featured: body.featured } : {}),
  };

  await store.save(updated);
  refresh(updated.slug);

  return NextResponse.json({ ok: true, vehicle: updated });
}

export async function DELETE(_request: Request, { params }: Params) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ ok: false, message: "Sessão expirada." }, { status: 401 });
  }

  const { id } = await params;
  const store = getInventoryStore();
  const existing = await store.get(id);

  if (!existing) {
    return NextResponse.json({ ok: false, message: "Veículo não encontrado." }, { status: 404 });
  }

  await store.remove(id);
  refresh(existing.slug);

  return NextResponse.json({ ok: true });
}
