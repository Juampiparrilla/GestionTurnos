// Mismo criterio de formato que ya usa MoneyInput (es-AR, punto de miles)
// pero solo para mostrar -- sin decimales, porque en Caja los montos que
// carga el usuario son siempre pesos enteros.
export function formatMonto(value: number) {
  return `$ ${Math.round(value).toLocaleString("es-AR")}`;
}
