"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp } from "lucide-react";
import { PendingOverlay } from "@/components/pending-overlay";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SearchInput } from "@/components/productos/search-input";
import { useProductoFiltros } from "@/components/productos/use-producto-filtros";
import { ProductoFiltrosPanel } from "@/components/productos/producto-filtros-panel";
import { formatCantidad } from "@/lib/productos/formato-cantidad";
import { showSuccessToast } from "@/lib/toast";
import type { Marca } from "@/types/marca";
import type { Categoria } from "@/types/categoria";
import type { Proveedor } from "@/types/proveedor";
import type { Producto } from "@/types/producto";

const currency = (value: number) => `$${value.toLocaleString("es-AR")}`;

export function ActualizarCostosView({
  productos,
  marcas,
  categorias,
  proveedores,
  descripcion,
}: {
  productos: Producto[];
  marcas: Marca[];
  categorias: Categoria[];
  proveedores: Proveedor[];
  descripcion: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const [filtrosOpen, setFiltrosOpen] = useState(false);
  const [porcentaje, setPorcentaje] = useState(0);
  const [error, setError] = useState<string | null>(null);
  // Los filtros solo acotan qué se ve en la lista -- lo que efectivamente
  // se ajusta es lo que se tilda a mano, así se puede buscar varias veces
  // (ej. "chizitos", después "agility") y armar la selección de a poco
  // sin perder lo ya elegido.
  const [seleccionados, setSeleccionados] = useState<Set<string>>(new Set());

  const filtros = useProductoFiltros(productos);
  const filtrados = filtros.filtrados.filter((p) =>
    p.nombre.toLowerCase().includes(query.trim().toLowerCase()),
  );

  const todosVisiblesSeleccionados = filtrados.length > 0 && filtrados.every((p) => seleccionados.has(p.id));

  function toggleSeleccion(id: string) {
    setSeleccionados((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function toggleSeleccionarVisibles() {
    setSeleccionados((prev) => {
      const next = new Set(prev);
      if (todosVisiblesSeleccionados) {
        filtrados.forEach((p) => next.delete(p.id));
      } else {
        filtrados.forEach((p) => next.add(p.id));
      }
      return next;
    });
  }

  function seleccionarTodos() {
    setSeleccionados(new Set(productos.map((p) => p.id)));
  }

  function limpiarSeleccion() {
    setSeleccionados(new Set());
  }

  function aplicarAjuste() {
    setError(null);

    if (!porcentaje) {
      setError("Ingresá un porcentaje distinto de 0.");
      return;
    }
    if (seleccionados.size === 0) {
      setError("Seleccioná al menos un producto de la lista.");
      return;
    }

    const ids = Array.from(seleccionados);
    const signo = porcentaje > 0 ? "un aumento" : "una baja";
    const pregunta = `¿Aplicar ${signo} del ${Math.abs(porcentaje)}% al costo de ${ids.length} ${ids.length === 1 ? "producto seleccionado" : "productos seleccionados"}? Los precios de venta se recalculan solos con el % de ganancia que ya tenga cada pista (no toca las que tenés fijadas manualmente).`;
    if (!confirm(pregunta)) return;

    startTransition(async () => {
      const res = await fetch("/api/productos/ajustar-costo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productoIds: ids, porcentaje }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "No se pudo aplicar el ajuste.");
        return;
      }

      setPorcentaje(0);
      setSeleccionados(new Set());
      showSuccessToast(`Se actualizaron ${data.updated} ${data.updated === 1 ? "producto" : "productos"}`);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <PendingOverlay pending={isPending} />
      <p className="text-sm text-muted-foreground">{descripcion}</p>

      <SearchInput value={query} onChange={setQuery} placeholder="Buscar producto..." />

      <Button
        type="button"
        variant="outline"
        className="w-full justify-between"
        onClick={() => setFiltrosOpen((v) => !v)}
      >
        <span>Aplicar filtros{filtros.hayFiltrosActivos ? " (activos)" : ""}</span>
        {filtrosOpen ? (
          <ChevronUp className="size-4" aria-hidden="true" />
        ) : (
          <ChevronDown className="size-4" aria-hidden="true" />
        )}
      </Button>

      {filtrosOpen && (
        <ProductoFiltrosPanel
          idPrefix="filtro-costos"
          marcas={marcas}
          categorias={categorias}
          proveedores={proveedores}
          filtros={filtros}
        />
      )}

      <div className="space-y-2 rounded-lg border p-3">
        <Label htmlFor="porcentaje-ajuste-costo">% de ajuste sobre el costo</Label>
        <Input
          id="porcentaje-ajuste-costo"
          type="number"
          step="0.01"
          value={porcentaje || ""}
          onChange={(e) => setPorcentaje(e.target.value ? Number(e.target.value) : 0)}
        />
        <p className="text-xs text-muted-foreground">
          Para aumentar escribí solo el número (ej. 15). Para bajar, escribí el signo &quot;-&quot; adelante (ej. -15).
        </p>
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <Button type="button" className="w-full" disabled={isPending || seleccionados.size === 0} onClick={aplicarAjuste}>
          {isPending
            ? "Aplicando..."
            : `Aplicar a ${seleccionados.size} ${seleccionados.size === 1 ? "producto seleccionado" : "productos seleccionados"}`}
        </Button>
      </div>

      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground">
            {filtrados.length} {filtrados.length === 1 ? "producto encontrado" : "productos encontrados"}
            {seleccionados.size > 0 &&
              ` · ${seleccionados.size} ${seleccionados.size === 1 ? "seleccionado" : "seleccionados"}`}
          </p>
          <div className="flex flex-wrap gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-auto px-2 py-1 text-muted-foreground"
              disabled={productos.length === 0}
              onClick={seleccionarTodos}
            >
              Seleccionar todos ({productos.length})
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-auto px-2 py-1 text-muted-foreground"
              disabled={filtrados.length === 0}
              onClick={toggleSeleccionarVisibles}
            >
              {todosVisiblesSeleccionados ? "Deseleccionar visibles" : "Seleccionar visibles"}
            </Button>
            {seleccionados.size > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-auto px-2 py-1 text-muted-foreground"
                onClick={limpiarSeleccion}
              >
                Limpiar selección
              </Button>
            )}
          </div>
        </div>
        {filtrados.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
            No se encontraron productos con estos filtros.
          </div>
        ) : (
          <div className="grid gap-2">
            {filtrados.map((producto, index) => (
              <label
                key={producto.id}
                className="flex items-center gap-3 rounded-lg border bg-background p-3 text-sm has-[[data-checked]]:border-primary"
              >
                <Checkbox
                  checked={seleccionados.has(producto.id)}
                  onCheckedChange={() => toggleSeleccion(producto.id)}
                />
                <span className="min-w-0 flex-1 break-words">
                  {index + 1}. {producto.nombre} · {formatCantidad(producto.kg, producto.unidad_medida)}
                </span>
                <span className="shrink-0 font-medium">{currency(producto.costo)}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
