export function formatCantidad(cantidad: number, unidadMedida: "kg" | "unidad"): string {
  return unidadMedida === "kg" ? `${cantidad} kg` : `${cantidad} un.`;
}
