"use client";

import { useState } from "react";
import { Check, Copy, MessageCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { shareInvitationViaWhatsApp } from "@/lib/invitations/share";

export function InvitationCreatedDialog({
  open,
  onOpenChange,
  invitationUrl,
  fullName,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invitationUrl: string | null;
  fullName: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (!invitationUrl) return;
    try {
      await navigator.clipboard.writeText(invitationUrl);
    } catch {
      // Fallback para navegadores sin Clipboard API disponible.
      const textarea = document.createElement("textarea");
      textarea.value = invitationUrl;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!invitationUrl) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invitación creada correctamente</DialogTitle>
          <DialogDescription>
            Compartí este enlace con {fullName} para que active su cuenta. Es personal y
            vence en 48 horas.
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-lg border bg-muted/30 p-3 text-sm break-all">
          🔗 {invitationUrl}
        </div>
        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => shareInvitationViaWhatsApp(fullName, invitationUrl)}
          >
            <MessageCircle className="size-4" />
            Compartir por WhatsApp
          </Button>
          <Button type="button" variant="outline" className="w-full" onClick={handleCopy}>
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            {copied ? "Enlace copiado ✓" : "Copiar enlace"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
