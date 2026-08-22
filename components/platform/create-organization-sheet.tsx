"use client";

import { useState, type ChangeEvent } from "react";
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
import { InvitationCreatedDialog } from "@/components/users/invitation-created-dialog";
import { sanitizeDni, sanitizeFullName, sanitizeUsername } from "@/lib/sanitize-input";

export function CreateOrganizationSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<{ url: string; fullName: string } | null>(null);

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    setError(null);

    const res = await fetch("/api/platform/organizations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orgName: formData.get("orgName"),
        fullName: formData.get("fullName"),
        username: formData.get("username"),
        dni: formData.get("dni"),
        email: formData.get("email"),
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "No se pudo crear la organización.");
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
    onOpenChange(false);
    setCreated({ url: data.invitationUrl, fullName: data.fullName });
  }

  return (
    <>
      <PendingOverlay pending={isSubmitting} />
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Crear organización</SheetTitle>
            <SheetDescription>
              Se crea la empresa y su primer Super Administrador, que va a recibir un enlace
              de invitación para activar su cuenta.
            </SheetDescription>
          </SheetHeader>
          <form action={handleSubmit} className="flex flex-col gap-4 px-4">
            <div className="space-y-2">
              <Label htmlFor="orgName">Nombre de la organización</Label>
              <Input id="orgName" name="orgName" maxLength={100} required />
            </div>

            <div className="border-t pt-4">
              <p className="mb-3 text-sm font-medium">Super Administrador inicial</p>
              <div className="flex flex-col gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nombre completo</Label>
                  <Input
                    id="fullName"
                    name="fullName"
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
              </div>
            </div>

            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            <SheetFooter className="px-0">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creando..." : "Crear organización"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      <InvitationCreatedDialog
        open={created !== null}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setCreated(null);
            router.refresh();
          }
        }}
        invitationUrl={created?.url ?? null}
        fullName={created?.fullName ?? ""}
      />
    </>
  );
}
