"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { NuevoMovimientoSheet } from "@/components/caja/nuevo/nuevo-movimiento-sheet";
import { MOVIMIENTO_CREADO_EVENT } from "@/lib/caja/eventos";
import type { CajaEtiqueta } from "@/types/caja";
import type { Board } from "@/types/board";
import type { ShiftConfiguration } from "@/types/shift";

// Botón flotante "Nuevo movimiento", solo en el celular y en todas las
// pantallas de Caja: cargar una venta es lo que más se hace desde el celular,
// así que queda a un toque sin importar en qué pestaña estés.
export function NuevoMovimientoFab({
  boards,
  etiquetas,
  shifts,
}: {
  boards: Board[];
  etiquetas: CajaEtiqueta[];
  shifts: ShiftConfiguration[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed right-4 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-30 inline-flex h-12 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-lg transition-colors hover:bg-primary/90 md:hidden"
      >
        <Plus className="size-5" aria-hidden="true" />
        Nuevo movimiento
      </button>
      <NuevoMovimientoSheet
        open={open}
        onOpenChange={setOpen}
        etiquetas={etiquetas}
        boards={boards}
        shifts={shifts}
        onCreated={() => {
          window.dispatchEvent(new Event(MOVIMIENTO_CREADO_EVENT));
          router.refresh();
        }}
        onEtiquetaCreated={() => router.refresh()}
      />
    </>
  );
}
