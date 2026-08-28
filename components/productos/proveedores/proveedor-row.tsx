"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Proveedor } from "@/types/proveedor";
import { EditProveedorSheet } from "./edit-proveedor-sheet";
import { AjustarPorcentajeSheet } from "./ajustar-porcentaje-sheet";

export function ProveedorRow({ proveedor }: { proveedor: Proveedor }) {
  const [editOpen, setEditOpen] = useState(false);
  const [ajustarOpen, setAjustarOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between gap-3 rounded-lg border bg-background p-4 shadow-sm">
        <button
          type="button"
          onClick={() => setEditOpen(true)}
          className="min-w-0 flex-1 text-left"
        >
          <p className="truncate font-medium">{proveedor.nombre}</p>
          <p className="truncate text-sm text-muted-foreground">
            {[proveedor.contacto, proveedor.telefono, proveedor.email].filter(Boolean).join(" · ") ||
              "Sin datos de contacto"}
          </p>
        </button>
        <div className="flex shrink-0 items-center gap-2">
          {!proveedor.active && <Badge variant="outline">Inactivo</Badge>}
          <Button variant="outline" size="sm" onClick={() => setAjustarOpen(true)}>
            Ajustar %
          </Button>
        </div>
      </div>
      <EditProveedorSheet proveedor={proveedor} open={editOpen} onOpenChange={setEditOpen} />
      <AjustarPorcentajeSheet proveedor={proveedor} open={ajustarOpen} onOpenChange={setAjustarOpen} />
    </>
  );
}
