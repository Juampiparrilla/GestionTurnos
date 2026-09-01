import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/require-role";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const actor = await requireAdmin();
  if (!actor) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const { id } = await params;

  const supabase = await createClient();
  const { data, error } = await supabase.from("productos").select("*").eq("proveedor_id", id).order("nombre");

  if (error) {
    return NextResponse.json({ error: "No se pudieron cargar los productos." }, { status: 400 });
  }

  return NextResponse.json({ productos: data });
}
