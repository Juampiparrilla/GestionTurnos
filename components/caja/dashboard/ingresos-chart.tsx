"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatDateOnly } from "@/lib/format-date";
import { formatMonto } from "@/lib/caja/formato-moneda";

// Cantidad máxima de fechas que se muestran en el eje X, sea cual sea el
// largo del período -- en el celular no entran más de 5 o 6 sin superponerse.
const MAX_TICKS = 5;

// Elige hasta MAX_TICKS fechas espaciadas parejo dentro de las que ya tienen
// datos (siempre incluye la primera y la última), en vez de dejar que
// Recharts las calcule solo: eso a veces amontonaba todas las etiquetas
// (interval 0 con muchos días) o descartaba la de un día que sí tenía datos
// (interval "preserveEnd" por defecto).
function elegirTicks(fechas: string[]): string[] {
  if (fechas.length <= MAX_TICKS) return fechas;

  const paso = (fechas.length - 1) / (MAX_TICKS - 1);
  const indices = new Set<number>();
  for (let i = 0; i < MAX_TICKS; i++) {
    indices.add(Math.round(i * paso));
  }
  return Array.from(indices).map((i) => fechas[i]);
}

export function IngresosChart({ datos }: { datos: { fecha: string; ingresos: number }[] }) {
  if (datos.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
        No hay ingresos en este período.
      </div>
    );
  }

  const ticks = elegirTicks(datos.map((d) => d.fecha));

  return (
    <div className="h-56 w-full rounded-lg border bg-background p-3 shadow-sm">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={datos} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <XAxis
            dataKey="fecha"
            ticks={ticks}
            tickFormatter={(v: string) => formatDateOnly(v).slice(0, 5)}
            tick={{ fontSize: 12 }}
            interval={0}
            stroke="currentColor"
            className="text-muted-foreground"
          />
          <YAxis
            tickFormatter={(v: number) => formatMonto(v)}
            tick={{ fontSize: 11 }}
            width={70}
            stroke="currentColor"
            className="text-muted-foreground"
          />
          <Tooltip
            formatter={(value) => formatMonto(Number(value))}
            labelFormatter={(label) => formatDateOnly(String(label))}
            contentStyle={{ fontSize: 13 }}
          />
          <Line type="monotone" dataKey="ingresos" stroke="#059669" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
