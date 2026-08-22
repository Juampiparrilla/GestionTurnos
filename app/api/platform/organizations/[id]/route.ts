import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requirePlatformAdmin } from "@/lib/auth/require-role";
import { z } from "zod";

export const runtime = "nodejs";

const patchSchema = z.object({ active: z.boolean() });

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const actor = await requirePlatformAdmin();
  if (!actor) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const { id } = await params;

  const body = await request.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("toggle_organization_active", {
    p_organization_id: id,
    p_active: parsed.data.active,
  });

  if (error) {
    return NextResponse.json(
      { error: "No se pudo actualizar el estado de la organización." },
      { status: 400 },
    );
  }

  return NextResponse.json({ ok: true });
}
