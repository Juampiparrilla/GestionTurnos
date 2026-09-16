import { formatDateOnly } from "@/lib/format-date";
import { formatMonto } from "@/lib/caja/formato-moneda";
import { toISODate } from "@/lib/caja/periodos";
import { CollapsibleCard } from "./collapsible-card";
import type { CajaMovimiento } from "@/types/caja";

// Divide el mes dado en 4 semanas fijas (1-7, 8-14, 15-21, 22-fin de
// mes) -- no semanas de calendario (lunes a domingo), simplemente cuatro
// bloques parejos que suman el mes completo, la 4ta se lleva los días que
// sobran (28-31 según el mes). `month` es 0-indexado (convención Date).
function semanasDelMes(year: number, month: number) {
  const ultimoDia = new Date(year, month + 1, 0).getDate();

  const rangos = [
    { inicio: 1, fin: 7 },
    { inicio: 8, fin: 14 },
    { inicio: 15, fin: 21 },
    { inicio: 22, fin: ultimoDia },
  ];

  return rangos.map(({ inicio, fin }, index) => ({
    numero: index + 1,
    desde: toISODate(new Date(year, month, inicio)),
    hasta: toISODate(new Date(year, month, fin)),
    diaInicio: inicio,
    diaFin: fin,
  }));
}

export function VentaPorSemana({
  activos,
  year,
  month,
}: {
  activos: CajaMovimiento[];
  year: number;
  month: number;
}) {
  const semanas = semanasDelMes(year, month).map((semana) => {
    let ingresos = 0;
    let egresos = 0;
    for (const m of activos) {
      const dia = Number(m.fecha.slice(8, 10));
      if (dia < semana.diaInicio || dia > semana.diaFin) continue;
      if (m.tipo === "ingreso") ingresos += m.monto;
      else egresos += m.monto;
    }
    const dias = semana.diaFin - semana.diaInicio + 1;
    return { ...semana, ingresos, egresos, promedio: ingresos / dias };
  });

  return (
    <CollapsibleCard title="Venta por semana" defaultOpen={false}>
      <div className="space-y-2">
        {semanas.map((semana) => (
          <div key={semana.numero} className="rounded-lg border bg-muted/30 p-3">
            <p className="text-sm font-medium">Semana {semana.numero}</p>
            <p className="text-xs text-muted-foreground">
              {formatDateOnly(semana.desde)} al {formatDateOnly(semana.hasta)}
            </p>
            <div className="mt-1.5 space-y-1 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Ingresos</span>
                <span className="font-medium text-emerald-600">{formatMonto(semana.ingresos)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Egresos</span>
                <span className="font-medium text-rose-600">{formatMonto(semana.egresos)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Promedio diario</span>
                <span className="font-medium">{formatMonto(semana.promedio)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </CollapsibleCard>
  );
}
