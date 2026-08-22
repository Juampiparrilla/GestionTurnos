"use client";

import { useLinkStatus } from "next/link";
import { PendingOverlay } from "./pending-overlay";

// Se usa como hijo de un <Link>: next/link expone el estado de
// navegación pendiente vía contexto, así que este indicador siempre
// refleja la transición real (a diferencia de loading.tsx, que puede
// no dispararse si Next.js ya precargó la ruta).
export function LinkPendingSpinner() {
  const { pending } = useLinkStatus();
  return <PendingOverlay pending={pending} />;
}
