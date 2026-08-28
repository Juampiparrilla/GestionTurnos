"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
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
}: {
  productos: Producto[];
  marcas: Marca[];
  categorias: Categoria[];
  proveedores: Proveedor[];
}) {
  const [createOpen, setCreateOpen] = useState(false);

  const marcaPorId = new Map(marcas.map((m) => [m.id, m.nombre]));
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
              marcaNombre={producto.marca_id ? (marcaPorId.get(producto.marca_id) ?? null) : null}
              categoriaNombre={producto.categoria_id ? (categoriaPorId.get(producto.categoria_id) ?? null) : null}
              proveedorNombre={producto.proveedor_id ? (proveedorPorId.get(producto.proveedor_id) ?? null) : null}
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
