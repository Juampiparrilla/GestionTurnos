"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp } from "lucide-react";
import { PendingOverlay } from "@/components/pending-overlay";
import { Button } from "@/components/ui/button";
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

  const filtros = useProductoFiltros(productos);
  const filtrados = filtros.filtrados.filter((p) =>
    p.nombre.toLowerCase().includes(query.trim().toLowerCase()),
  );

  function aplicarAjuste() {
    setError(null);

    if (!porcentaje) {
      setError("Ingresá un porcentaje distinto de 0.");
      return;
    }
    if (filtrados.length === 0) return;

    const signo = porcentaje > 0 ? "un aumento" : "una baja";
    const pregunta = `¿Aplicar ${signo} del ${Math.abs(porcentaje)}% al costo de ${filtrados.length} ${filtrados.length === 1 ? "producto" : "productos"}? Los precios de venta se recalculan solos con el % de ganancia que ya tenga cada pista (no toca las que tenés fijadas manualmente).`;
    if (!confirm(pregunta)) return;

    startTransition(async () => {
      const res = await fetch("/api/productos/ajustar-costo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productoIds: filtrados.map((p) => p.id), porcentaje }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "No se pudo aplicar el ajuste.");
        return;
      }

      setPorcentaje(0);
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
        <Label htmlFor="porcentaje-ajuste-costo">
          % de ajuste sobre el costo (positivo para aumentar, negativo para bajar)
        </Label>
        <Input
          id="porcentaje-ajuste-costo"
          type="number"
          step="0.01"
          value={porcentaje || ""}
          onChange={(e) => setPorcentaje(e.target.value ? Number(e.target.value) : 0)}
        />
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <Button
          type="button"
          className="w-full"
          disabled={isPending || filtrados.length === 0}
          onClick={aplicarAjuste}
        >
          {isPending ? "Aplicando..." : `Aplicar a ${filtrados.length} ${filtrados.length === 1 ? "producto" : "productos"}`}
        </Button>
      </div>

      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          {filtrados.length} {filtrados.length === 1 ? "producto encontrado" : "productos encontrados"}
        </p>
        {filtrados.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
            No se encontraron productos con estos filtros.
          </div>
        ) : (
          <div className="grid gap-2">
            {filtrados.map((producto, index) => (
              <div
                key={producto.id}
                className="flex items-center justify-between gap-2 rounded-lg border bg-background p-3 text-sm"
              >
                <span className="min-w-0 break-words">
                  {index + 1}. {producto.nombre} · {formatCantidad(producto.kg, producto.unidad_medida)}
                </span>
                <span className="shrink-0 font-medium">{currency(producto.costo)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
