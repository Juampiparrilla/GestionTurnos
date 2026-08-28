"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Presentacion } from "@/types/producto";
import { CreatePresentacionSheet } from "./create-presentacion-sheet";
import { EditPresentacionSheet } from "./edit-presentacion-sheet";

const currency = (value: number) => `$${value.toLocaleString("es-AR")}`;

export function PresentacionesManagement({
  productoId,
  presentaciones,
}: {
  productoId: string;
  presentaciones: Presentacion[];
}) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Presentacion | null>(null);

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
            <button
              key={presentacion.id}
              type="button"
              onClick={() => setEditing(presentacion)}
              className="flex items-start justify-between gap-3 rounded-lg border bg-background p-4 text-left shadow-sm transition-colors hover:bg-muted/50"
            >
              <div className="space-y-1">
                <p className="font-medium">
                  {presentacion.kg} kg {presentacion.sku ? `· SKU ${presentacion.sku}` : ""}
                </p>
                <p className="text-sm text-muted-foreground">Costo: {currency(presentacion.costo)}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span>
                    Bolsa cerrada: {currency(presentacion.precio_venta_cerrada)}
                    {presentacion.precio_manual_cerrada
                      ? " (manual)"
                      : ` (${presentacion.porcentaje_ganancia_cerrada}%)`}
                  </span>
                  <span>
                    Bolsa abierta: {currency(presentacion.precio_venta_abierta)}
                    {presentacion.precio_manual_abierta
                      ? " (manual)"
                      : ` (${presentacion.porcentaje_ganancia_abierta}%)`}
                  </span>
                  <span>Precio por kg: {currency(presentacion.precio_por_kg)}</span>
                </div>
              </div>
              {!presentacion.active && <Badge variant="outline">Inactiva</Badge>}
            </button>
          ))}
        </div>
      )}

      <CreatePresentacionSheet productoId={productoId} open={createOpen} onOpenChange={setCreateOpen} />
      {editing && (
        <EditPresentacionSheet
          presentacion={editing}
          open={editing !== null}
          onOpenChange={(open) => !open && setEditing(null)}
        />
      )}
    </div>
  );
}
