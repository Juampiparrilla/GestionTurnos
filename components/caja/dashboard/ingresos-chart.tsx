"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatDateOnly } from "@/lib/format-date";
import { formatMonto } from "@/lib/caja/formato-moneda";

export function IngresosChart({ datos }: { datos: { fecha: string; ingresos: number }[] }) {
  if (datos.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
        No hay ingresos en este período.
      </div>
    );
  }

  return (
    <div className="h-56 w-full rounded-lg border bg-background p-3 shadow-sm">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={datos} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <XAxis
            dataKey="fecha"
            tickFormatter={(v: string) => formatDateOnly(v).slice(0, 5)}
            tick={{ fontSize: 12 }}
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
