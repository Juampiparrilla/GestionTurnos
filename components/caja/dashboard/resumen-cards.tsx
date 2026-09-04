import { formatMonto } from "@/lib/caja/formato-moneda";

// El Balance es el número que más importa de un vistazo (¿el día/período dio
// positivo o negativo?), así que va como "hero" grande arriba; el resto son
// datos de apoyo en una fila más chica debajo -- antes las 4 tarjetas
// competían con el mismo peso visual y no había forma de leer la pantalla
// rápido sin leer las cuatro.
export function ResumenCards({
  ingresos,
  egresos,
  balance,
  promedioDiario,
}: {
  ingresos: number;
  egresos: number;
  balance: number;
  promedioDiario: number;
}) {
  const secundarias = [
    { label: "Ingresos", valor: formatMonto(ingresos), className: "text-emerald-600" },
    { label: "Egresos", valor: formatMonto(egresos), className: "text-rose-600" },
    { label: "Promedio diario", valor: formatMonto(promedioDiario), className: "text-foreground" },
  ];

  return (
    <div className="space-y-3">
      <div className="rounded-lg border bg-background p-5 text-center shadow-sm">
        <p className="text-sm text-muted-foreground">Balance</p>
        <p className={`text-4xl font-bold ${balance >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
          {formatMonto(balance)}
        </p>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {secundarias.map((card) => (
          <div key={card.label} className="rounded-lg border bg-background p-3 shadow-sm">
            <p className="text-xs text-muted-foreground">{card.label}</p>
            <p className={`text-sm font-semibold ${card.className}`}>{card.valor}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
