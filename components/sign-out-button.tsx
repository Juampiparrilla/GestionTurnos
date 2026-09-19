"use client";

import { LogOut } from "lucide-react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { PendingOverlay } from "@/components/pending-overlay";

export function SignOutButton({ variant = "icon" }: { variant?: "icon" | "row" }) {
  const { pending } = useFormStatus();

  return (
    <>
      <PendingOverlay pending={pending} />
      {variant === "row" ? (
        <button
          type="submit"
          disabled={pending}
          className="flex w-full items-center gap-3 p-4 text-left text-sm font-medium text-destructive disabled:opacity-50"
        >
          <LogOut className="size-5" aria-hidden="true" />
          Cerrar sesión
        </button>
      ) : (
      <Button
        type="submit"
        variant="ghost"
        size="icon-sm"
        disabled={pending}
        title="Salir"
        aria-label="Salir"
      >
        <LogOut className="size-5" aria-hidden="true" />
      </Button>
      )}
    </>
  );
}
