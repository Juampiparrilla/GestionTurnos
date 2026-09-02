import { formatDateOnly } from "@/lib/format-date";
import { formatMonto } from "@/lib/caja/formato-moneda";

export function MejorPeorDia({ datos }: { datos: { fecha: string; ingresos: number }[] }) {
  if (datos.length < 2) return null;

  const mejor = datos.reduce((max, d) => (d.ingresos > max.ingresos ? d : max), datos[0]);
  const peor = datos.reduce((min, d) => (d.ingresos < min.ingresos ? d : min), datos[0]);

  return (
    <div className="rounded-lg border bg-background p-4 shadow-sm">
      <p className="mb-2 text-sm font-medium">Mejor y peor día</p>
      <div className="space-y-1 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Más ingresos ({formatDateOnly(mejor.fecha)})</span>
          <span className="font-medium text-emerald-600">{formatMonto(mejor.ingresos)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Menos ingresos ({formatDateOnly(peor.fecha)})</span>
          <span className="font-medium text-rose-600">{formatMonto(peor.ingresos)}</span>
        </div>
      </div>
    </div>
  );
}
