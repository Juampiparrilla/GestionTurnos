"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LinkPendingSpinner } from "@/components/link-pending-spinner";
import type { Marca } from "@/types/marca";
import type { Categoria } from "@/types/categoria";
import type { Proveedor } from "@/types/proveedor";
import type { Producto, Presentacion } from "@/types/producto";
import { EditProductoSheet } from "./edit-producto-sheet";
import { PresentacionesManagement } from "./presentaciones-management";

export function ProductoDetail({
  producto,
  presentaciones,
  marcas,
  categorias,
  proveedores,
}: {
  producto: Producto;
  presentaciones: Presentacion[];
  marcas: Marca[];
  categorias: Categoria[];
  proveedores: Proveedor[];
}) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const marcaNombre = producto.marca_id ? (marcas.find((m) => m.id === producto.marca_id)?.nombre ?? null) : null;

  function deleteForever() {
    if (!confirm(`Esto borra "${producto.nombre}" y todas sus presentaciones para siempre. ¿Continuar?`)) return;

    startTransition(async () => {
      const res = await fetch(`/api/productos/${producto.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        alert(data?.error ?? "No se pudo borrar el producto.");
        return;
      }
      router.push("/productos/productos");
    });
  }

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
            {[marcaNombre, producto.descripcion].filter(Boolean).join(" · ") || "Sin datos adicionales"}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="outline" onClick={() => setEditOpen(true)}>
            Editar
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={deleteForever}
            disabled={isPending}
            aria-label="Borrar definitivamente"
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </div>

      <PresentacionesManagement productoId={producto.id} presentaciones={presentaciones} />

      <EditProductoSheet
        producto={producto}
        open={editOpen}
        onOpenChange={setEditOpen}
        marcas={marcas}
        categorias={categorias}
        proveedores={proveedores}
      />
    </div>
  );
}
