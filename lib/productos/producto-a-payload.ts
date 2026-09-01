import type { Producto } from "@/types/producto";

// Payload para PATCH /api/productos/[id]: mapea un Producto (fila de la
// base) al shape que espera updateProductoSchema. Se usa para reenviar un
// producto tal cual está y tocar solo el campo que hace falta (activar/
// desactivar, reasignar categoría o marca, etc.) sin repetir esta
// conversión en cada lugar.
export function productoAPayloadEdicion(producto: Producto, cambios: Record<string, unknown> = {}) {
  return {
    nombre: producto.nombre,
    marcaId: producto.marca_id ?? "",
    categoriaId: producto.categoria_id ?? "",
    proveedorId: producto.proveedor_id ?? "",
    descripcion: producto.descripcion ?? "",
    kg: producto.kg,
    unidadMedida: producto.unidad_medida,
    costo: producto.costo,
    porcentajeCerrada: producto.porcentaje_ganancia_cerrada,
    manualCerrada: producto.precio_manual_cerrada,
    precioManualCerrada: producto.precio_venta_cerrada,
    porcentajeAbierta: producto.porcentaje_ganancia_abierta,
    manualAbierta: producto.precio_manual_abierta,
    precioManualAbierta: producto.precio_venta_abierta,
    porcentajePorMayor: producto.porcentaje_ganancia_por_mayor,
    manualPorMayor: producto.precio_manual_por_mayor,
    precioManualPorMayor: producto.precio_venta_por_mayor,
    oferta: producto.oferta,
    active: producto.active,
    ...cambios,
  };
}
