"use client";

import { LogOut } from "lucide-react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { PendingOverlay } from "@/components/pending-overlay";

export function SignOutButton() {
  const { pending } = useFormStatus();

  return (
    <>
      <PendingOverlay pending={pending} />
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
    </>
  );
}
