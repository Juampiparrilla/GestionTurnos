import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireSuperAdmin } from "@/lib/auth/require-role";
import { updateUserSchema } from "@/lib/validations/user";

export const runtime = "nodejs";

function friendlyProfileError(message: string): string {
  if (message.includes("profiles_org_dni_unique")) {
    return "Ya existe un usuario con ese DNI en tu organización.";
  }
  if (message.includes("profiles_org_email_unique")) {
    return "Ya existe un usuario con ese email en tu organización.";
  }
  if (message.includes("profiles_org_username_unique")) {
    return "Ya existe un usuario con ese nombre de usuario en tu organización.";
  }
  if (message.includes("No podés modificar tu propio rol")) {
    return "No podés modificar tu propio rol.";
  }
  if (message.includes("Solo un SUPER_ADMIN puede asignar el rol SUPER_ADMIN")) {
    return "Solo un Super Administrador puede asignar ese rol.";
  }
  return "No se pudo guardar el cambio. Intentá de nuevo.";
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const actor = await requireSuperAdmin();
  if (!actor) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const { id } = await params;

  const body = await request.json().catch(() => null);
  const parsed = updateUserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos." },
      { status: 400 },
    );
  }

  if (Object.keys(parsed.data).length === 0) {
    return NextResponse.json({ error: "No hay cambios para guardar." }, { status: 400 });
  }

  if (parsed.data.role === "SUPER_ADMIN" && actor.role !== "SUPER_ADMIN") {
    return NextResponse.json(
      { error: "Solo un Super Administrador puede asignar ese rol." },
      { status: 403 },
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .update(parsed.data)
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: friendlyProfileError(error.message) }, { status: 400 });
  }

  if (!data) {
    return NextResponse.json({ error: "Usuario no encontrado." }, { status: 404 });
  }

  // Si active pasó a false, un trigger de base de datos limpia
  // automáticamente sus asignaciones vigentes en todos los tableros.

  return NextResponse.json({ ok: true });
}
