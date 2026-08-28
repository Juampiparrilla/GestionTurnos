import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { LinkPendingSpinner } from "@/components/link-pending-spinner";
import type { Producto } from "@/types/producto";

export function ProductoRow({
  producto,
  categoriaNombre,
  proveedorNombre,
}: {
  producto: Producto;
  categoriaNombre: string | null;
  proveedorNombre: string | null;
}) {
  return (
    <Link
      href={`/productos/productos/${producto.id}`}
      className="flex items-center justify-between rounded-lg border bg-background p-4 shadow-sm transition-colors hover:bg-muted/50"
    >
      <div className="min-w-0">
        <p className="truncate font-medium">{producto.nombre}</p>
        <p className="truncate text-sm text-muted-foreground">
          {[producto.marca, categoriaNombre, proveedorNombre].filter(Boolean).join(" · ") || "Sin datos"}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {!producto.active && <Badge variant="outline">Inactivo</Badge>}
        <LinkPendingSpinner />
      </div>
    </Link>
  );
}
