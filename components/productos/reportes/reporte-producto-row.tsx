"use client";

import { useEffect, useRef, useState } from "react";
import { BadgePercent, ChevronDown, ChevronUp } from "lucide-react";
import type { Producto } from "@/types/producto";
import { formatCantidad } from "@/lib/productos/formato-cantidad";

const currency = (value: number) => `$${value.toLocaleString("es-AR")}`;

export function ReporteProductoRow({
  producto,
  numero,
  marcaNombre,
  categoriaNombre,
  proveedorNombre,
}: {
  producto: Producto;
  numero: number;
  marcaNombre: string | null;
  categoriaNombre: string | null;
  proveedorNombre: string | null;
}) {
  const [expanded, setExpanded] = useState(false);
  const detalleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (expanded) {
      detalleRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [expanded]);

  return (
    <div className="min-w-0 rounded-lg border bg-background shadow-sm">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="flex w-full items-start justify-between gap-2 p-3 text-left"
      >
        <div className="min-w-0">
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
        </div>
        {expanded ? (
          <ChevronUp className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        ) : (
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        )}
      </button>
      {expanded && (
        <div ref={detalleRef} className="flex flex-col gap-1 border-t px-3 py-3 text-sm text-muted-foreground">
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
  );
}
