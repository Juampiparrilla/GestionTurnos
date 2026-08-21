"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { InvitationKind } from "@/types/invitation";
import { activateAccount, type ActivateAccountState } from "./actions";

const initialState: ActivateAccountState = { error: null };

export function InvitationForm({
  token,
  kind,
  fullName,
  email,
}: {
  token: string;
  kind: InvitationKind;
  fullName: string;
  email: string;
}) {
  const isReset = kind === "PASSWORD_RESET";
  const boundAction = activateAccount.bind(null, token);
  const [state, formAction, isPending] = useActionState(boundAction, initialState);

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{isReset ? "Restablecé tu contraseña" : "Activá tu cuenta"}</CardTitle>
          <CardDescription>
            {isReset
              ? `Hola, ${fullName} 👋. Elegí una contraseña nueva para tu cuenta.`
              : `Hola, ${fullName} 👋. Fuiste invitado a utilizar la aplicación de gestión de turnos.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">{email}</p>
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Nueva contraseña</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
              />
            </div>
            {state.error && (
              <p role="alert" className="text-sm text-destructive">
                {state.error}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending
                ? isReset
                  ? "Guardando..."
                  : "Activando..."
                : isReset
                  ? "Guardar contraseña"
                  : "Activar cuenta"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
