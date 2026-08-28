"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Presentacion } from "@/types/producto";
import { CreatePresentacionSheet } from "./create-presentacion-sheet";
import { PresentacionRow } from "./presentacion-row";

export function PresentacionesManagement({
  productoId,
  presentaciones,
}: {
  productoId: string;
  presentaciones: Presentacion[];
}) {
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Presentaciones</h2>
        <Button variant="outline" onClick={() => setCreateOpen(true)}>
          + Agregar presentación
        </Button>
      </div>

      {presentaciones.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          Este producto todavía no tiene presentaciones cargadas.
        </div>
      ) : (
        <div className="grid gap-3">
          {presentaciones.map((presentacion) => (
            <PresentacionRow key={presentacion.id} presentacion={presentacion} />
          ))}
        </div>
      )}

      <CreatePresentacionSheet productoId={productoId} open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
