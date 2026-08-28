"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PendingOverlay } from "@/components/pending-overlay";
import { signIn, type LoginState } from "./actions";

const initialState: LoginState = { error: null };

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(signIn, initialState);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-6 py-12">
      <PendingOverlay pending={isPending} />
      <div className="flex w-full max-w-sm flex-col items-center gap-8 rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm shadow-zinc-200/60">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-900">
            <Store className="h-6 w-6 text-white" aria-hidden="true" />
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold text-zinc-900">Mi negocio</h1>
            <p className="text-zinc-600">Iniciá sesión para continuar.</p>
          </div>
        </div>

        <form action={formAction} className="flex w-full flex-col gap-4">
          <div className="flex flex-col gap-1">
            <Label htmlFor="email" className="text-sm font-medium text-zinc-700">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="h-12 rounded-lg border-zinc-300 px-4 text-base text-zinc-900 focus-visible:border-zinc-500 focus-visible:ring-zinc-500/20"
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="password" className="text-sm font-medium text-zinc-700">
              Contraseña
            </Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                className="h-12 rounded-lg border-zinc-300 px-4 pr-11 text-base text-zinc-900 focus-visible:border-zinc-500 focus-visible:ring-zinc-500/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-zinc-500 hover:text-zinc-700"
              >
                {showPassword ? (
                  <EyeOff className="size-5" aria-hidden="true" />
                ) : (
                  <Eye className="size-5" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          {state.error && (
            <p role="alert" className="text-sm text-destructive">
              {state.error}
            </p>
          )}

          <Button
            type="submit"
            disabled={isPending}
            className="h-12 w-full rounded-lg bg-zinc-900 text-base font-semibold hover:bg-zinc-800"
          >
            {isPending ? "Ingresando..." : "Ingresar"}
          </Button>
        </form>
      </div>
    </main>
  );
}
