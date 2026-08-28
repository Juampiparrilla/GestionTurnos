import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/require-role";
import { updateOrganizationSchema } from "@/lib/validations/organization";

export const runtime = "nodejs";

export async function PATCH(request: Request) {
  const actor = await requireAdmin();
  if (!actor) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = updateOrganizationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos." },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("organizations")
    .update({ name: parsed.data.name, phone: parsed.data.phone || null })
    .eq("id", actor.organization_id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "No se pudo guardar el cambio. Intentá de nuevo." }, { status: 400 });
  }

  return NextResponse.json({ ok: true, organization: data });
}
