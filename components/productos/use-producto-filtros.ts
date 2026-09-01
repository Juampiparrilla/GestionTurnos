"use client";

import { useMemo, useState } from "react";
import { formatCantidad } from "@/lib/productos/formato-cantidad";
import { precioPorTrack } from "@/lib/productos/price-track";
import type { Producto } from "@/types/producto";

// Estado y lógica de los filtros de categoría/proveedor/marca/cantidad/
// oferta/precio, compartidos entre Productos, Reportes y Actualizar costos
// -- los tres filtran exactamente el mismo catálogo de la misma forma.
export function useProductoFiltros(productos: Producto[]) {
  const [categoriaIds, setCategoriaIds] = useState<string[]>([]);
  const [proveedorIds, setProveedorIds] = useState<string[]>([]);
  const [marcaIds, setMarcaIds] = useState<string[]>([]);
  const [cantidadFiltros, setCantidadFiltros] = useState<string[]>([]);
  const [ofertaFiltro, setOfertaFiltro] = useState("");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(0);

  // Se identifica por "kg|unidad_medida" y no solo por kg -- un producto de
  // 12 kg y uno de 12 unidades no son lo mismo, aunque el número coincida.
  const cantidadOptions = useMemo(() => {
    const claves = new Set(productos.map((p) => `${p.kg}|${p.unidad_medida}`));
    return Array.from(claves)
      .map((clave) => {
        const [kg, unidadMedida] = clave.split("|") as [string, "kg" | "unidad"];
        return { value: clave, label: formatCantidad(Number(kg), unidadMedida), kg: Number(kg) };
      })
      .sort((a, b) => a.kg - b.kg);
  }, [productos]);

  const hayFiltrosActivos =
    categoriaIds.length > 0 ||
    proveedorIds.length > 0 ||
    marcaIds.length > 0 ||
    cantidadFiltros.length > 0 ||
    ofertaFiltro !== "" ||
    minPrice !== 0 ||
    maxPrice !== 0;

  function limpiarFiltros() {
    setCategoriaIds([]);
    setProveedorIds([]);
    setMarcaIds([]);
    setCantidadFiltros([]);
    setOfertaFiltro("");
    setMinPrice(0);
    setMaxPrice(0);
  }

  const filtrados = useMemo(() => {
    return productos.filter((p) => {
      if (categoriaIds.length > 0 && !categoriaIds.includes(p.categoria_id ?? "")) return false;
      if (proveedorIds.length > 0 && !proveedorIds.includes(p.proveedor_id ?? "")) return false;
      if (marcaIds.length > 0 && !marcaIds.includes(p.marca_id ?? "")) return false;
      if (cantidadFiltros.length > 0 && !cantidadFiltros.includes(`${p.kg}|${p.unidad_medida}`)) return false;
      if (ofertaFiltro && p.oferta !== (ofertaFiltro === "true")) return false;
      const precio = precioPorTrack(p, "cerrada");
      if (minPrice && precio < minPrice) return false;
      if (maxPrice && precio > maxPrice) return false;
      return true;
    });
  }, [productos, categoriaIds, proveedorIds, marcaIds, cantidadFiltros, ofertaFiltro, minPrice, maxPrice]);

  return {
    categoriaIds,
    setCategoriaIds,
    proveedorIds,
    setProveedorIds,
    marcaIds,
    setMarcaIds,
    cantidadFiltros,
    setCantidadFiltros,
    ofertaFiltro,
    setOfertaFiltro,
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,
    cantidadOptions,
    hayFiltrosActivos,
    limpiarFiltros,
    filtrados,
  };
}
