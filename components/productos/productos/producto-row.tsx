"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Ban, ChevronDown, ChevronUp, Pencil, RotateCcw, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PendingOverlay } from "@/components/pending-overlay";
import type { Marca } from "@/types/marca";
import type { Categoria } from "@/types/categoria";
import type { Proveedor } from "@/types/proveedor";
import type { Producto } from "@/types/producto";
import { EditProductoSheet } from "./edit-producto-sheet";

const currency = (value: number) => `$${value.toLocaleString("es-AR")}`;

export function ProductoRow({
  producto,
  numero,
  marcaNombre,
  categoriaNombre,
  proveedorNombre,
  marcas,
  categorias,
  proveedores,
}: {
  producto: Producto;
  numero: number;
  marcaNombre: string | null;
  categoriaNombre: string | null;
  proveedorNombre: string | null;
  marcas: Marca[];
  categorias: Categoria[];
  proveedores: Proveedor[];
}) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [isPending, startTransition] = useTransition();

  function toggleActive() {
    const pregunta = producto.active
      ? `¿Desactivar "${producto.nombre}"? Podés reactivarlo después.`
      : `¿Reactivar "${producto.nombre}"?`;
    if (!confirm(pregunta)) return;

    startTransition(async () => {
      await fetch(`/api/productos/${producto.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: producto.nombre,
          marcaId: producto.marca_id ?? "",
          categoriaId: producto.categoria_id ?? "",
          proveedorId: producto.proveedor_id ?? "",
          descripcion: producto.descripcion ?? "",
          kg: producto.kg,
          costo: producto.costo,
          porcentajeCerrada: producto.porcentaje_ganancia_cerrada,
          manualCerrada: producto.precio_manual_cerrada,
          precioManualCerrada: producto.precio_venta_cerrada,
          porcentajeAbierta: producto.porcentaje_ganancia_abierta,
          manualAbierta: producto.precio_manual_abierta,
          precioManualAbierta: producto.precio_venta_abierta,
          porcentajePorMayor: producto.porcentaje_ganancia_por_mayor,
          manualPorMayor: producto.precio_manual_por_mayor,
          precioManualPorMayor: producto.precio_venta_por_mayor,
          active: !producto.active,
        }),
      });
      router.refresh();
    });
  }

  function deleteForever() {
    if (!confirm(`Esto borra "${producto.nombre}" para siempre y no se puede deshacer. ¿Continuar?`)) return;

    startTransition(async () => {
      const res = await fetch(`/api/productos/${producto.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        alert(data?.error ?? "No se pudo borrar el producto.");
        return;
      }
      router.refresh();
    });
  }

  return (
    <>
      <PendingOverlay pending={isPending} />
      <div className="rounded-lg border bg-background shadow-sm">
        <div className="flex items-center justify-between gap-3 p-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="w-6 shrink-0 text-sm text-muted-foreground">{numero}.</span>
            <div className="min-w-0">
              <p className="truncate font-medium">
                {producto.nombre} · {producto.kg} kg
              </p>
              <p className="truncate text-sm text-muted-foreground">
                {[marcaNombre, categoriaNombre, proveedorNombre].filter(Boolean).join(" · ") || "Sin datos"}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {!producto.active && <Badge variant="outline">Inactivo</Badge>}
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setExpanded((v) => !v)}
              aria-label={expanded ? "Ocultar precios" : "Ver precios"}
            >
              {expanded ? (
                <ChevronUp className="size-4" aria-hidden="true" />
              ) : (
                <ChevronDown className="size-4" aria-hidden="true" />
              )}
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={() => setEditOpen(true)} aria-label="Editar">
              <Pencil className="size-4" aria-hidden="true" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={toggleActive}
              disabled={isPending}
              aria-label={producto.active ? "Desactivar" : "Reactivar"}
            >
              {producto.active ? (
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
        {expanded && (
          <div className="flex flex-wrap gap-x-4 gap-y-1 border-t px-4 py-3 text-sm text-muted-foreground">
            <span>Costo: {currency(producto.costo)}</span>
            <span>
              Bolsa cerrada: {currency(producto.precio_venta_cerrada)}
              {producto.precio_manual_cerrada ? " (manual)" : ` (${producto.porcentaje_ganancia_cerrada}%)`}
            </span>
            <span>
              Bolsa abierta: {currency(producto.precio_venta_abierta)}
              {producto.precio_manual_abierta ? " (manual)" : ` (${producto.porcentaje_ganancia_abierta}%)`}
            </span>
            <span>
              Por mayor: {currency(producto.precio_venta_por_mayor)}
              {producto.precio_manual_por_mayor ? " (manual)" : ` (${producto.porcentaje_ganancia_por_mayor}%)`}
            </span>
            <span>Precio por kg: {currency(producto.precio_por_kg)}</span>
          </div>
        )}
      </div>
      <EditProductoSheet
        producto={producto}
        open={editOpen}
        onOpenChange={setEditOpen}
        marcas={marcas}
        categorias={categorias}
        proveedores={proveedores}
      />
    </>
  );
}
