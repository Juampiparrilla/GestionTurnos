"use client";

import { createPortal } from "react-dom";
import { Loader2 } from "lucide-react";

// Spinner centrado en toda la pantalla, con fondo difuminado, vía
// portal a #nav-status-overlay (declarado una sola vez en el layout
// raíz). Es el indicador de "carga" único de toda la app: se usa
// tanto para navegación (LinkPendingSpinner) como para cualquier
// acción que espera una respuesta del servidor (guardar, crear,
// eliminar, etc.), en vez de un ícono distinto en cada botón.
export function PendingOverlay({ pending }: { pending: boolean }) {
  if (!pending || typeof document === "undefined") return null;

  const overlay = document.getElementById("nav-status-overlay");
  if (!overlay) return null;

  return createPortal(
    // z-100 (no z-50): tiene que quedar arriba de cualquier Sheet/Dialog
    // abierto -- con el mismo z-index, el portal del sheet se monta
    // después en el DOM y lo tapa. El Toaster usa el mismo z-100 por la
    // misma razón.
    // Sin backdrop-blur: dos capas de blur animándose a la vez (esta +
    // la del Sheet que se cierra abajo) es una causa conocida de choque
    // del proceso de GPU en Chrome/Android en equipos con poca memoria,
    // sobre todo con formularios pesados como "Nuevo movimiento".
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-background/70">
      <div className="flex items-center justify-center rounded-full bg-background p-4 shadow-lg ring-1 ring-border">
        <Loader2 className="size-8 animate-spin text-foreground" />
      </div>
    </div>,
    overlay,
  );
}
