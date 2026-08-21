"use client";

import type { ReactNode } from "react";
import { useLinkStatus } from "next/link";
import { Loader2 } from "lucide-react";

// Se usa como hijo de un <Link>: next/link expone el estado de
// navegación pendiente vía contexto, así que este indicador siempre
// refleja la transición real (a diferencia de loading.tsx, que puede
// no dispararse si Next.js ya precargó la ruta).
export function LinkPendingSpinner() {
  const { pending } = useLinkStatus();
  if (!pending) return null;
  return <Loader2 className="size-3.5 shrink-0 animate-spin" />;
}

// Para links de solo ícono: reemplaza el ícono por el spinner en vez
// de mostrar los dos juntos (no entran ambos en un botón chico).
export function LinkIconOrSpinner({ children }: { children: ReactNode }) {
  const { pending } = useLinkStatus();
  if (pending) return <Loader2 className="size-4 animate-spin" />;
  return <>{children}</>;
}
