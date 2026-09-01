export type PeriodoCaja =
  | "hoy"
  | "ayer"
  | "ultimos_7"
  | "ultimos_30"
  | "este_mes"
  | "mes_anterior"
  | "personalizado";

export const PERIODO_LABEL: Record<PeriodoCaja, string> = {
  hoy: "Hoy",
  ayer: "Ayer",
  ultimos_7: "Últimos 7 días",
  ultimos_30: "Últimos 30 días",
  este_mes: "Este mes",
  mes_anterior: "Mes anterior",
  personalizado: "Personalizado",
};

export function toISODate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Fecha de hoy en formato YYYY-MM-DD, en hora local (no UTC) -- para
// precargar el campo Fecha de "Nuevo movimiento".
export function hoyISO() {
  return toISODate(new Date());
}

function sumarDias(date: Date, dias: number) {
  const copia = new Date(date);
  copia.setDate(copia.getDate() + dias);
  return copia;
}

// Resuelve un período a un rango de fechas [desde, hasta] (ambos incluidos,
// formato YYYY-MM-DD). `hoy` se recibe como parámetro para que sea testeable
// sin depender del reloj real.
export function resolverRangoPeriodo(
  periodo: PeriodoCaja,
  hoy: Date,
  personalizado?: { desde: string; hasta: string },
): { desde: string; hasta: string } {
  switch (periodo) {
    case "hoy": {
      const iso = toISODate(hoy);
      return { desde: iso, hasta: iso };
    }
    case "ayer": {
      const iso = toISODate(sumarDias(hoy, -1));
      return { desde: iso, hasta: iso };
    }
    case "ultimos_7":
      return { desde: toISODate(sumarDias(hoy, -6)), hasta: toISODate(hoy) };
    case "ultimos_30":
      return { desde: toISODate(sumarDias(hoy, -29)), hasta: toISODate(hoy) };
    case "este_mes": {
      const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      return { desde: toISODate(inicio), hasta: toISODate(hoy) };
    }
    case "mes_anterior": {
      const inicio = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
      const fin = new Date(hoy.getFullYear(), hoy.getMonth(), 0);
      return { desde: toISODate(inicio), hasta: toISODate(fin) };
    }
    case "personalizado":
      if (!personalizado) throw new Error("Falta el rango personalizado.");
      return personalizado;
  }
}
