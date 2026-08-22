"use client";

import { createPortal } from "react-dom";
import { useLinkStatus } from "next/link";
import { Loader2 } from "lucide-react";

// Se usa como hijo de un <Link>: next/link expone el estado de
// navegación pendiente vía contexto, así que este indicador siempre
// refleja la transición real (a diferencia de loading.tsx, que puede
// no dispararse si Next.js ya precargó la ruta).
//
// No dibuja nada en el lugar del link: en cambio, monta un spinner
// centrado en toda la pantalla vía portal, en #nav-status-overlay
// (declarado una sola vez en el layout raíz, presente en el HTML
// desde el primer render, así que siempre existe cuando hace falta).
export function LinkPendingSpinner() {
  const { pending } = useLinkStatus();
  if (!pending || typeof document === "undefined") return null;

  const overlay = document.getElementById("nav-status-overlay");
  if (!overlay) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm">
      <div className="flex items-center justify-center rounded-full bg-background p-4 shadow-lg ring-1 ring-border">
        <Loader2 className="size-8 animate-spin text-foreground" />
      </div>
    </div>,
    overlay,
  );
}
