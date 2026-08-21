import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/require-role";
import { generateInvitationToken, hashInvitationToken } from "@/lib/invitations/token";
import { INVITATION_EXPIRATION_HOURS } from "@/lib/invitations/config";
import { buildInvitationUrl } from "@/lib/invitations/share";

export const runtime = "nodejs";

// Reenviar: revoca cualquier invitación activa y genera una nueva.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const actor = await requireAdmin();
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

  const { data: alreadyActivated } = await supabase
    .from("invitations")
    .select("id")
    .eq("user_id", userId)
    .not("used_at", "is", null)
    .limit(1)
    .maybeSingle();

  if (alreadyActivated) {
    return NextResponse.json({ error: "Este usuario ya activó su cuenta." }, { status: 400 });
  }

  await supabase
    .from("invitations")
    .update({ revoked_at: new Date().toISOString() })
    .eq("user_id", userId)
    .is("used_at", null)
    .is("revoked_at", null);

  const token = generateInvitationToken();
  const expiresAt = new Date(
    Date.now() + INVITATION_EXPIRATION_HOURS * 60 * 60 * 1000,
  ).toISOString();

  const { error: invitationError } = await supabase.from("invitations").insert({
    organization_id: actor.organization_id,
    user_id: userId,
    token_hash: hashInvitationToken(token),
    expires_at: expiresAt,
    created_by: actor.id,
  });

  if (invitationError) {
    return NextResponse.json(
      { error: "No se pudo generar la invitación. Intentá de nuevo." },
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

// Revocar: invalida la invitación activa sin generar una nueva.
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const actor = await requireAdmin();
  if (!actor) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const { id: userId } = await params;
  const supabase = await createClient();

  const { error } = await supabase
    .from("invitations")
    .update({ revoked_at: new Date().toISOString() })
    .eq("user_id", userId)
    .is("used_at", null)
    .is("revoked_at", null);

  if (error) {
    return NextResponse.json({ error: "No se pudo revocar la invitación." }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
