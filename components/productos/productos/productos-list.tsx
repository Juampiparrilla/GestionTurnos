"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/productos/search-input";
import { useProductoFiltros } from "@/components/productos/use-producto-filtros";
import { ProductoFiltrosPanel } from "@/components/productos/producto-filtros-panel";
import type { Marca } from "@/types/marca";
import type { Categoria } from "@/types/categoria";
import type { Proveedor } from "@/types/proveedor";
import type { Producto } from "@/types/producto";
import { ProductoRow } from "./producto-row";
import { CreateProductoSheet } from "./create-producto-sheet";

export function ProductosList({
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
  const [items, setItems] = useState(productos);
  const [createOpen, setCreateOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [filtrosOpen, setFiltrosOpen] = useState(false);

  // Si el servidor manda una lista nueva (ej. RefreshOnFocus trajo cambios
  // cargados desde otro dispositivo), se refleja acá -- sin esto la copia
  // local (para las ediciones optimistas) se quedaría con los datos viejos.
  // Se ajusta durante el render (no en un efecto) siguiendo el patrón que
  // React recomienda para "resetear estado cuando cambia una prop".
  const [prevProductos, setPrevProductos] = useState(productos);
  if (productos !== prevProductos) {
    setPrevProductos(productos);
    setItems(productos);
  }

  const filtros = useProductoFiltros(items);
  const filtrados = filtros.filtrados.filter((p) =>
    p.nombre.toLowerCase().includes(query.trim().toLowerCase()),
  );

  const marcaPorId = new Map(marcas.map((m) => [m.id, m.nombre]));
  const categoriaPorId = new Map(categorias.map((c) => [c.id, c.nombre]));
  const proveedorPorId = new Map(proveedores.map((p) => [p.id, p.nombre]));

  const nombresExistentes = Array.from(new Set(items.map((p) => p.nombre))).sort();

  function handleCreated(producto: Producto) {
    setItems((prev) => [...prev, producto].sort((a, b) => a.nombre.localeCompare(b.nombre)));
  }

  function handleUpdated(producto: Producto) {
    setItems((prev) => prev.map((p) => (p.id === producto.id ? producto : p)));
  }

  function handleDeleted(id: string) {
    setItems((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{descripcion}</p>
      <Button onClick={() => setCreateOpen(true)} className="w-full">
        <Plus className="size-4" aria-hidden="true" />
        Crear producto
      </Button>
      <SearchInput value={query} onChange={setQuery} placeholder="Buscar producto..." />

      <Button
        type="button"
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
          idPrefix="filtro-productos"
          marcas={marcas}
          categorias={categorias}
          proveedores={proveedores}
          filtros={filtros}
        />
      )}

      {filtrados.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          {items.length === 0
            ? "Todavía no hay productos. Podés cargar uno a mano o importar un Excel."
            : "No se encontraron productos."}
        </div>
      ) : (
        <div className="grid gap-3">
          {filtrados.map((producto, index) => (
            <ProductoRow
              key={producto.id}
              producto={producto}
              numero={index + 1}
              marcaNombre={producto.marca_id ? (marcaPorId.get(producto.marca_id) ?? null) : null}
              categoriaNombre={producto.categoria_id ? (categoriaPorId.get(producto.categoria_id) ?? null) : null}
              proveedorNombre={producto.proveedor_id ? (proveedorPorId.get(producto.proveedor_id) ?? null) : null}
              marcas={marcas}
              categorias={categorias}
              proveedores={proveedores}
              nombresExistentes={nombresExistentes}
              onUpdated={handleUpdated}
              onDeleted={handleDeleted}
            />
          ))}
        </div>
      )}
      <CreateProductoSheet
        open={createOpen}
        onOpenChange={setCreateOpen}
        marcas={marcas}
        categorias={categorias}
        proveedores={proveedores}
        nombresExistentes={nombresExistentes}
        onCreated={handleCreated}
      />
    </div>
  );
}
