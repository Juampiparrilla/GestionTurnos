"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Ban, Pencil, RotateCcw, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Presentacion } from "@/types/producto";
import { EditPresentacionSheet } from "./edit-presentacion-sheet";

const currency = (value: number) => `$${value.toLocaleString("es-AR")}`;

export function PresentacionRow({ presentacion }: { presentacion: Presentacion }) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function toggleActive() {
    const pregunta = presentacion.active
      ? `¿Desactivar la presentación de ${presentacion.kg} kg? Podés reactivarla después.`
      : `¿Reactivar la presentación de ${presentacion.kg} kg?`;
    if (!confirm(pregunta)) return;

    startTransition(async () => {
      await fetch(`/api/presentaciones/${presentacion.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kg: presentacion.kg,
          costo: presentacion.costo,
          porcentajeCerrada: presentacion.porcentaje_ganancia_cerrada,
          manualCerrada: presentacion.precio_manual_cerrada,
          precioManualCerrada: presentacion.precio_venta_cerrada,
          porcentajeAbierta: presentacion.porcentaje_ganancia_abierta,
          manualAbierta: presentacion.precio_manual_abierta,
          precioManualAbierta: presentacion.precio_venta_abierta,
          porcentajePorMayor: presentacion.porcentaje_ganancia_por_mayor,
          manualPorMayor: presentacion.precio_manual_por_mayor,
          precioManualPorMayor: presentacion.precio_venta_por_mayor,
          active: !presentacion.active,
        }),
      });
      router.refresh();
    });
  }

  function deleteForever() {
    if (!confirm(`Esto borra la presentación de ${presentacion.kg} kg para siempre. ¿Continuar?`)) return;

    startTransition(async () => {
      const res = await fetch(`/api/presentaciones/${presentacion.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        alert(data?.error ?? "No se pudo borrar la presentación.");
        return;
      }
      router.refresh();
    });
  }

  return (
    <>
      <div className="flex items-start justify-between gap-3 rounded-lg border bg-background p-4 shadow-sm">
        <div className="space-y-1">
          <p className="font-medium">{presentacion.kg} kg</p>
          <p className="text-sm text-muted-foreground">Costo: {currency(presentacion.costo)}</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span>
              Bolsa cerrada: {currency(presentacion.precio_venta_cerrada)}
              {presentacion.precio_manual_cerrada ? " (manual)" : ` (${presentacion.porcentaje_ganancia_cerrada}%)`}
            </span>
            <span>
              Bolsa abierta: {currency(presentacion.precio_venta_abierta)}
              {presentacion.precio_manual_abierta ? " (manual)" : ` (${presentacion.porcentaje_ganancia_abierta}%)`}
            </span>
            <span>
              Por mayor: {currency(presentacion.precio_venta_por_mayor)}
              {presentacion.precio_manual_por_mayor ? " (manual)" : ` (${presentacion.porcentaje_ganancia_por_mayor}%)`}
            </span>
            <span>Precio por kg: {currency(presentacion.precio_por_kg)}</span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {!presentacion.active && <Badge variant="outline">Inactiva</Badge>}
          <Button variant="ghost" size="icon-sm" onClick={() => setEditOpen(true)} aria-label="Editar">
            <Pencil className="size-4" aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={toggleActive}
            disabled={isPending}
            aria-label={presentacion.active ? "Desactivar" : "Reactivar"}
          >
            {presentacion.active ? (
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
      <EditPresentacionSheet presentacion={presentacion} open={editOpen} onOpenChange={setEditOpen} />
    </>
  );
}
