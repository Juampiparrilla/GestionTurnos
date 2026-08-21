import { createAdminClient } from "@/lib/supabase/admin";
import { hashInvitationToken } from "@/lib/invitations/token";
import { InvitationStatusScreen } from "./invitation-status";
import { InvitationForm } from "./invitation-form";

type InvitationLookup = {
  used_at: string | null;
  revoked_at: string | null;
  expires_at: string;
  profile: { full_name: string; email: string }[] | { full_name: string; email: string } | null;
};

export default async function InvitationPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const tokenHash = hashInvitationToken(token);

  const admin = createAdminClient();
  const { data: invitation } = await admin
    .from("invitations")
    .select("used_at, revoked_at, expires_at, profile:user_id(full_name, email)")
    .eq("token_hash", tokenHash)
    .maybeSingle<InvitationLookup>();

  if (!invitation) {
    return (
      <InvitationStatusScreen
        title="Invitación no válida"
        message="Este enlace no es correcto o ya no existe."
      />
    );
  }

  if (invitation.used_at) {
    return (
      <InvitationStatusScreen
        title="Invitación utilizada"
        message="Esta invitación ya fue utilizada. Si ya tenés una cuenta, ingresá normalmente."
        showLogin
      />
    );
  }

  if (invitation.revoked_at) {
    return (
      <InvitationStatusScreen
        title="Invitación no válida"
        message="Esta invitación fue revocada. Solicitá una nueva al administrador."
      />
    );
  }

  if (new Date(invitation.expires_at) < new Date()) {
    return (
      <InvitationStatusScreen
        title="Invitación expirada ⏰"
        message="Este enlace dejó de ser válido. Solicitá una nueva invitación al administrador."
      />
    );
  }

  const person = Array.isArray(invitation.profile) ? invitation.profile[0] : invitation.profile;

  return (
    <InvitationForm token={token} fullName={person?.full_name ?? ""} email={person?.email ?? ""} />
  );
}
