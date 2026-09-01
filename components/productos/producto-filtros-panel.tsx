"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MoneyInput } from "@/components/productos/money-input";
import { MultiSelectFilter } from "@/components/productos/multi-select-filter";
import type { Marca } from "@/types/marca";
import type { Categoria } from "@/types/categoria";
import type { Proveedor } from "@/types/proveedor";
import type { useProductoFiltros } from "./use-producto-filtros";

// Contenido de los filtros compartidos (categoría/proveedor/marca/cantidad/
// oferta/precio); cada pantalla decide cómo envolverlo (siempre visible en
// Reportes, colapsable en Productos y Actualizar costos).
export function ProductoFiltrosPanel({
  idPrefix,
  marcas,
  categorias,
  proveedores,
  filtros,
}: {
  idPrefix: string;
  marcas: Marca[];
  categorias: Categoria[];
  proveedores: Proveedor[];
  filtros: ReturnType<typeof useProductoFiltros>;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-lg bg-muted/40 p-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Filtros</p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={filtros.limpiarFiltros}
          disabled={!filtros.hayFiltrosActivos}
          className="h-auto gap-1 px-2 py-1 text-muted-foreground"
        >
          <X className="size-3.5" aria-hidden="true" />
          Limpiar filtros
        </Button>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-categoria`}>Categoría</Label>
        <MultiSelectFilter
          id={`${idPrefix}-categoria`}
          placeholder="Todas"
          options={categorias.map((c) => ({ value: c.id, label: c.nombre }))}
          selected={filtros.categoriaIds}
          onChange={filtros.setCategoriaIds}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-proveedor`}>Proveedor</Label>
        <MultiSelectFilter
          id={`${idPrefix}-proveedor`}
          placeholder="Todos"
          options={proveedores.map((p) => ({ value: p.id, label: p.nombre }))}
          selected={filtros.proveedorIds}
          onChange={filtros.setProveedorIds}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-marca`}>Marca</Label>
        <MultiSelectFilter
          id={`${idPrefix}-marca`}
          placeholder="Todas"
          options={marcas.map((m) => ({ value: m.id, label: m.nombre }))}
          selected={filtros.marcaIds}
          onChange={filtros.setMarcaIds}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-cantidad`}>Cantidad</Label>
        <MultiSelectFilter
          id={`${idPrefix}-cantidad`}
          placeholder="Todas"
          options={filtros.cantidadOptions}
          selected={filtros.cantidadFiltros}
          onChange={filtros.setCantidadFiltros}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-oferta`}>Oferta</Label>
        <Select
          name={`${idPrefix}-oferta`}
          value={filtros.ofertaFiltro}
          onValueChange={(v) => filtros.setOfertaFiltro(v ?? "")}
        >
          <SelectTrigger id={`${idPrefix}-oferta`} className="w-full">
            <SelectValue>
              {(v: string) => (v === "true" ? "Solo en oferta" : v === "false" ? "Sin oferta" : "Todos")}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos</SelectItem>
            <SelectItem value="true">Solo en oferta</SelectItem>
            <SelectItem value="false">Sin oferta</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-min`}>Mayor a $ (bolsa cerrada)</Label>
          <MoneyInput id={`${idPrefix}-min`} value={filtros.minPrice} onChange={filtros.setMinPrice} />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-max`}>Menor a $ (bolsa cerrada)</Label>
          <MoneyInput id={`${idPrefix}-max`} value={filtros.maxPrice} onChange={filtros.setMaxPrice} />
        </div>
      </div>
    </div>
  );
}
