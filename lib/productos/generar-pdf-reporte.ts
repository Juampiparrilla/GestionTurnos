import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Producto } from "@/types/producto";
import { PRICE_TRACK_LABELS, precioPorTrack, type PriceTrack } from "./price-track";

const currency = (value: number) => `$${value.toLocaleString("es-AR")}`;

export type OpcionesPdf = { modo: "negocio" } | { modo: "cliente"; precioTrack: PriceTrack };

type ContextoPdf = {
  marcaPorId: Map<string, string>;
  categoriaPorId: Map<string, string>;
  proveedorPorId: Map<string, string>;
};

function construirDocumentoPdf(productos: Producto[], contexto: ContextoPdf, opciones: OpcionesPdf): jsPDF {
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

  return doc;
}

function nombreArchivoPdf(opciones: OpcionesPdf): string {
  const sufijo = opciones.modo === "negocio" ? "interno" : "cliente";
  return `reporte-productos-${sufijo}-${Date.now()}.pdf`;
}

export function generarPdfReporte(productos: Producto[], contexto: ContextoPdf, opciones: OpcionesPdf) {
  const doc = construirDocumentoPdf(productos, contexto, opciones);
  doc.save(nombreArchivoPdf(opciones));
}

// El wa.me/?text= que usa lib/invitations/share.ts solo sirve para texto --
// para adjuntar el PDF en sí hace falta el share sheet nativo del sistema
// operativo (Web Share API con `files`), que solo funciona en navegadores
// móviles y requiere gesto del usuario. Sin soporte en desktop.
export async function compartirPdfReportePorWhatsApp(
  productos: Producto[],
  contexto: ContextoPdf,
  opciones: OpcionesPdf,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const doc = construirDocumentoPdf(productos, contexto, opciones);
  const file = new File([doc.output("blob")], nombreArchivoPdf(opciones), { type: "application/pdf" });

  if (!navigator.canShare?.({ files: [file] })) {
    return {
      ok: false,
      error: "Tu navegador no permite compartir archivos directamente. Descargá el PDF y compartilo manualmente.",
    };
  }

  try {
    await navigator.share({
      files: [file],
      title: opciones.modo === "negocio" ? "Reporte de productos" : "Lista de precios",
    });
    return { ok: true };
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      return { ok: true };
    }
    return { ok: false, error: "No se pudo compartir el PDF." };
  }
}
