"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { BadgePercent, Ban, ChevronDown, ChevronUp, Pencil, RotateCcw, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PendingOverlay } from "@/components/pending-overlay";
import type { Marca } from "@/types/marca";
import type { Categoria } from "@/types/categoria";
import type { Proveedor } from "@/types/proveedor";
import type { Producto } from "@/types/producto";
import { formatCantidad } from "@/lib/productos/formato-cantidad";
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
  nombresExistentes,
  onUpdated,
  onDeleted,
}: {
  producto: Producto;
  numero: number;
  marcaNombre: string | null;
  categoriaNombre: string | null;
  proveedorNombre: string | null;
  marcas: Marca[];
  categorias: Categoria[];
  proveedores: Proveedor[];
  nombresExistentes: string[];
  onUpdated: (producto: Producto) => void;
  onDeleted: (id: string) => void;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [isPending, startTransition] = useTransition();
  const detalleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (expanded) {
      detalleRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [expanded]);

  function toggleActive() {
    const pregunta = producto.active
      ? `¿Desactivar "${producto.nombre}"? Podés reactivarlo después.`
      : `¿Reactivar "${producto.nombre}"?`;
    if (!confirm(pregunta)) return;

    startTransition(async () => {
      const res = await fetch(`/api/productos/${producto.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: producto.nombre,
          marcaId: producto.marca_id ?? "",
          categoriaId: producto.categoria_id ?? "",
          proveedorId: producto.proveedor_id ?? "",
          descripcion: producto.descripcion ?? "",
          kg: producto.kg,
          unidadMedida: producto.unidad_medida,
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
          oferta: producto.oferta,
          active: !producto.active,
        }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.producto) {
        onUpdated(data.producto);
      }
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
      onDeleted(producto.id);
    });
  }

  return (
    <>
      <PendingOverlay pending={isPending} />
      <div className="min-w-0 rounded-lg border bg-background shadow-sm">
        <div className="flex flex-col gap-2 p-4">
          <p className="flex items-center gap-1.5 font-medium break-words">
            <span>
              {numero}. {producto.nombre} · {formatCantidad(producto.kg, producto.unidad_medida)}
            </span>
            {producto.oferta && (
              <span title="En oferta">
                <BadgePercent className="size-4 shrink-0 text-amber-600" aria-label="En oferta" />
              </span>
            )}
          </p>
          {producto.codigo && <p className="font-mono text-xs text-muted-foreground">{producto.codigo}</p>}
          <div className="flex items-center justify-end gap-1">
            {!producto.active && <Badge variant="outline" className="mr-auto">Inactivo</Badge>}
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setExpanded((v) => !v)}
              aria-label={expanded ? "Ocultar detalle" : "Ver detalle"}
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
          <div ref={detalleRef} className="flex flex-col gap-1 border-t px-4 py-3 text-sm text-muted-foreground">
            {!marcaNombre && !categoriaNombre && !proveedorNombre && <span>Sin datos</span>}
            {marcaNombre && <span>Marca: {marcaNombre}</span>}
            {categoriaNombre && <span>Categoría: {categoriaNombre}</span>}
            {proveedorNombre && <span>Proveedor: {proveedorNombre}</span>}
            <span>Costo: {currency(producto.costo)}</span>
            <span>
              {producto.unidad_medida === "kg" ? "Bolsa cerrada" : "Precio unitario"}:{" "}
              {currency(producto.precio_venta_cerrada)}
              {producto.precio_manual_cerrada ? " (manual)" : ` (${producto.porcentaje_ganancia_cerrada}%)`}
            </span>
            {producto.unidad_medida === "kg" && (
              <span>
                Bolsa abierta: {currency(producto.precio_venta_abierta)}
                {producto.precio_manual_abierta ? " (manual)" : ` (${producto.porcentaje_ganancia_abierta}%)`}
              </span>
            )}
            <span>
              Por mayor: {currency(producto.precio_venta_por_mayor)}
              {producto.precio_manual_por_mayor ? " (manual)" : ` (${producto.porcentaje_ganancia_por_mayor}%)`}
            </span>
            {producto.unidad_medida === "kg" && (
              <span>Precio por kg: {currency(producto.precio_por_kg)}</span>
            )}
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
        nombresExistentes={nombresExistentes}
        onUpdated={onUpdated}
      />
    </>
  );
}
