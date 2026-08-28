"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Categoria } from "@/types/categoria";
import type { Proveedor } from "@/types/proveedor";
import type { Producto } from "@/types/producto";
import { ProductoRow } from "./producto-row";
import { CreateProductoSheet } from "./create-producto-sheet";

export function ProductosList({
  productos,
  categorias,
  proveedores,
  marcas,
}: {
  productos: Producto[];
  categorias: Categoria[];
  proveedores: Proveedor[];
  marcas: string[];
}) {
  const [createOpen, setCreateOpen] = useState(false);

  const categoriaPorId = new Map(categorias.map((c) => [c.id, c.nombre]));
  const proveedorPorId = new Map(proveedores.map((p) => [p.id, p.nombre]));

  return (
    <div className="space-y-4">
      <Button onClick={() => setCreateOpen(true)}>+ Crear producto</Button>
      {productos.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          Todavía no hay productos. Podés cargar uno a mano o importar un Excel.
        </div>
      ) : (
        <div className="grid gap-3">
          {productos.map((producto) => (
            <ProductoRow
              key={producto.id}
              producto={producto}
              categoriaNombre={producto.categoria_id ? (categoriaPorId.get(producto.categoria_id) ?? null) : null}
              proveedorNombre={producto.proveedor_id ? (proveedorPorId.get(producto.proveedor_id) ?? null) : null}
            />
          ))}
        </div>
      )}
      <CreateProductoSheet
        open={createOpen}
        onOpenChange={setCreateOpen}
        categorias={categorias}
        proveedores={proveedores}
        marcas={marcas}
      />
    </div>
  );
}
