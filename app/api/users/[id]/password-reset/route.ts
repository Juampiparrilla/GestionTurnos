import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireSuperAdmin } from "@/lib/auth/require-role";
import { generateInvitationToken, hashInvitationToken } from "@/lib/invitations/token";
import { PASSWORD_RESET_EXPIRATION_HOURS } from "@/lib/invitations/config";
import { buildInvitationUrl } from "@/lib/invitations/share";

export const runtime = "nodejs";

// Genera un link de restablecimiento de contraseña de un solo uso para
// un usuario ya activo (mismo mecanismo que las invitaciones de
// activación, distinguido por kind = 'PASSWORD_RESET'). El admin lo
// comparte manualmente por WhatsApp; no depende de envío de email.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const actor = await requireSuperAdmin();
  if (!actor) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const { id: userId } = await params;
  const supabase = await createClient();

  const { data: targetProfile } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("id", userId)
    .maybeSingle();

  if (!targetProfile) {
    return NextResponse.json({ error: "Usuario no encontrado." }, { status: 404 });
  }

  await supabase
    .from("invitations")
    .update({ revoked_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("kind", "PASSWORD_RESET")
    .is("used_at", null)
    .is("revoked_at", null);

  const token = generateInvitationToken();
  const expiresAt = new Date(
    Date.now() + PASSWORD_RESET_EXPIRATION_HOURS * 60 * 60 * 1000,
  ).toISOString();

  const { error: invitationError } = await supabase.from("invitations").insert({
    organization_id: actor.organization_id,
    user_id: userId,
    kind: "PASSWORD_RESET",
    token_hash: hashInvitationToken(token),
    expires_at: expiresAt,
    created_by: actor.id,
  });

  if (invitationError) {
    return NextResponse.json(
      { error: "No se pudo generar el enlace. Intentá de nuevo." },
      { status: 400 },
    );
  }

  const origin = new URL(request.url).origin;

  return NextResponse.json({
    ok: true,
    invitationUrl: buildInvitationUrl(origin, token),
    fullName: targetProfile.full_name,
  });
}
