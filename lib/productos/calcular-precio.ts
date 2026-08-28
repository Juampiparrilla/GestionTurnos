// Calcula precio y % final de una pista de precio (bolsa cerrada o bolsa
// abierta): si está marcada como manual, el precio ingresado manda y el %
// queda back-calculado solo a fines informativos (para que la pantalla de
// edición siempre pueda mostrar "esto equivale a un X% de ganancia"); si
// no, el precio se deriva del costo + %.
export function calcularPrecioVenta({
  costo,
  porcentaje,
  manual,
  precioManual,
}: {
  costo: number;
  porcentaje: number;
  manual: boolean;
  precioManual: number;
}): { precio: number; porcentaje: number } {
  if (manual) {
    const porcentajeEquivalente = costo > 0 ? redondear(((precioManual - costo) / costo) * 100) : 0;
    return { precio: redondear(precioManual), porcentaje: porcentajeEquivalente };
  }

  return { precio: redondear(costo * (1 + porcentaje / 100)), porcentaje };
}

function redondear(value: number): number {
  return Math.round(value * 100) / 100;
}
