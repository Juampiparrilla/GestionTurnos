"use client";

import { LogOut } from "lucide-react";
import { useFormStatus } from "react-dom";
import { PendingOverlay } from "@/components/pending-overlay";

export function SignOutButton() {
  const { pending } = useFormStatus();

  return (
    <>
      <PendingOverlay pending={pending} />
      <button
        type="submit"
        disabled={pending}
        className="flex w-full items-center gap-3 p-4 text-left text-sm font-medium text-destructive disabled:opacity-50"
      >
        <LogOut className="size-5" aria-hidden="true" />
        Cerrar sesión
      </button>
    </>
  );
}
