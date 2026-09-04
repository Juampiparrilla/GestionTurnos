"use client";

import { PendingOverlay } from "@/components/pending-overlay";

// Next.js muestra esto automáticamente mientras carga cualquier pantalla que
// no tenga su propio loading.tsx más específico (Home, Horarios, Usuarios,
// Plataforma -- Productos y Caja ya tienen el suyo). Sin esto, Next.js
// dejaba la pantalla anterior colgada hasta que llegaba la nueva, lo que se
// sentía como que no pasaba nada al tocar un botón.
export default function CargandoApp() {
  return <PendingOverlay pending />;
}
