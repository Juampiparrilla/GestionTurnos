import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/require-role";
import { createUserSchema } from "@/lib/validations/user";

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
  return "No se pudo crear el usuario. Revisá los datos e intentá de nuevo.";
}

export async function POST(request: Request) {
  const actor = await requireAdmin();
  if (!actor) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createUserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos." },
      { status: 400 },
    );
  }

  if (parsed.data.role === "SUPER_ADMIN" && actor.role !== "SUPER_ADMIN") {
    return NextResponse.json(
      { error: "Solo un Super Administrador puede asignar ese rol." },
      { status: 403 },
    );
  }

  const admin = createAdminClient();
  const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(
    parsed.data.email,
  );

  if (inviteError || !invited.user) {
    let message = "No se pudo invitar al usuario por email.";
    if (inviteError?.message.includes("already been registered")) {
      message = "Ya existe un usuario con ese email.";
    } else if (inviteError?.code === "over_email_send_rate_limit") {
      message = "Se alcanzó el límite de emails por ahora. Esperá unos minutos e intentá de nuevo.";
    }
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const supabase = await createClient();
  const { error: profileError } = await supabase.from("profiles").insert({
    id: invited.user.id,
    organization_id: actor.organization_id,
    username: parsed.data.username,
    full_name: parsed.data.full_name,
    dni: parsed.data.dni,
    email: parsed.data.email,
    role: parsed.data.role,
    created_by: actor.id,
  });

  if (profileError) {
    await admin.auth.admin.deleteUser(invited.user.id);
    return NextResponse.json(
      { error: friendlyProfileError(profileError.message) },
      { status: 400 },
    );
  }

  return NextResponse.json({ ok: true });
}
