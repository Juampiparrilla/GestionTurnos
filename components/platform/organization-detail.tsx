"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { LinkPendingSpinner } from "@/components/link-pending-spinner";
import { InvitationCreatedDialog } from "@/components/users/invitation-created-dialog";
import { getInvitationStatus, INVITATION_STATUS_LABEL } from "@/types/invitation";
import type { PlatformOrganizationDetail } from "@/types/organization";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function OrganizationDetail({
  organization,
}: {
  organization: PlatformOrganizationDetail;
}) {
  const [active, setActive] = useState(organization.active);
  const [isTogglingActive, setIsTogglingActive] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resent, setResent] = useState<{ url: string } | null>(null);

  const invitationStatus = getInvitationStatus({
    used_at: organization.invitation_used_at,
    revoked_at: organization.invitation_revoked_at,
    expires_at: organization.invitation_expires_at ?? new Date(0).toISOString(),
  });
  const hasInvitation = organization.invitation_expires_at !== null;
  const canResend = hasInvitation && invitationStatus !== "USED";

  async function handleToggleActive(nextActive: boolean) {
    setIsTogglingActive(true);
    setError(null);
    setActive(nextActive);

    const res = await fetch(`/api/platform/organizations/${organization.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: nextActive }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "No se pudo actualizar el estado.");
      setActive(!nextActive);
    }

    setIsTogglingActive(false);
  }

  async function handleResend() {
    setIsResending(true);
    setError(null);

    const res = await fetch(`/api/platform/organizations/${organization.id}/resend-invitation`, {
      method: "POST",
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "No se pudo reenviar la invitación.");
      setIsResending(false);
      return;
    }

    setIsResending(false);
    setResent({ url: data.invitationUrl });
  }

  return (
    <div className="space-y-6">
      <Link
        href="/platform"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Volver a Organizaciones
        <LinkPendingSpinner />
      </Link>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">{organization.name}</h1>
          <p className="text-sm text-muted-foreground">/{organization.slug}</p>
          <p className="text-xs text-muted-foreground">
            Creada el {formatDate(organization.created_at)}
          </p>
        </div>
        <Badge variant={active ? "default" : "outline"}>{active ? "Activa" : "Inactiva"}</Badge>
      </div>

      <div className="flex items-center justify-between rounded-lg border bg-background p-3">
        <div>
          <p className="text-sm font-medium">Organización activa</p>
          <p className="text-xs text-muted-foreground">
            Una organización inactiva no puede ser usada por sus usuarios.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isTogglingActive && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
          <Switch checked={active} onCheckedChange={handleToggleActive} disabled={isTogglingActive} />
        </div>
      </div>

      <div className="space-y-3 rounded-lg border bg-background p-4">
        <p className="text-sm font-medium">Super Administrador</p>
        {organization.super_admin_id ? (
          <>
            <p className="text-sm">{organization.super_admin_name}</p>
            <p className="text-sm text-muted-foreground">{organization.super_admin_email}</p>
            {hasInvitation && (
              <div className="flex items-center justify-between gap-2 pt-2">
                <Badge variant="outline">
                  {invitationStatus === "PENDING" ? "⏳ " : ""}
                  {INVITATION_STATUS_LABEL[invitationStatus]}
                </Badge>
                {canResend && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleResend}
                    disabled={isResending}
                  >
                    {isResending && <Loader2 className="size-4 animate-spin" />}
                    Reenviar invitación
                  </Button>
                )}
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">No encontrado.</p>
        )}
      </div>

      <div className="rounded-lg border bg-background p-4">
        <p className="mb-2 text-sm font-medium">Usuarios</p>
        <div className="grid grid-cols-3 gap-2 text-center text-sm">
          <div>
            <p className="text-lg font-semibold">1</p>
            <p className="text-xs text-muted-foreground">Super Admin</p>
          </div>
          <div>
            <p className="text-lg font-semibold">{organization.admin_count}</p>
            <p className="text-xs text-muted-foreground">Administradores</p>
          </div>
          <div>
            <p className="text-lg font-semibold">{organization.employee_count}</p>
            <p className="text-xs text-muted-foreground">Empleados</p>
          </div>
        </div>
      </div>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <InvitationCreatedDialog
        open={resent !== null}
        onOpenChange={(isOpen) => {
          if (!isOpen) setResent(null);
        }}
        invitationUrl={resent?.url ?? null}
        fullName={organization.super_admin_name ?? ""}
      />
    </div>
  );
}
