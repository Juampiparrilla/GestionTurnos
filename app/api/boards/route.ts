import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/require-role";
import { createBoardSchema } from "@/lib/validations/board";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const actor = await requireAdmin();
  if (!actor) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createBoardSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos." },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("boards")
    .insert({
      organization_id: actor.organization_id,
      name: parsed.data.name,
      description: parsed.data.description || null,
      created_by: actor.id,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[boards.POST] error:", error);
    return NextResponse.json(
      { error: `DEBUG: ${error.message} (${error.code ?? "sin code"})` },
      { status: 400 },
    );
  }

  return NextResponse.json({ ok: true, id: data.id });
}
