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
import { setPassword, type SetPasswordState } from "./actions";

const initialState: SetPasswordState = { error: null };

export default function SetPasswordPage() {
  const [state, formAction, isPending] = useActionState(setPassword, initialState);

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Creá tu contraseña</CardTitle>
          <CardDescription>
            Elegí una contraseña para poder ingresar a Gestión de Turnos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
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
              <Label htmlFor="confirmPassword">Repetir contraseña</Label>
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
              {isPending ? "Guardando..." : "Guardar y continuar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
