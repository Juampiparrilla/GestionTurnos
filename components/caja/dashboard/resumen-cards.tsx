import { formatMonto } from "@/lib/caja/formato-moneda";

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
  const cards = [
    { label: "Ingresos", valor: formatMonto(ingresos), className: "text-emerald-600" },
    { label: "Egresos", valor: formatMonto(egresos), className: "text-rose-600" },
    { label: "Balance", valor: formatMonto(balance), className: balance >= 0 ? "text-emerald-600" : "text-rose-600" },
    { label: "Promedio diario", valor: formatMonto(promedioDiario), className: "text-foreground" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map((card) => (
        <div key={card.label} className="rounded-lg border bg-background p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">{card.label}</p>
          <p className={`text-xl font-semibold ${card.className}`}>{card.valor}</p>
        </div>
      ))}
    </div>
  );
}
