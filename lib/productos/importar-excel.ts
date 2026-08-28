// Columnas de la plantilla de importación de productos, compartidas entre
// quien genera el .xlsx (GET /api/productos/import/plantilla) y quien lo
// parsea de vuelta (POST /api/productos/import) -- si se cambia una acá,
// cambia en los dos lugares a la vez.
export const IMPORT_COLUMNAS = [
  { header: "Nombre", key: "nombre", width: 45 },
  { header: "Cantidad", key: "kg", width: 10 },
  { header: "Unidad de medida (kg o unidad)", key: "unidadMedida", width: 26 },
  { header: "Marca", key: "marca", width: 20 },
  { header: "Categoría", key: "categoria", width: 32 },
  { header: "Proveedor", key: "proveedor", width: 20 },
  { header: "Costo", key: "costo", width: 12 },
  { header: "% Bolsa cerrada", key: "porcentajeCerrada", width: 16 },
  { header: "% Bolsa abierta", key: "porcentajeAbierta", width: 16 },
  { header: "% Por mayor", key: "porcentajePorMayor", width: 14 },
] as const;

export type ImportColumnaKey = (typeof IMPORT_COLUMNAS)[number]["key"];
