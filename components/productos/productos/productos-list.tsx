"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SearchInput } from "@/components/productos/search-input";
import { MoneyInput } from "@/components/productos/money-input";
import { MultiSelectFilter } from "@/components/productos/multi-select-filter";
import { formatCantidad } from "@/lib/productos/formato-cantidad";
import { precioPorTrack } from "@/lib/productos/price-track";
import type { Marca } from "@/types/marca";
import type { Categoria } from "@/types/categoria";
import type { Proveedor } from "@/types/proveedor";
import type { Producto } from "@/types/producto";
import { ProductoRow } from "./producto-row";
import { CreateProductoSheet } from "./create-producto-sheet";

export function ProductosList({
  productos,
  marcas,
  categorias,
  proveedores,
  descripcion,
}: {
  productos: Producto[];
  marcas: Marca[];
  categorias: Categoria[];
  proveedores: Proveedor[];
  descripcion: string;
}) {
  const [items, setItems] = useState(productos);
  const [createOpen, setCreateOpen] = useState(false);
  const [query, setQuery] = useState("");

  const [filtrosOpen, setFiltrosOpen] = useState(false);
  const [categoriaIds, setCategoriaIds] = useState<string[]>([]);
  const [proveedorIds, setProveedorIds] = useState<string[]>([]);
  const [marcaIds, setMarcaIds] = useState<string[]>([]);
  const [cantidadFiltros, setCantidadFiltros] = useState<string[]>([]);
  const [ofertaFiltro, setOfertaFiltro] = useState("");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(0);

  const marcaPorId = new Map(marcas.map((m) => [m.id, m.nombre]));
  const categoriaPorId = new Map(categorias.map((c) => [c.id, c.nombre]));
  const proveedorPorId = new Map(proveedores.map((p) => [p.id, p.nombre]));

  const cantidadOptions = useMemo(() => {
    const claves = new Set(items.map((p) => `${p.kg}|${p.unidad_medida}`));
    return Array.from(claves)
      .map((clave) => {
        const [kg, unidadMedida] = clave.split("|") as [string, "kg" | "unidad"];
        return { value: clave, label: formatCantidad(Number(kg), unidadMedida), kg: Number(kg) };
      })
      .sort((a, b) => a.kg - b.kg);
  }, [items]);

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

  const filtrados = items.filter((p) => {
    if (!p.nombre.toLowerCase().includes(query.trim().toLowerCase())) return false;
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

  const nombresExistentes = Array.from(new Set(items.map((p) => p.nombre))).sort();

  function handleCreated(producto: Producto) {
    setItems((prev) => [...prev, producto].sort((a, b) => a.nombre.localeCompare(b.nombre)));
  }

  function handleUpdated(producto: Producto) {
    setItems((prev) => prev.map((p) => (p.id === producto.id ? producto : p)));
  }

  function handleDeleted(id: string) {
    setItems((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{descripcion}</p>
      <Button onClick={() => setCreateOpen(true)} className="w-full">
        + Crear producto
      </Button>
      <SearchInput value={query} onChange={setQuery} placeholder="Buscar producto..." />

      <Button
        type="button"
        variant="outline"
        className="w-full justify-between"
        onClick={() => setFiltrosOpen((v) => !v)}
      >
        <span>Aplicar filtros{hayFiltrosActivos ? " (activos)" : ""}</span>
        {filtrosOpen ? (
          <ChevronUp className="size-4" aria-hidden="true" />
        ) : (
          <ChevronDown className="size-4" aria-hidden="true" />
        )}
      </Button>

      {filtrosOpen && (
        <div className="flex flex-col gap-4 rounded-lg bg-muted/40 p-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Filtros</p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={limpiarFiltros}
              disabled={!hayFiltrosActivos}
              className="h-auto gap-1 px-2 py-1 text-muted-foreground"
            >
              <X className="size-3.5" aria-hidden="true" />
              Limpiar filtros
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="filtro-productos-categoria">Categoría</Label>
            <MultiSelectFilter
              id="filtro-productos-categoria"
              placeholder="Todas"
              options={categorias.map((c) => ({ value: c.id, label: c.nombre }))}
              selected={categoriaIds}
              onChange={setCategoriaIds}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="filtro-productos-proveedor">Proveedor</Label>
            <MultiSelectFilter
              id="filtro-productos-proveedor"
              placeholder="Todos"
              options={proveedores.map((p) => ({ value: p.id, label: p.nombre }))}
              selected={proveedorIds}
              onChange={setProveedorIds}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="filtro-productos-marca">Marca</Label>
            <MultiSelectFilter
              id="filtro-productos-marca"
              placeholder="Todas"
              options={marcas.map((m) => ({ value: m.id, label: m.nombre }))}
              selected={marcaIds}
              onChange={setMarcaIds}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="filtro-productos-cantidad">Cantidad</Label>
            <MultiSelectFilter
              id="filtro-productos-cantidad"
              placeholder="Todas"
              options={cantidadOptions}
              selected={cantidadFiltros}
              onChange={setCantidadFiltros}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="filtro-productos-oferta">Oferta</Label>
            <Select
              name="filtro-productos-oferta"
              value={ofertaFiltro}
              onValueChange={(v) => setOfertaFiltro(v ?? "")}
            >
              <SelectTrigger id="filtro-productos-oferta" className="w-full">
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
              <Label htmlFor="filtro-productos-min">Mayor a $ (bolsa cerrada)</Label>
              <MoneyInput id="filtro-productos-min" value={minPrice} onChange={setMinPrice} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="filtro-productos-max">Menor a $ (bolsa cerrada)</Label>
              <MoneyInput id="filtro-productos-max" value={maxPrice} onChange={setMaxPrice} />
            </div>
          </div>
        </div>
      )}

      {filtrados.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          {items.length === 0
            ? "Todavía no hay productos. Podés cargar uno a mano o importar un Excel."
            : "No se encontraron productos."}
        </div>
      ) : (
        <div className="grid gap-3">
          {filtrados.map((producto, index) => (
            <ProductoRow
              key={producto.id}
              producto={producto}
              numero={index + 1}
              marcaNombre={producto.marca_id ? (marcaPorId.get(producto.marca_id) ?? null) : null}
              categoriaNombre={producto.categoria_id ? (categoriaPorId.get(producto.categoria_id) ?? null) : null}
              proveedorNombre={producto.proveedor_id ? (proveedorPorId.get(producto.proveedor_id) ?? null) : null}
              marcas={marcas}
              categorias={categorias}
              proveedores={proveedores}
              nombresExistentes={nombresExistentes}
              onUpdated={handleUpdated}
              onDeleted={handleDeleted}
            />
          ))}
        </div>
      )}
      <CreateProductoSheet
        open={createOpen}
        onOpenChange={setCreateOpen}
        marcas={marcas}
        categorias={categorias}
        proveedores={proveedores}
        nombresExistentes={nombresExistentes}
        onCreated={handleCreated}
      />
    </div>
  );
}
