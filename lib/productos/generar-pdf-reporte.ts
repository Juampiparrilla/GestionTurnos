import jsPDF from "jspdf";
import autoTable, { type CellInput, type RowInput } from "jspdf-autotable";
import type { Producto } from "@/types/producto";
import { PRICE_TRACK_LABELS, precioPorTrack, type PriceTrack } from "./price-track";

const currency = (value: number) => `$${value.toLocaleString("es-AR")}`;

export type Agrupacion = "ninguna" | "categoria" | "marca" | "proveedor";

export const AGRUPACION_LABELS: Record<Agrupacion, string> = {
  ninguna: "Sin agrupar",
  categoria: "Categoría",
  marca: "Marca",
  proveedor: "Proveedor",
};

export type OpcionesPdf =
  | { modo: "negocio"; agrupacion: Agrupacion }
  | { modo: "cliente"; precioTracks: PriceTrack[]; agrupacion: Agrupacion };

type ContextoPdf = {
  marcaPorId: Map<string, string>;
  categoriaPorId: Map<string, string>;
  proveedorPorId: Map<string, string>;
  organization: { name: string; phone: string | null };
};

function dibujarMarcaDeAgua(doc: jsPDF, organization: ContextoPdf["organization"]) {
  const texto = organization.phone ? `${organization.name} - ${organization.phone}` : organization.name;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  doc.saveGraphicsState();
  doc.setGState(doc.GState({ opacity: 0.08 }));
  doc.setFontSize(28);
  doc.setTextColor(24, 24, 27);
  doc.text(texto, pageWidth / 2, pageHeight / 2, { angle: 45, align: "center" });
  doc.restoreGraphicsState();
  doc.setTextColor(0);
}

function grupoDeProducto(p: Producto, agrupacion: Agrupacion, contexto: ContextoPdf): string {
  switch (agrupacion) {
    case "categoria":
      return (p.categoria_id ? contexto.categoriaPorId.get(p.categoria_id) : null) ?? "Sin categoría";
    case "marca":
      return (p.marca_id ? contexto.marcaPorId.get(p.marca_id) : null) ?? "Sin marca";
    case "proveedor":
      return (p.proveedor_id ? contexto.proveedorPorId.get(p.proveedor_id) : null) ?? "Sin proveedor";
    case "ninguna":
      return "";
  }
}

function agruparProductos(
  productos: Producto[],
  agrupacion: Agrupacion,
  contexto: ContextoPdf,
): { label: string | null; productos: Producto[] }[] {
  if (agrupacion === "ninguna") {
    return [{ label: null, productos }];
  }

  const grupos = new Map<string, Producto[]>();
  for (const p of productos) {
    const label = grupoDeProducto(p, agrupacion, contexto);
    grupos.set(label, [...(grupos.get(label) ?? []), p]);
  }

  return Array.from(grupos.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([label, productos]) => ({ label, productos }));
}

function filaProducto(p: Producto, contexto: ContextoPdf, opciones: OpcionesPdf): CellInput[] {
  if (opciones.modo === "negocio") {
    return [
      p.nombre,
      p.codigo ?? "",
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
    ];
  }
  return [
    p.nombre,
    p.codigo ?? "",
    p.kg,
    ...opciones.precioTracks.map((track) => currency(precioPorTrack(p, track))),
  ];
}

function construirDocumentoPdf(productos: Producto[], contexto: ContextoPdf, opciones: OpcionesPdf): jsPDF {
  const doc = new jsPDF();
  const fecha = new Date().toLocaleDateString("es-AR");

  doc.setFontSize(14);
  doc.text(opciones.modo === "negocio" ? "Reporte de productos" : "Lista de precios", 14, 15);
  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text(fecha, 14, 21);
  doc.setTextColor(0);

  const head: string[][] =
    opciones.modo === "negocio"
      ? [
          [
            "Nombre",
            "Código",
            "Kg",
            "Marca",
            "Categoría",
            "Proveedor",
            "Costo",
            "Cerrada",
            "Abierta",
            "Por mayor",
            "$/Kg",
            "Oferta",
          ],
        ]
      : [["Nombre", "Código", "Kg", ...opciones.precioTracks.map((track) => PRICE_TRACK_LABELS[track])]];

  const columnas = head[0].length;
  const grupos = agruparProductos(productos, opciones.agrupacion, contexto);

  const body: RowInput[] = grupos.flatMap((grupo) => {
    const filas: RowInput[] = grupo.productos.map((p) => filaProducto(p, contexto, opciones));
    if (grupo.label === null) return filas;
    const encabezado: RowInput = [
      { content: grupo.label, colSpan: columnas, styles: { fontStyle: "bold", fillColor: [244, 244, 245] } },
    ];
    return [encabezado, ...filas];
  });

  autoTable(doc, {
    head,
    body,
    startY: 26,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [24, 24, 27] },
    didDrawPage: () => dibujarMarcaDeAgua(doc, contexto.organization),
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
