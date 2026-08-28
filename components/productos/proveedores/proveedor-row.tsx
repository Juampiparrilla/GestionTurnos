"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Ban, Pencil, RotateCcw, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PendingOverlay } from "@/components/pending-overlay";
import type { Proveedor } from "@/types/proveedor";
import { EditProveedorSheet } from "./edit-proveedor-sheet";
import { AjustarPorcentajeSheet } from "./ajustar-porcentaje-sheet";

export function ProveedorRow({ proveedor, numero }: { proveedor: Proveedor; numero: number }) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [ajustarOpen, setAjustarOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function toggleActive() {
    const pregunta = proveedor.active
      ? `¿Desactivar el proveedor "${proveedor.nombre}"? Podés reactivarlo después.`
      : `¿Reactivar el proveedor "${proveedor.nombre}"?`;
    if (!confirm(pregunta)) return;

    startTransition(async () => {
      await fetch(`/api/proveedores/${proveedor.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !proveedor.active }),
      });
      router.refresh();
    });
  }

  function deleteForever() {
    if (!confirm(`Esto borra "${proveedor.nombre}" para siempre y no se puede deshacer. ¿Continuar?`)) return;

    startTransition(async () => {
      const res = await fetch(`/api/proveedores/${proveedor.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        alert(data?.error ?? "No se pudo borrar el proveedor.");
        return;
      }
      router.refresh();
    });
  }

  return (
    <>
      <PendingOverlay pending={isPending} />
      <div className="flex min-w-0 items-center justify-between gap-3 rounded-lg border bg-background p-4 shadow-sm">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span className="w-6 shrink-0 text-sm text-muted-foreground">{numero}.</span>
          <div className="min-w-0">
            <p className="truncate font-medium">{proveedor.nombre}</p>
            <p className="truncate text-sm text-muted-foreground">
              {[proveedor.contacto, proveedor.telefono, proveedor.email].filter(Boolean).join(" · ") ||
                "Sin datos de contacto"}
            </p>
          </div>
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
            aria-label={proveedor.active ? "Desactivar" : "Reactivar"}
          >
            {proveedor.active ? (
              <Ban className="size-4" aria-hidden="true" />
            ) : (
              <RotateCcw className="size-4" aria-hidden="true" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={deleteForever}
            disabled={isPending}
            aria-label="Borrar definitivamente"
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
      <EditProveedorSheet proveedor={proveedor} open={editOpen} onOpenChange={setEditOpen} />
      <AjustarPorcentajeSheet proveedor={proveedor} open={ajustarOpen} onOpenChange={setAjustarOpen} />
    </>
  );
}
