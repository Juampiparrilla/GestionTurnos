import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/session";
import { createCajaMovimientoSchema } from "@/lib/validations/caja-movimiento";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const profile = await getCurrentProfile();
  if (!profile) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const url = new URL(request.url);
  const desde = url.searchParams.get("desde");
  const hasta = url.searchParams.get("hasta");
  const boardId = url.searchParams.get("boardId");
  const shiftConfigurationId = url.searchParams.get("shiftConfigurationId");
  const tipo = url.searchParams.get("tipo");
  const etiquetaId = url.searchParams.get("etiquetaId");

  const supabase = await createClient();
  let query = supabase.from("caja_movimientos").select("*").order("fecha", { ascending: false }).order("created_at", { ascending: false });

  if (desde) query = query.gte("fecha", desde);
  if (hasta) query = query.lte("fecha", hasta);
  if (boardId) query = query.eq("board_id", boardId);
  if (shiftConfigurationId === "sin_turno") {
    query = query.is("shift_configuration_id", null);
  } else if (shiftConfigurationId) {
    query = query.eq("shift_configuration_id", shiftConfigurationId);
  }
  if (tipo) query = query.eq("tipo", tipo);
  if (etiquetaId) query = query.eq("etiqueta_id", etiquetaId);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: "No se pudieron cargar los movimientos." }, { status: 400 });
  }

  return NextResponse.json({ movimientos: data });
}

export async function POST(request: Request) {
  const actor = await getCurrentProfile();
  if (!actor || !actor.active) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createCajaMovimientoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos." },
      { status: 400 },
    );
  }

  const d = parsed.data;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("caja_movimientos")
    .insert({
      organization_id: actor.organization_id,
      tipo: d.tipo,
      etiqueta_id: d.etiquetaId,
      monto: d.monto,
      fecha: d.fecha,
      board_id: d.boardId,
      shift_configuration_id: d.shiftConfigurationId,
      observacion: d.observacion || null,
      created_by: actor.id,
    })
    .select("id")
    .single();

  if (error) {
    const message =
      error.code === "42501"
        ? "No tenés permiso para cargar movimientos en ese local."
        : "No se pudo crear el movimiento. Intentá de nuevo.";
    return NextResponse.json({ error: message }, { status: error.code === "42501" ? 403 : 400 });
  }

  return NextResponse.json({ ok: true, id: data.id });
}
