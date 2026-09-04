import Link from "next/link";
import { ArrowDown, ArrowUp } from "lucide-react";
import { LinkPendingSpinner } from "@/components/link-pending-spinner";
import { formatMonto } from "@/lib/caja/formato-moneda";

export function CajaHoyCard({ ingresos, egresos }: { ingresos: number; egresos: number }) {
  return (
    <Link
      href="/caja"
      className="block rounded-lg border border-zinc-200 bg-zinc-50 p-4 shadow-sm transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Caja de hoy</p>
        <LinkPendingSpinner />
      </div>
      <div className="mt-2 grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-background p-3 shadow-sm">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <ArrowUp className="size-3.5 text-emerald-600" aria-hidden="true" />
            Ingresos
          </div>
          <p className="font-semibold text-emerald-600">{formatMonto(ingresos)}</p>
        </div>
        <div className="rounded-lg bg-background p-3 shadow-sm">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <ArrowDown className="size-3.5 text-rose-600" aria-hidden="true" />
            Egresos
          </div>
          <p className="font-semibold text-rose-600">{formatMonto(egresos)}</p>
        </div>
      </div>
    </Link>
  );
}
