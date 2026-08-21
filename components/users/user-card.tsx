"use client";

import { Badge } from "@/components/ui/badge";
import { ROLE_LABEL, type Profile } from "@/types/profile";
import { getInvitationStatus, INVITATION_STATUS_LABEL, type Invitation } from "@/types/invitation";
import { formatDateTime } from "@/lib/format-date";

export function UserCard({
  user,
  invitation,
  onClick,
}: {
  user: Profile;
  invitation: Invitation | null;
  onClick: () => void;
}) {
  const invitationStatus = getInvitationStatus(invitation);
  const showInvitationBadge = invitationStatus !== "NONE" && invitationStatus !== "USED";

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-lg border bg-background p-4 text-left shadow-sm transition-colors hover:bg-muted/50"
    >
      <div className="min-w-0">
        <p className="truncate font-medium">{user.full_name}</p>
        <p className="truncate text-sm text-muted-foreground">
          @{user.username} · {user.email}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          Último ingreso: {user.last_login_at ? formatDateTime(user.last_login_at) : "nunca"}
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <Badge variant={user.role === "EMPLEADO" ? "secondary" : "default"}>
          {ROLE_LABEL[user.role]}
        </Badge>
        {!user.active && <Badge variant="outline">Inactivo</Badge>}
        {showInvitationBadge && (
          <Badge variant="outline">
            {invitationStatus === "PENDING" ? "⏳ " : ""}
            {INVITATION_STATUS_LABEL[invitationStatus]}
          </Badge>
        )}
      </div>
    </button>
  );
}
