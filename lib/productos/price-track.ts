import type { Producto } from "@/types/producto";

export type PriceTrack = "cerrada" | "abierta" | "por_mayor";

export const PRICE_TRACK_LABELS: Record<PriceTrack, string> = {
  cerrada: "Bolsa cerrada",
  abierta: "Bolsa abierta (por kg)",
  por_mayor: "Por mayor",
};

export function precioPorTrack(producto: Producto, track: PriceTrack): number {
  switch (track) {
    case "cerrada":
      return producto.precio_venta_cerrada;
    case "abierta":
      return producto.precio_venta_abierta;
    case "por_mayor":
      return producto.precio_venta_por_mayor;
  }
}
