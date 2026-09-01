"use client";

import { PendingOverlay } from "@/components/pending-overlay";

// Next.js muestra esto automáticamente mientras carga cualquier pantalla
// bajo /productos (esta misma, Marcas, Categorías, Proveedores, Actualizar
// costos, Reportes) -- todas leen la sesión en el servidor en cada
// navegación, sin caché, así que siempre hay un viaje real al servidor. Sin
// este archivo, Next.js dejaba la pantalla anterior colgada hasta que
// llegaba la nueva, lo que se sentía como un parpadeo/recarga rara.
export default function CargandoProductos() {
  return <PendingOverlay pending />;
}
