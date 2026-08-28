"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/productos/search-input";
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
  const [createOpen, setCreateOpen] = useState(false);
  const [query, setQuery] = useState("");

  const marcaPorId = new Map(marcas.map((m) => [m.id, m.nombre]));
  const categoriaPorId = new Map(categorias.map((c) => [c.id, c.nombre]));
  const proveedorPorId = new Map(proveedores.map((p) => [p.id, p.nombre]));

  const filtrados = productos.filter((p) => p.nombre.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{descripcion}</p>
      <Button onClick={() => setCreateOpen(true)} className="w-full">
        + Crear producto
      </Button>
      <SearchInput value={query} onChange={setQuery} placeholder="Buscar producto..." />
      {filtrados.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          {productos.length === 0
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
      />
    </div>
  );
}
