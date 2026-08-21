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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROLE_LABEL, type UserRole } from "@/types/profile";
import { sanitizeDni, sanitizeFullName, sanitizeUsername } from "@/lib/sanitize-input";
import type { ChangeEvent } from "react";

export function CreateUserSheet({
  open,
  onOpenChange,
  assignableRoles,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignableRoles: UserRole[];
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    setError(null);

    const payload = {
      username: formData.get("username"),
      full_name: formData.get("full_name"),
      dni: formData.get("dni"),
      email: formData.get("email"),
      role: formData.get("role"),
    };

    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "No se pudo crear el usuario.");
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
    onOpenChange(false);
    router.refresh();
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Crear usuario</SheetTitle>
          <SheetDescription>
            Se le va a enviar un email de invitación para que elija su propia contraseña.
          </SheetDescription>
        </SheetHeader>
        <form action={handleSubmit} className="flex flex-col gap-4 px-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Nombre completo</Label>
            <Input
              id="full_name"
              name="full_name"
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
              inputMode="numeric"
              maxLength={8}
              title="8 números, sin puntos ni espacios"
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                e.target.value = sanitizeDni(e.target.value);
              }}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" maxLength={150} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Rol</Label>
            <Select name="role" defaultValue="EMPLEADO">
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
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <SheetFooter className="px-0">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              {isSubmitting ? "Creando..." : "Crear usuario"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
