"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PendingOverlay } from "@/components/pending-overlay";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ROLE_LABEL, type Profile, type UserRole } from "@/types/profile";
import { sanitizeDni, sanitizeFullName, sanitizeUsername } from "@/lib/sanitize-input";
import { InvitationCreatedDialog } from "./invitation-created-dialog";
import {
  getInvitationStatus,
  INVITATION_STATUS_LABEL,
  type Invitation,
} from "@/types/invitation";
import type { ChangeEvent } from "react";

export function EditUserSheet({
  user,
  onOpenChange,
  assignableRoles,
  isSelf,
  assignedBoards,
  invitation,
}: {
  user: Profile;
  onOpenChange: (open: boolean) => void;
  assignableRoles: UserRole[];
  isSelf: boolean;
  assignedBoards: string[];
  invitation: Invitation | null;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState(user.active);

  const [invitationStatus, setInvitationStatus] = useState(getInvitationStatus(invitation));
  const [isResending, setIsResending] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);
  const [revokeConfirmOpen, setRevokeConfirmOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [newInvitation, setNewInvitation] = useState<{ url: string; fullName: string } | null>(
    null,
  );
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [newPasswordReset, setNewPasswordReset] = useState<{
    url: string;
    fullName: string;
  } | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    setError(null);

    const payload = {
      full_name: formData.get("full_name"),
      username: formData.get("username"),
      dni: formData.get("dni"),
      ...(isSelf ? {} : { role: formData.get("role"), active }),
    };

    const res = await fetch(`/api/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "No se pudo guardar el cambio.");
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
    onOpenChange(false);
    router.refresh();
  }

  async function handleResend() {
    setIsResending(true);
    setActionError(null);

    const res = await fetch(`/api/users/${user.id}/invitations`, { method: "POST" });
    const data = await res.json();

    if (!res.ok) {
      setActionError(data.error ?? "No se pudo reenviar la invitación.");
      setIsResending(false);
      return;
    }

    setIsResending(false);
    setInvitationStatus("PENDING");
    setNewInvitation({ url: data.invitationUrl, fullName: data.fullName });
  }

  async function handleRevoke() {
    setIsRevoking(true);
    setActionError(null);

    const res = await fetch(`/api/users/${user.id}/invitations`, { method: "DELETE" });

    if (!res.ok) {
      const data = await res.json();
      setActionError(data.error ?? "No se pudo revocar la invitación.");
      setIsRevoking(false);
      setRevokeConfirmOpen(false);
      return;
    }

    setIsRevoking(false);
    setRevokeConfirmOpen(false);
    setInvitationStatus("REVOKED");
    router.refresh();
  }

  async function handleDelete() {
    setIsDeleting(true);
    setActionError(null);

    const res = await fetch(`/api/users/${user.id}`, { method: "DELETE" });

    if (!res.ok) {
      const data = await res.json();
      setActionError(data.error ?? "No se pudo borrar el usuario.");
      setIsDeleting(false);
      setDeleteConfirmOpen(false);
      return;
    }

    setIsDeleting(false);
    setDeleteConfirmOpen(false);
    onOpenChange(false);
    router.refresh();
  }

  async function handlePasswordReset() {
    setIsResettingPassword(true);
    setActionError(null);

    const res = await fetch(`/api/users/${user.id}/password-reset`, { method: "POST" });
    const data = await res.json();

    if (!res.ok) {
      setActionError(data.error ?? "No se pudo generar el enlace de restablecimiento.");
      setIsResettingPassword(false);
      return;
    }

    setIsResettingPassword(false);
    setNewPasswordReset({ url: data.invitationUrl, fullName: data.fullName });
  }

  const canResend =
    !isSelf && (invitationStatus === "PENDING" || invitationStatus === "EXPIRED" || invitationStatus === "REVOKED");
  const canRevoke = !isSelf && invitationStatus === "PENDING";
  // "NONE" incluye cuentas sin fila de invitación (el SUPER_ADMIN del
  // bootstrap, o cualquier perfil creado a mano): ya tienen contraseña,
  // así que también se les puede restablecer.
  const canResetPassword =
    !isSelf && (invitationStatus === "USED" || invitationStatus === "NONE");

  return (
    <>
      <PendingOverlay
        pending={isSubmitting || isResending || isRevoking || isResettingPassword || isDeleting}
      />
      <Sheet open onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Editar usuario</SheetTitle>
            <SheetDescription>{user.email}</SheetDescription>
          </SheetHeader>

          {invitationStatus !== "NONE" && (
            <div className="mx-4 flex items-center justify-between gap-2 rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Estado de la cuenta</p>
                <Badge variant="outline" className="mt-1">
                  {invitationStatus === "PENDING" ? "⏳ " : ""}
                  {INVITATION_STATUS_LABEL[invitationStatus]}
                </Badge>
              </div>
              <div className="flex gap-2">
                {canRevoke && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setRevokeConfirmOpen(true)}
                    disabled={isRevoking}
                  >
                    Revocar
                  </Button>
                )}
                {canResend && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleResend}
                    disabled={isResending}
                  >
                    Reenviar invitación
                  </Button>
                )}
              </div>
            </div>
          )}
          {canResetPassword && (
            <div className="mx-4 flex items-center justify-between gap-2 rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Contraseña</p>
                <p className="text-xs text-muted-foreground">
                  Generá un enlace para que {user.full_name} elija una contraseña nueva.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handlePasswordReset}
                disabled={isResettingPassword}
              >
                Restablecer
              </Button>
            </div>
          )}

          {!isSelf && !user.active && (
            <div className="mx-4 flex items-center justify-between gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
              <div>
                <p className="text-sm font-medium">Borrar usuario</p>
                <p className="text-xs text-muted-foreground">
                  Elimina a {user.full_name} para siempre. No se puede deshacer.
                </p>
              </div>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => setDeleteConfirmOpen(true)}
                disabled={isDeleting}
              >
                Borrar
              </Button>
            </div>
          )}

          {actionError && (
            <p role="alert" className="mx-4 text-sm text-destructive">
              {actionError}
            </p>
          )}

          <form action={handleSubmit} className="flex flex-col gap-4 px-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Nombre completo</Label>
              <Input
                id="full_name"
                name="full_name"
                defaultValue={user.full_name}
                maxLength={80}
                title="Solo letras, espacios, apóstrofes y guiones"
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  e.target.value = sanitizeFullName(e.target.value);
                }}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Usuario</Label>
              <Input
                id="username"
                name="username"
                defaultValue={user.username}
                maxLength={30}
                title="Solo letras, números, puntos, guiones y guiones bajos"
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  e.target.value = sanitizeUsername(e.target.value);
                }}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dni">DNI</Label>
              <Input
                id="dni"
                name="dni"
                defaultValue={user.dni}
                inputMode="numeric"
                maxLength={8}
                title="8 números, sin puntos ni espacios"
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  e.target.value = sanitizeDni(e.target.value);
                }}
                required
              />
            </div>

            {isSelf ? (
              <p className="text-sm text-muted-foreground">
                No podés cambiar tu propio rol ni desactivarte.
              </p>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="role">Rol</Label>
                  <Select name="role" defaultValue={user.role}>
                    <SelectTrigger id="role">
                      <SelectValue>{(value: UserRole) => ROLE_LABEL[value]}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {assignableRoles.map((role) => (
                        <SelectItem key={role} value={role}>
                          {ROLE_LABEL[role]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <Label htmlFor="active">Usuario activo</Label>
                    <p className="text-xs text-muted-foreground">
                      Un usuario inactivo no puede iniciar sesión.
                    </p>
                  </div>
                  <Switch id="active" checked={active} onCheckedChange={setActive} />
                </div>

                {!active && assignedBoards.length > 0 && (
                  <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-800 dark:text-amber-400">
                    Este usuario está asignado en: <strong>{assignedBoards.join(", ")}</strong>.
                    Si lo desactivás, esas asignaciones van a desaparecer del calendario.
                  </p>
                )}
              </>
            )}

            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            <SheetFooter className="px-0">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Guardando..." : "Guardar cambios"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      <AlertDialog open={revokeConfirmOpen} onOpenChange={setRevokeConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Revocar la invitación?</AlertDialogTitle>
            <AlertDialogDescription>
              El enlace que ya compartiste con {user.full_name} va a dejar de funcionar. Vas a
              poder generar uno nuevo cuando quieras.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleRevoke}>Revocar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Borrar a {user.full_name} para siempre?</AlertDialogTitle>
            <AlertDialogDescription>
              Esto borra su cuenta por completo, no se puede deshacer. Si más adelante vuelve a
              trabajar con vos, vas a tener que crearlo de nuevo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleDelete}>
              Borrar para siempre
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <InvitationCreatedDialog
        open={newInvitation !== null}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setNewInvitation(null);
            router.refresh();
          }
        }}
        invitationUrl={newInvitation?.url ?? null}
        fullName={newInvitation?.fullName ?? ""}
      />

      <InvitationCreatedDialog
        open={newPasswordReset !== null}
        onOpenChange={(isOpen) => {
          if (!isOpen) setNewPasswordReset(null);
        }}
        invitationUrl={newPasswordReset?.url ?? null}
        fullName={newPasswordReset?.fullName ?? ""}
        kind="PASSWORD_RESET"
      />
    </>
  );
}
