import { describe, expect, it } from "vitest";
import jsPDF from "jspdf";
import { __createTable } from "jspdf-autotable";
import { construirDocumentoPdf, filaProducto, type ContextoPdf } from "@/lib/productos/generar-pdf-reporte";
import type { Producto } from "@/types/producto";

function producto(overrides: Partial<Producto>): Producto {
  return {
    id: overrides.id ?? "p1",
    organization_id: "org-1",
    nombre: "PRODUCTO",
    codigo: "PRODUCTO",
    marca_id: null,
    categoria_id: null,
    proveedor_id: null,
    descripcion: null,
    kg: 1,
    unidad_medida: "kg",
    costo: 1000,
    porcentaje_ganancia_cerrada: 30,
    precio_venta_cerrada: 1300,
    precio_manual_cerrada: false,
    porcentaje_ganancia_abierta: 30,
    precio_venta_abierta: 1300,
    precio_manual_abierta: false,
    porcentaje_ganancia_por_mayor: 20,
    precio_venta_por_mayor: 1200,
    precio_manual_por_mayor: false,
    precio_por_kg: 1300,
    oferta: false,
    active: true,
    created_by: null,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

const contexto: ContextoPdf = {
  marcaPorId: new Map([["m1", "ALIMENTO PARA PERRO CON UN NOMBRE DE MARCA MUCHO MAS LARGO QUE EL RESTO"]]),
  categoriaPorId: new Map(Array.from({ length: 40 }, (_, i) => [`cat-${i}`, `CATEGORIA ${i}`])),
  proveedorPorId: new Map([["prov1", "SAN CAYETANO"]]),
  organization: { name: "Forrajeria Magnolia", phone: "3816382515" },
};

// Muchos grupos chicos (de a 2 productos) para forzar varios saltos de
// página, con uno en el medio con una marca mucho más larga que el resto
// -- justo el escenario que rompía el ancho de columnas cuando cada grupo
// armaba su propia tabla de autoTable por separado (esa llamada calculaba
// un ancho de "Marca" distinto al de los demás grupos).
function catalogoDePrueba(): Producto[] {
  const productos: Producto[] = [];
  for (let grupo = 0; grupo < 40; grupo++) {
    const marcaId = grupo === 20 ? "m1" : `marca-${grupo}`;
    for (let fila = 0; fila < 2; fila++) {
      productos.push(
        producto({
          id: `p-${grupo}-${fila}`,
          nombre: `PRODUCTO ${grupo}-${fila}`,
          categoria_id: `cat-${grupo}`,
          marca_id: marcaId,
        }),
      );
    }
  }
  return productos;
}

const HEAD_NEGOCIO = [["Nombre", "Cantidad", "Marca", "Proveedor", "Costo", "Cerrada", "Abierta", "Por mayor", "$/Kg", "Oferta"]];

describe("construirDocumentoPdf", () => {
  it("genera varias hojas sin tirar error con muchos grupos", () => {
    const doc = construirDocumentoPdf(catalogoDePrueba(), contexto, { modo: "negocio", agrupacion: "categoria" });
    expect(doc.getNumberOfPages()).toBeGreaterThan(1);
  });

  it("no explota sin agrupar", () => {
    const doc = construirDocumentoPdf(catalogoDePrueba(), contexto, { modo: "negocio", agrupacion: "ninguna" });
    expect(doc.getNumberOfPages()).toBeGreaterThanOrEqual(1);
  });

  it("no explota en modo cliente con fecha de validez", () => {
    const doc = construirDocumentoPdf(catalogoDePrueba(), contexto, {
      modo: "cliente",
      agrupacion: "marca",
      precioTracks: ["cerrada", "por_mayor"],
      validoHasta: new Date("2026-12-31"),
    });
    expect(doc.getNumberOfPages()).toBeGreaterThan(1);
  });

  it("usa el mismo ancho de columna en todos los grupos, no el que le tocaría a cada uno por separado", () => {
    const productos = catalogoDePrueba();
    const opciones = { modo: "negocio" as const, agrupacion: "categoria" as const };

    const doc = construirDocumentoPdf(productos, contexto, opciones);
    // doc.lastAutoTable queda con la tabla del ÚLTIMO grupo dibujado (el
    // grupo 39, con marcas cortas) -- si no se hubiera forzado columnStyles,
    // esa llamada habría calculado su propio ancho de "Marca" en base a su
    // propio contenido, más angosto que el ancho de referencia de abajo.
    const anchoMarcaUltimoGrupo = (doc as unknown as { lastAutoTable: { columns: { width: number }[] } })
      .lastAutoTable.columns[2].width;

    // Ancho de referencia: el mismo cálculo que hace construirDocumentoPdf
    // a partir de TODO el catálogo (incluye la marca larga del grupo 20).
    const docDeReferencia = new jsPDF({ orientation: "landscape" });
    const tablaDeReferencia = __createTable(docDeReferencia, {
      head: HEAD_NEGOCIO,
      body: productos.map((p) => filaProducto(p, contexto, opciones)),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [24, 24, 27] },
    });

    expect(anchoMarcaUltimoGrupo).toBeCloseTo(tablaDeReferencia.columns[2].width, 5);
  });
});
