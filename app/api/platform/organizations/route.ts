import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requirePlatformAdmin } from "@/lib/auth/require-role";
import { createOrganizationSchema } from "@/lib/validations/organization";
import { generateInvitationToken, hashInvitationToken } from "@/lib/invitations/token";
import { INVITATION_EXPIRATION_HOURS } from "@/lib/invitations/config";
import { buildInvitationUrl } from "@/lib/invitations/share";
import { slugify } from "@/lib/slugify";

export const runtime = "nodejs";

function friendlyOrgError(message: string): string {
  if (message.includes("No autorizado")) {
    return "No autorizado.";
  }
  return "No se pudo crear la organización. Intentá de nuevo.";
}

export async function POST(request: Request) {
  const actor = await requirePlatformAdmin();
  if (!actor) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createOrganizationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos." },
      { status: 400 },
    );
  }

  const admin = createAdminClient();

  // El usuario de Auth se crea sin contraseña, igual que cualquier
  // invitación de la app: no puede loguearse hasta aceptar el link.
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

  const token = generateInvitationToken();
  const expiresAt = new Date(
    Date.now() + INVITATION_EXPIRATION_HOURS * 60 * 60 * 1000,
  ).toISOString();

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_organization_with_super_admin", {
    p_org_name: parsed.data.orgName,
    p_base_slug: slugify(parsed.data.orgName) || "organizacion",
    p_super_admin_id: created.user.id,
    p_full_name: parsed.data.fullName,
    p_username: parsed.data.username,
    p_dni: parsed.data.dni,
    p_email: parsed.data.email,
    p_invitation_token_hash: hashInvitationToken(token),
    p_invitation_expires_at: expiresAt,
  });

  if (error) {
    // Compensación: si la parte de base de datos falla, el usuario de
    // Auth recién creado queda huérfano — se borra para no dejar
    // basura (mismo patrón que POST /api/users).
    await admin.auth.admin.deleteUser(created.user.id);
    return NextResponse.json({ error: friendlyOrgError(error.message) }, { status: 400 });
  }

  const organizationId = data?.[0]?.organization_id;
  const origin = new URL(request.url).origin;

  return NextResponse.json({
    ok: true,
    organizationId,
    invitationUrl: buildInvitationUrl(origin, token),
    fullName: parsed.data.fullName,
  });
}
