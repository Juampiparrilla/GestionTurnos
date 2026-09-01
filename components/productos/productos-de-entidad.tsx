"use client";

import { useEffect, useState, useTransition } from "react";
import { ArrowRightLeft } from "lucide-react";
import { PendingOverlay } from "@/components/pending-overlay";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCantidad } from "@/lib/productos/formato-cantidad";
import { productoAPayloadEdicion } from "@/lib/productos/producto-a-payload";
import { showSuccessToast, showErrorToast } from "@/lib/toast";
import type { Producto } from "@/types/producto";

// Lista de productos de una categoría/marca puntual, cargada bajo demanda
// (se monta solo cuando la fila correspondiente está desplegada, y se pide
// de nuevo cada vez que se vuelve a desplegar -- así no hace falta traer
// todo el catálogo de entrada en pantallas de Categorías/Marcas). Cada
// producto tiene un selector para reasignarlo a otra categoría/marca sin
// pasar por el formulario completo de edición.
export function ProductosDeEntidad({
  endpoint,
  campo,
  opciones,
  placeholder,
}: {
  endpoint: string;
  campo: "categoriaId" | "marcaId";
  opciones: { value: string; label: string }[];
  placeholder: string;
}) {
  const [productos, setProductos] = useState<Producto[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let cancelado = false;
    fetch(endpoint)
      .then((res) => res.json())
      .then((data) => {
        if (cancelado) return;
        if (Array.isArray(data?.productos)) {
          setProductos(data.productos);
        } else {
          setError("No se pudieron cargar los productos.");
        }
      })
      .catch(() => {
        if (!cancelado) setError("No se pudieron cargar los productos.");
      });
    return () => {
      cancelado = true;
    };
  }, [endpoint]);

  function reasignar(producto: Producto, nuevoValor: string) {
    startTransition(async () => {
      const res = await fetch(`/api/productos/${producto.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productoAPayloadEdicion(producto, { [campo]: nuevoValor })),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        showErrorToast(data?.error ?? "No se pudo reasignar el producto.");
        return;
      }
      showSuccessToast(`"${producto.nombre}" reasignado con éxito`);
      setProductos((prev) => prev?.filter((p) => p.id !== producto.id) ?? prev);
    });
  }

  return (
    <div className="relative flex flex-col gap-2 border-t px-4 py-3">
      <PendingOverlay pending={isPending} />
      {error && <p className="text-sm text-destructive">{error}</p>}
      {!error && productos === null && <p className="text-sm text-muted-foreground">Cargando productos...</p>}
      {!error && productos !== null && (
        <>
          <p className="text-sm font-medium">
            {productos.length} {productos.length === 1 ? "producto" : "productos"}
          </p>
          {productos.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay productos acá.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {productos.map((producto) => (
                <div key={producto.id} className="flex items-center justify-between gap-2 text-sm">
                  <span className="min-w-0 flex-1 break-words">
                    {producto.nombre} · {formatCantidad(producto.kg, producto.unidad_medida)}
                  </span>
                  <Select value="" onValueChange={(v) => v && reasignar(producto, v)}>
                    <SelectTrigger size="sm" className="w-40 shrink-0" aria-label={placeholder}>
                      <ArrowRightLeft className="size-3.5" aria-hidden="true" />
                      <SelectValue>{() => placeholder}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {opciones.map((opcion) => (
                        <SelectItem key={opcion.value} value={opcion.value}>
                          {opcion.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
