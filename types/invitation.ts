export type InvitationKind = "ACTIVATION" | "PASSWORD_RESET";

export type Invitation = {
  id: string;
  organization_id: string;
  user_id: string;
  token_hash: string;
  kind: InvitationKind;
  expires_at: string;
  used_at: string | null;
  revoked_at: string | null;
  created_by: string | null;
  created_at: string;
};

export type InvitationStatus = "NONE" | "PENDING" | "EXPIRED" | "REVOKED" | "USED";

export function getInvitationStatus(
  invitation: Pick<Invitation, "used_at" | "revoked_at" | "expires_at"> | null | undefined,
): InvitationStatus {
  if (!invitation) return "NONE";
  if (invitation.used_at) return "USED";
  if (invitation.revoked_at) return "REVOKED";
  if (new Date(invitation.expires_at) < new Date()) return "EXPIRED";
  return "PENDING";
}

export const INVITATION_STATUS_LABEL: Record<InvitationStatus, string> = {
  NONE: "Sin invitación",
  PENDING: "Invitación pendiente",
  EXPIRED: "Invitación expirada",
  REVOKED: "Invitación revocada",
  USED: "Cuenta activada",
};
