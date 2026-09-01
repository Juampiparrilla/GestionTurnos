import jsPDF from "jspdf";
import autoTable, { __createTable, type CellInput, type RowInput } from "jspdf-autotable";
import type { Producto } from "@/types/producto";
import { PRICE_TRACK_LABELS, precioPorTrack, type PriceTrack } from "./price-track";
import { formatCantidad } from "./formato-cantidad";
import { formatFechaHoraArchivo } from "@/lib/format-date";

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
  | { modo: "cliente"; precioTracks: PriceTrack[]; agrupacion: Agrupacion; validoHasta: Date | null };

export type ContextoPdf = {
  marcaPorId: Map<string, string>;
  categoriaPorId: Map<string, string>;
  proveedorPorId: Map<string, string>;
  organization: { name: string; phone: string | null };
};

function dibujarMarcaDeAgua(doc: jsPDF, organization: ContextoPdf["organization"]) {
  // Solo el nombre -- el teléfono ya se muestra bien legible arriba de
  // cada hoja (ver datosOrganizacion más abajo), no hace falta repetirlo
  // acá. Concatenar los dos en un solo string rotado a 45° terminaba sin
  // entrar en la hoja con nombres largos, y separarlos en dos líneas se
  // veía raro (jsPDF no las apila bien cuando el texto está rotado).
  const texto = organization.name;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  doc.saveGraphicsState();
  doc.setGState(doc.GState({ opacity: 0.05 }));

  // Por las dudas con un nombre muy largo, se achica la fuente en
  // proporción si no entra en la hoja.
  const fontSizeMaximo = 28;
  doc.setFontSize(fontSizeMaximo);
  const anchoTexto = doc.getTextWidth(texto);
  const anchoDisponible = Math.min(pageWidth, pageHeight) * 0.85;
  const fontSize = anchoTexto > anchoDisponible ? fontSizeMaximo * (anchoDisponible / anchoTexto) : fontSizeMaximo;
  doc.setFontSize(fontSize);

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

// Exportada también para poder armar, en el test, las mismas filas que usa
// construirDocumentoPdf y así comparar anchos de columna contra un cálculo
// de referencia independiente.
export function filaProducto(p: Producto, contexto: ContextoPdf, opciones: OpcionesPdf): CellInput[] {
  const esPorUnidad = p.unidad_medida === "unidad";

  if (opciones.modo === "negocio") {
    return [
      p.nombre,
      formatCantidad(p.kg, p.unidad_medida),
      p.marca_id ? (contexto.marcaPorId.get(p.marca_id) ?? "") : "",
      p.proveedor_id ? (contexto.proveedorPorId.get(p.proveedor_id) ?? "") : "",
      currency(p.costo),
      currency(p.precio_venta_cerrada),
      esPorUnidad ? "-" : currency(p.precio_venta_abierta),
      currency(p.precio_venta_por_mayor),
      esPorUnidad ? "-" : currency(p.precio_por_kg),
      p.oferta ? "Sí" : "",
    ];
  }
  return [
    p.nombre,
    formatCantidad(p.kg, p.unidad_medida),
    ...opciones.precioTracks.map((track) =>
      esPorUnidad && track === "abierta" ? "-" : currency(precioPorTrack(p, track)),
    ),
  ];
}

// Exportado (además de usado internamente) para poder probar la
// paginación/anchos de columna en generar-pdf-reporte.test.ts sin pasar
// por generarPdfReporte, que llama a doc.save() (API de navegador).
export function construirDocumentoPdf(productos: Producto[], contexto: ContextoPdf, opciones: OpcionesPdf): jsPDF {
  const doc = new jsPDF({ orientation: "landscape" });
  const fecha = new Date().toLocaleDateString("es-AR");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  // Mismo margen por defecto que usa autoTable cuando no se le pasa `margin`
  // explícito, para que la cuenta de "cuánto lugar queda en la hoja" (más
  // abajo) coincida con lo que la librería va a usar en realidad.
  const margen = 40 / doc.internal.scaleFactor;

  doc.setFontSize(14);
  doc.text(opciones.modo === "negocio" ? "Reporte de productos" : "Lista de precios", 14, 15);
  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text(fecha, 14, 21);

  const datosOrganizacion = contexto.organization.phone
    ? `${contexto.organization.name} - ${contexto.organization.phone}`
    : contexto.organization.name;
  doc.text(datosOrganizacion, pageWidth - 14, 15, { align: "right" });

  let inicioTabla = 26;
  if (opciones.modo === "cliente" && opciones.validoHasta) {
    doc.text(`Precios válidos hasta el ${opciones.validoHasta.toLocaleDateString("es-AR")}`, 14, 27);
    inicioTabla = 32;
  }

  doc.setTextColor(0);

  const head: string[][] =
    opciones.modo === "negocio"
      ? [
          [
            "Nombre",
            "Cantidad",
            "Marca",
            "Proveedor",
            "Costo",
            "Cerrada",
            "Abierta",
            "Por mayor",
            "$/Kg",
            "Oferta",
          ],
        ]
      : [["Nombre", "Cantidad", ...opciones.precioTracks.map((track) => PRICE_TRACK_LABELS[track])]];

  const columnas = head[0].length;
  const grupos = agruparProductos(productos, opciones.agrupacion, contexto);

  // Los anchos de columna se calculan una sola vez a partir de TODO el
  // catálogo -- si cada llamada de autoTable de abajo (una por grupo) los
  // calculara por su cuenta según su propio contenido, terminan quedando
  // distintos entre un grupo y otro y las columnas se ven desalineadas.
  // __createTable solo arma y mide la tabla, no la dibuja.
  const tablaDeMedicion = __createTable(doc, {
    head,
    body: productos.map((p) => filaProducto(p, contexto, opciones)),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [24, 24, 27] },
  });
  const columnStyles = Object.fromEntries(
    tablaDeMedicion.columns.map((columna, indice) => [indice, { cellWidth: columna.width }]),
  );

  // Una llamada a autoTable por grupo (encadenadas por startY) en vez de
  // una sola con todas las filas: así, antes de empezar cada grupo, se
  // puede medir el lugar real que queda en la hoja (con doc.lastAutoTable,
  // no una estimación) y si no alcanza ni para el título del grupo ni para
  // al menos un producto debajo, se pasa a la hoja siguiente a mano --
  // evita que el título quede solo al pie de la hoja, como pasaba antes.
  const ESPACIO_MINIMO_GRUPO = 24;
  let cursorY = inicioTabla;
  let inicioDePagina = true;

  for (const grupo of grupos) {
    if (grupo.label !== null && !inicioDePagina) {
      const espacioRestante = pageHeight - margen - cursorY;
      if (espacioRestante < ESPACIO_MINIMO_GRUPO) {
        doc.addPage();
        cursorY = margen;
        inicioDePagina = true;
      }
    }

    const filas: RowInput[] = grupo.productos.map((p) => filaProducto(p, contexto, opciones));
    const body: RowInput[] =
      grupo.label === null
        ? filas
        : [
            [
              {
                content: grupo.label,
                colSpan: columnas,
                styles: { fontStyle: "bold", fillColor: [0, 0, 0], textColor: [255, 255, 255] },
              },
            ],
            ...filas,
          ];

    autoTable(doc, {
      // El encabezado de columnas ("Nombre", "Cantidad", ...) solo se repite
      // al arrancar una hoja nueva -- si se le pasara siempre, al continuar
      // un grupo en la misma hoja que el anterior aparecería una fila de
      // columnas de más, sin ningún salto de página que la justifique.
      head: inicioDePagina ? head : [],
      body,
      startY: cursorY,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [24, 24, 27] },
      columnStyles,
      didDrawPage: () => dibujarMarcaDeAgua(doc, contexto.organization),
    });

    cursorY = (doc as unknown as { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ?? cursorY;
    inicioDePagina = false;
  }

  return doc;
}

function nombreArchivoPdf(opciones: OpcionesPdf): string {
  const sufijo = opciones.modo === "negocio" ? "interno" : "cliente";
  return `reporte-productos-${sufijo}-${formatFechaHoraArchivo()}.pdf`;
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
