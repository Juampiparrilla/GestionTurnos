"use client";

import { useMemo, useState } from "react";
import { FileDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MoneyInput } from "@/components/productos/money-input";
import { precioPorTrack } from "@/lib/productos/price-track";
import { formatCantidad } from "@/lib/productos/formato-cantidad";
import type { Marca } from "@/types/marca";
import type { Categoria } from "@/types/categoria";
import type { Proveedor } from "@/types/proveedor";
import type { Producto } from "@/types/producto";
import type { Organization } from "@/types/organization";
import { GenerarPdfSheet } from "./generar-pdf-sheet";
import { MultiSelectFilter } from "./multi-select-filter";
import { OrganizationContactCard } from "./organization-contact-card";
import { ReporteProductoRow } from "./reporte-producto-row";

export function ReportesView({
  productos,
  marcas,
  categorias,
  proveedores,
  organization: organizationProp,
  descripcion,
}: {
  productos: Producto[];
  marcas: Marca[];
  categorias: Categoria[];
  proveedores: Proveedor[];
  organization: Organization;
  descripcion: string;
}) {
  const [organization, setOrganization] = useState(organizationProp);
  const [categoriaIds, setCategoriaIds] = useState<string[]>([]);
  const [proveedorIds, setProveedorIds] = useState<string[]>([]);
  const [marcaIds, setMarcaIds] = useState<string[]>([]);
  const [cantidadFiltros, setCantidadFiltros] = useState<string[]>([]);
  const [ofertaFiltro, setOfertaFiltro] = useState("");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(0);
  const [pdfOpen, setPdfOpen] = useState(false);

  const marcaPorId = new Map(marcas.map((m) => [m.id, m.nombre]));
  const categoriaPorId = new Map(categorias.map((c) => [c.id, c.nombre]));
  const proveedorPorId = new Map(proveedores.map((p) => [p.id, p.nombre]));

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
      // El rango de precio siempre compara contra la bolsa cerrada -- el
      // selector de qué precio usar (igual al de "Precio a mostrar" del PDF)
      // resultaba confuso acá, se sacó de la UI.
      const precio = precioPorTrack(p, "cerrada");
      if (minPrice && precio < minPrice) return false;
      if (maxPrice && precio > maxPrice) return false;
      return true;
    });
  }, [productos, categoriaIds, proveedorIds, marcaIds, cantidadFiltros, ofertaFiltro, minPrice, maxPrice]);

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{descripcion}</p>

      <OrganizationContactCard organization={organization} onUpdated={setOrganization} />

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
          <Label htmlFor="filtro-categoria">Categoría</Label>
          <MultiSelectFilter
            id="filtro-categoria"
            placeholder="Todas"
            options={categorias.map((c) => ({ value: c.id, label: c.nombre }))}
            selected={categoriaIds}
            onChange={setCategoriaIds}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="filtro-proveedor">Proveedor</Label>
          <MultiSelectFilter
            id="filtro-proveedor"
            placeholder="Todos"
            options={proveedores.map((p) => ({ value: p.id, label: p.nombre }))}
            selected={proveedorIds}
            onChange={setProveedorIds}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="filtro-marca">Marca</Label>
          <MultiSelectFilter
            id="filtro-marca"
            placeholder="Todas"
            options={marcas.map((m) => ({ value: m.id, label: m.nombre }))}
            selected={marcaIds}
            onChange={setMarcaIds}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="filtro-cantidad">Cantidad</Label>
          <MultiSelectFilter
            id="filtro-cantidad"
            placeholder="Todas"
            options={cantidadOptions}
            selected={cantidadFiltros}
            onChange={setCantidadFiltros}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="filtro-oferta">Oferta</Label>
          <Select name="filtro-oferta" value={ofertaFiltro} onValueChange={(v) => setOfertaFiltro(v ?? "")}>
            <SelectTrigger id="filtro-oferta" className="w-full">
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
            <Label htmlFor="filtro-min">Mayor a $ (bolsa cerrada)</Label>
            <MoneyInput id="filtro-min" value={minPrice} onChange={setMinPrice} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="filtro-max">Menor a $ (bolsa cerrada)</Label>
            <MoneyInput id="filtro-max" value={maxPrice} onChange={setMaxPrice} />
          </div>
        </div>
      </div>

      <Button onClick={() => setPdfOpen(true)} className="w-full" disabled={filtrados.length === 0}>
        <FileDown className="size-4" aria-hidden="true" />
        Generar PDF ({filtrados.length})
      </Button>

      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          {filtrados.length} {filtrados.length === 1 ? "producto encontrado" : "productos encontrados"}
        </p>
        {filtrados.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
            No se encontraron productos con estos filtros.
          </div>
        ) : (
          <div className="grid gap-2">
            {filtrados.map((producto, index) => (
              <ReporteProductoRow
                key={producto.id}
                producto={producto}
                numero={index + 1}
                marcaNombre={producto.marca_id ? (marcaPorId.get(producto.marca_id) ?? null) : null}
                categoriaNombre={producto.categoria_id ? (categoriaPorId.get(producto.categoria_id) ?? null) : null}
                proveedorNombre={producto.proveedor_id ? (proveedorPorId.get(producto.proveedor_id) ?? null) : null}
              />
            ))}
          </div>
        )}
      </div>

      <GenerarPdfSheet
        open={pdfOpen}
        onOpenChange={setPdfOpen}
        productos={filtrados}
        precioTrackFiltro="cerrada"
        marcaPorId={marcaPorId}
        categoriaPorId={categoriaPorId}
        proveedorPorId={proveedorPorId}
        organization={organization}
      />
    </div>
  );
}
