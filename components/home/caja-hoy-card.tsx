import Link from "next/link";
import { LinkPendingSpinner } from "@/components/link-pending-spinner";
import { formatMonto } from "@/lib/caja/formato-moneda";

export function CajaHoyCard({ ingresos, egresos }: { ingresos: number; egresos: number }) {
  return (
    <Link
      href="/caja"
      className="block rounded-lg border bg-background p-4 shadow-sm transition-colors hover:bg-muted/50"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Caja de hoy</p>
        <LinkPendingSpinner />
      </div>
      <div className="mt-2 flex gap-6">
        <div>
          <p className="text-xs text-muted-foreground">Ingresos</p>
          <p className="font-semibold text-emerald-600">{formatMonto(ingresos)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Egresos</p>
          <p className="font-semibold text-rose-600">{formatMonto(egresos)}</p>
        </div>
      </div>
    </Link>
  );
}
