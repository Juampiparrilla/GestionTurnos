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
      <Button type="submit" variant="ghost" size="sm" disabled={pending}>
        <LogOut className="size-4" aria-hidden="true" />
        Salir
      </Button>
    </>
  );
}
