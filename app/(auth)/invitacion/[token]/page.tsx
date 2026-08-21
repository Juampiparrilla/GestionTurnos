import { createAdminClient } from "@/lib/supabase/admin";
import { hashInvitationToken } from "@/lib/invitations/token";
import type { InvitationKind } from "@/types/invitation";
import { InvitationStatusScreen } from "./invitation-status";
import { InvitationForm } from "./invitation-form";

type InvitationLookup = {
  kind: InvitationKind;
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
    .select("kind, used_at, revoked_at, expires_at, profile:user_id(full_name, email)")
    .eq("token_hash", tokenHash)
    .maybeSingle<InvitationLookup>();

  if (!invitation) {
    return (
      <InvitationStatusScreen
        title="Enlace no válido"
        message="Este enlace no es correcto o ya no existe."
      />
    );
  }

  const isReset = invitation.kind === "PASSWORD_RESET";

  if (invitation.used_at) {
    return (
      <InvitationStatusScreen
        title={isReset ? "Enlace utilizado" : "Invitación utilizada"}
        message={
          isReset
            ? "Este enlace de restablecimiento ya fue utilizado. Ingresá con tu contraseña actual."
            : "Esta invitación ya fue utilizada. Si ya tenés una cuenta, ingresá normalmente."
        }
        showLogin
      />
    );
  }

  if (invitation.revoked_at) {
    return (
      <InvitationStatusScreen
        title={isReset ? "Enlace no válido" : "Invitación no válida"}
        message={
          isReset
            ? "Este enlace de restablecimiento fue revocado. Solicitá uno nuevo al administrador."
            : "Esta invitación fue revocada. Solicitá una nueva al administrador."
        }
      />
    );
  }

  if (new Date(invitation.expires_at) < new Date()) {
    return (
      <InvitationStatusScreen
        title={isReset ? "Enlace expirado ⏰" : "Invitación expirada ⏰"}
        message={
          isReset
            ? "Este enlace dejó de ser válido. Solicitá uno nuevo al administrador."
            : "Este enlace dejó de ser válido. Solicitá una nueva invitación al administrador."
        }
      />
    );
  }

  const person = Array.isArray(invitation.profile) ? invitation.profile[0] : invitation.profile;

  return (
    <InvitationForm
      token={token}
      kind={invitation.kind}
      fullName={person?.full_name ?? ""}
      email={person?.email ?? ""}
    />
  );
}
