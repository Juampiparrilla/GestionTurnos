import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Producto } from "@/types/producto";
import { PRICE_TRACK_LABELS, precioPorTrack, type PriceTrack } from "./price-track";

const currency = (value: number) => `$${value.toLocaleString("es-AR")}`;

export type OpcionesPdf = { modo: "negocio" } | { modo: "cliente"; precioTrack: PriceTrack };

export function generarPdfReporte(
  productos: Producto[],
  contexto: {
    marcaPorId: Map<string, string>;
    categoriaPorId: Map<string, string>;
    proveedorPorId: Map<string, string>;
  },
  opciones: OpcionesPdf,
) {
  const doc = new jsPDF();
  const fecha = new Date().toLocaleDateString("es-AR");

  doc.setFontSize(14);
  doc.text(opciones.modo === "negocio" ? "Reporte de productos" : "Lista de precios", 14, 15);
  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text(fecha, 14, 21);
  doc.setTextColor(0);

  let head: string[][];
  let body: (string | number)[][];

  if (opciones.modo === "negocio") {
    head = [
      ["Nombre", "Kg", "Marca", "Categoría", "Proveedor", "Costo", "Cerrada", "Abierta", "Por mayor", "$/Kg", "Oferta"],
    ];
    body = productos.map((p) => [
      p.nombre,
      p.kg,
      p.marca_id ? (contexto.marcaPorId.get(p.marca_id) ?? "") : "",
      p.categoria_id ? (contexto.categoriaPorId.get(p.categoria_id) ?? "") : "",
      p.proveedor_id ? (contexto.proveedorPorId.get(p.proveedor_id) ?? "") : "",
      currency(p.costo),
      currency(p.precio_venta_cerrada),
      currency(p.precio_venta_abierta),
      currency(p.precio_venta_por_mayor),
      currency(p.precio_por_kg),
      p.oferta ? "Sí" : "",
    ]);
  } else {
    head = [["Nombre", "Kg", PRICE_TRACK_LABELS[opciones.precioTrack]]];
    body = productos.map((p) => [p.nombre, p.kg, currency(precioPorTrack(p, opciones.precioTrack))]);
  }

  autoTable(doc, {
    head,
    body,
    startY: 26,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [24, 24, 27] },
  });

  const sufijo = opciones.modo === "negocio" ? "interno" : "cliente";
  doc.save(`reporte-productos-${sufijo}-${Date.now()}.pdf`);
}
