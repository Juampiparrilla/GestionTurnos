"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, RotateCcw, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Proveedor } from "@/types/proveedor";
import { EditProveedorSheet } from "./edit-proveedor-sheet";
import { AjustarPorcentajeSheet } from "./ajustar-porcentaje-sheet";

export function ProveedorRow({ proveedor }: { proveedor: Proveedor }) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [ajustarOpen, setAjustarOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function toggleActive() {
    if (proveedor.active && !confirm(`¿Eliminar el proveedor "${proveedor.nombre}"?`)) {
      return;
    }
    startTransition(async () => {
      await fetch(`/api/proveedores/${proveedor.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !proveedor.active }),
      });
      router.refresh();
    });
  }

  return (
    <>
      <div className="flex items-center justify-between gap-3 rounded-lg border bg-background p-4 shadow-sm">
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{proveedor.nombre}</p>
          <p className="truncate text-sm text-muted-foreground">
            {[proveedor.contacto, proveedor.telefono, proveedor.email].filter(Boolean).join(" · ") ||
              "Sin datos de contacto"}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {!proveedor.active && <Badge variant="outline">Inactivo</Badge>}
          <Button variant="outline" size="sm" onClick={() => setAjustarOpen(true)}>
            Ajustar %
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={() => setEditOpen(true)} aria-label="Editar">
            <Pencil className="size-4" aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={toggleActive}
            disabled={isPending}
            aria-label={proveedor.active ? "Eliminar" : "Reactivar"}
          >
            {proveedor.active ? (
              <Trash2 className="size-4" aria-hidden="true" />
            ) : (
              <RotateCcw className="size-4" aria-hidden="true" />
            )}
          </Button>
        </div>
      </div>
      <EditProveedorSheet proveedor={proveedor} open={editOpen} onOpenChange={setEditOpen} />
      <AjustarPorcentajeSheet proveedor={proveedor} open={ajustarOpen} onOpenChange={setAjustarOpen} />
    </>
  );
}
