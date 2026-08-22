import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requirePlatformAdmin } from "@/lib/auth/require-role";
import { generateInvitationToken, hashInvitationToken } from "@/lib/invitations/token";
import { INVITATION_EXPIRATION_HOURS } from "@/lib/invitations/config";
import { buildInvitationUrl } from "@/lib/invitations/share";

export const runtime = "nodejs";

function friendlyError(message: string): string {
  if (message.includes("ya activó su cuenta")) {
    return "Este Super Administrador ya activó su cuenta.";
  }
  if (message.includes("No se encontró el Super Administrador")) {
    return "No se encontró el Super Administrador de esta organización.";
  }
  return "No se pudo reenviar la invitación. Intentá de nuevo.";
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const actor = await requirePlatformAdmin();
  if (!actor) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const { id } = await params;

  const token = generateInvitationToken();
  const expiresAt = new Date(
    Date.now() + INVITATION_EXPIRATION_HOURS * 60 * 60 * 1000,
  ).toISOString();

  const supabase = await createClient();
  const { error } = await supabase.rpc("resend_super_admin_invitation", {
    p_organization_id: id,
    p_invitation_token_hash: hashInvitationToken(token),
    p_invitation_expires_at: expiresAt,
  });

  if (error) {
    return NextResponse.json({ error: friendlyError(error.message) }, { status: 400 });
  }

  const origin = new URL(request.url).origin;

  return NextResponse.json({
    ok: true,
    invitationUrl: buildInvitationUrl(origin, token),
  });
}
