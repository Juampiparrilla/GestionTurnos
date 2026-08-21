import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/require-role";
import { createUserSchema } from "@/lib/validations/user";
import { generateInvitationToken, hashInvitationToken } from "@/lib/invitations/token";
import { INVITATION_EXPIRATION_HOURS } from "@/lib/invitations/config";
import { buildInvitationUrl } from "@/lib/invitations/share";

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

  // Se crea el usuario de Auth SIN contraseña y sin disparar ningún email:
  // la persona no puede loguearse todavía. Nuestra propia tabla
  // `invitations` es la que autoriza fijar la contraseña más adelante.
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email: parsed.data.email,
    email_confirm: true,
  });

  if (createError || !created.user) {
    const message = createError?.message.includes("already been registered")
      ? "Ya existe un usuario con ese email."
      : "No se pudo crear el usuario.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const supabase = await createClient();
  const { error: profileError } = await supabase.from("profiles").insert({
    id: created.user.id,
    organization_id: actor.organization_id,
    username: parsed.data.username,
    full_name: parsed.data.full_name,
    dni: parsed.data.dni,
    email: parsed.data.email,
    role: parsed.data.role,
    created_by: actor.id,
  });

  if (profileError) {
    await admin.auth.admin.deleteUser(created.user.id);
    return NextResponse.json(
      { error: friendlyProfileError(profileError.message) },
      { status: 400 },
    );
  }

  const token = generateInvitationToken();
  const expiresAt = new Date(
    Date.now() + INVITATION_EXPIRATION_HOURS * 60 * 60 * 1000,
  ).toISOString();

  const { error: invitationError } = await supabase.from("invitations").insert({
    organization_id: actor.organization_id,
    user_id: created.user.id,
    token_hash: hashInvitationToken(token),
    expires_at: expiresAt,
    created_by: actor.id,
  });

  if (invitationError) {
    await supabase.from("profiles").delete().eq("id", created.user.id);
    await admin.auth.admin.deleteUser(created.user.id);
    return NextResponse.json(
      { error: "No se pudo generar la invitación. Intentá de nuevo." },
      { status: 400 },
    );
  }

  const origin = new URL(request.url).origin;

  return NextResponse.json({
    ok: true,
    invitationUrl: buildInvitationUrl(origin, token),
    fullName: parsed.data.full_name,
  });
}
