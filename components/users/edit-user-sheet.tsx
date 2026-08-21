"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROLE_LABEL, type Profile, type UserRole } from "@/types/profile";
import { sanitizeDni, sanitizeFullName, sanitizeUsername } from "@/lib/sanitize-input";
import type { ChangeEvent } from "react";

export function EditUserSheet({
  user,
  onOpenChange,
  assignableRoles,
  isSelf,
}: {
  user: Profile;
  onOpenChange: (open: boolean) => void;
  assignableRoles: UserRole[];
  isSelf: boolean;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState(user.active);

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

  return (
    <Sheet open onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Editar usuario</SheetTitle>
          <SheetDescription>{user.email}</SheetDescription>
        </SheetHeader>
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
            </>
          )}

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <SheetFooter className="px-0">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              {isSubmitting ? "Guardando..." : "Guardar cambios"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
