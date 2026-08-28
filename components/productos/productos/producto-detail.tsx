"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LinkPendingSpinner } from "@/components/link-pending-spinner";
import type { Categoria } from "@/types/categoria";
import type { Proveedor } from "@/types/proveedor";
import type { Producto, Presentacion } from "@/types/producto";
import { EditProductoSheet } from "./edit-producto-sheet";
import { PresentacionesManagement } from "./presentaciones-management";

export function ProductoDetail({
  producto,
  presentaciones,
  categorias,
  proveedores,
  marcas,
}: {
  producto: Producto;
  presentaciones: Presentacion[];
  categorias: Categoria[];
  proveedores: Proveedor[];
  marcas: string[];
}) {
  const [editOpen, setEditOpen] = useState(false);

  return (
    <div className="space-y-6">
      <Link
        href="/productos/productos"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Volver a productos
        <LinkPendingSpinner />
      </Link>

      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold">{producto.nombre}</h1>
            {!producto.active && <Badge variant="outline">Inactivo</Badge>}
          </div>
          <p className="text-sm text-muted-foreground">
            {[producto.marca, producto.descripcion].filter(Boolean).join(" · ") || "Sin datos adicionales"}
          </p>
        </div>
        <Button variant="outline" onClick={() => setEditOpen(true)}>
          Editar
        </Button>
      </div>

      <PresentacionesManagement productoId={producto.id} presentaciones={presentaciones} />

      <EditProductoSheet
        producto={producto}
        open={editOpen}
        onOpenChange={setEditOpen}
        categorias={categorias}
        proveedores={proveedores}
        marcas={marcas}
      />
    </div>
  );
}
