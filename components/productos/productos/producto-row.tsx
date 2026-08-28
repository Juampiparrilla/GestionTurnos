import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { LinkPendingSpinner } from "@/components/link-pending-spinner";
import type { Producto } from "@/types/producto";

export function ProductoRow({
  producto,
  numero,
  marcaNombre,
  categoriaNombre,
  proveedorNombre,
}: {
  producto: Producto;
  numero: number;
  marcaNombre: string | null;
  categoriaNombre: string | null;
  proveedorNombre: string | null;
}) {
  return (
    <Link
      href={`/productos/productos/${producto.id}`}
      className="flex items-center justify-between rounded-lg border bg-background p-4 shadow-sm transition-colors hover:bg-muted/50"
    >
      <div className="flex min-w-0 items-center gap-3">
        <span className="w-6 shrink-0 text-sm text-muted-foreground">{numero}.</span>
        <div className="min-w-0">
          <p className="truncate font-medium">{producto.nombre}</p>
          <p className="truncate text-sm text-muted-foreground">
            {[marcaNombre, categoriaNombre, proveedorNombre].filter(Boolean).join(" · ") || "Sin datos"}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {!producto.active && <Badge variant="outline">Inactivo</Badge>}
        <LinkPendingSpinner />
      </div>
    </Link>
  );
}
