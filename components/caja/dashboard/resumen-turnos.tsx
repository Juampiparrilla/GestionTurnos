import { formatMonto } from "@/lib/caja/formato-moneda";

export function ResumenTurnos({ resumen }: { resumen: { turno: string; monto: number }[] }) {
  const total = resumen.reduce((acc, r) => acc + r.monto, 0);

  if (resumen.length === 0) {
    return null;
  }

  return (
    <div className="rounded-lg border bg-background p-4 shadow-sm">
      <p className="mb-2 text-sm font-medium">Ingresos por turno</p>
      <div className="space-y-1">
        {resumen.map((r) => (
          <div key={r.turno} className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{r.turno}</span>
            <span className="font-medium">{formatMonto(r.monto)}</span>
          </div>
        ))}
        <div className="flex items-center justify-between border-t pt-1 text-sm font-semibold">
          <span>Total</span>
          <span>{formatMonto(total)}</span>
        </div>
      </div>
    </div>
  );
}
