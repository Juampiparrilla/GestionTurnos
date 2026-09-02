"use client";

import { PendingOverlay } from "@/components/pending-overlay";

// Next.js muestra esto automáticamente mientras carga cualquier pantalla bajo
// /caja (Dashboard, Movimientos, Nuevo movimiento, Etiquetas, Deudas) --
// todas leen la sesión y hacen consultas en el servidor en cada navegación,
// sin caché, así que siempre hay un viaje real al servidor. Sin este
// archivo, Next.js dejaba la pantalla anterior colgada hasta que llegaba la
// nueva, lo que se sentía como que no pasaba nada al tocar un botón.
export default function CargandoCaja() {
  return <PendingOverlay pending />;
}
