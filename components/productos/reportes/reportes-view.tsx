"use client";

import { useMemo, useState } from "react";
import { BadgePercent, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MoneyInput } from "@/components/productos/money-input";
import { PRICE_TRACK_LABELS, precioPorTrack, type PriceTrack } from "@/lib/productos/price-track";
import type { Marca } from "@/types/marca";
import type { Categoria } from "@/types/categoria";
import type { Proveedor } from "@/types/proveedor";
import type { Producto } from "@/types/producto";
import { GenerarPdfSheet } from "./generar-pdf-sheet";

const currency = (value: number) => `$${value.toLocaleString("es-AR")}`;

export function ReportesView({
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
  const [categoriaId, setCategoriaId] = useState("");
  const [proveedorId, setProveedorId] = useState("");
  const [marcaId, setMarcaId] = useState("");
  const [kgFiltro, setKgFiltro] = useState("");
  const [ofertaFiltro, setOfertaFiltro] = useState("");
  const [precioTrack, setPrecioTrack] = useState<PriceTrack>("cerrada");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(0);
  const [pdfOpen, setPdfOpen] = useState(false);

  const marcaPorId = new Map(marcas.map((m) => [m.id, m.nombre]));
  const categoriaPorId = new Map(categorias.map((c) => [c.id, c.nombre]));
  const proveedorPorId = new Map(proveedores.map((p) => [p.id, p.nombre]));

  const kgOptions = useMemo(
    () => Array.from(new Set(productos.map((p) => p.kg))).sort((a, b) => a - b),
    [productos],
  );

  const filtrados = useMemo(() => {
    return productos.filter((p) => {
      if (categoriaId && p.categoria_id !== categoriaId) return false;
      if (proveedorId && p.proveedor_id !== proveedorId) return false;
      if (marcaId && p.marca_id !== marcaId) return false;
      if (kgFiltro && p.kg !== Number(kgFiltro)) return false;
      if (ofertaFiltro && p.oferta !== (ofertaFiltro === "true")) return false;
      const precio = precioPorTrack(p, precioTrack);
      if (minPrice && precio < minPrice) return false;
      if (maxPrice && precio > maxPrice) return false;
      return true;
    });
  }, [productos, categoriaId, proveedorId, marcaId, kgFiltro, ofertaFiltro, precioTrack, minPrice, maxPrice]);

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{descripcion}</p>

      <div className="flex flex-col gap-4 rounded-lg bg-muted/40 p-3">
        <div className="space-y-2">
          <Label htmlFor="filtro-categoria">Categoría</Label>
          <Select name="filtro-categoria" value={categoriaId} onValueChange={(v) => setCategoriaId(v ?? "")}>
            <SelectTrigger id="filtro-categoria" className="w-full">
              <SelectValue>
                {(id: string) => (id ? (categorias.find((c) => c.id === id)?.nombre ?? "Todas") : "Todas")}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas</SelectItem>
              {categorias.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="filtro-proveedor">Proveedor</Label>
          <Select name="filtro-proveedor" value={proveedorId} onValueChange={(v) => setProveedorId(v ?? "")}>
            <SelectTrigger id="filtro-proveedor" className="w-full">
              <SelectValue>
                {(id: string) => (id ? (proveedores.find((p) => p.id === id)?.nombre ?? "Todos") : "Todos")}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              {proveedores.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="filtro-marca">Marca</Label>
          <Select name="filtro-marca" value={marcaId} onValueChange={(v) => setMarcaId(v ?? "")}>
            <SelectTrigger id="filtro-marca" className="w-full">
              <SelectValue>
                {(id: string) => (id ? (marcas.find((m) => m.id === id)?.nombre ?? "Todas") : "Todas")}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas</SelectItem>
              {marcas.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="filtro-kg">Kg de la bolsa</Label>
          <Select name="filtro-kg" value={kgFiltro} onValueChange={(v) => setKgFiltro(v ?? "")}>
            <SelectTrigger id="filtro-kg" className="w-full">
              <SelectValue>{(v: string) => (v ? `${v} kg` : "Todos")}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              {kgOptions.map((kg) => (
                <SelectItem key={kg} value={String(kg)}>
                  {kg} kg
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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

        <div className="space-y-2">
          <Label htmlFor="filtro-precio-track">Precio a filtrar</Label>
          <Select
            name="filtro-precio-track"
            value={precioTrack}
            onValueChange={(v) => setPrecioTrack((v as PriceTrack) ?? "cerrada")}
          >
            <SelectTrigger id="filtro-precio-track" className="w-full">
              <SelectValue>{(v: PriceTrack) => PRICE_TRACK_LABELS[v]}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(PRICE_TRACK_LABELS) as PriceTrack[]).map((track) => (
                <SelectItem key={track} value={track}>
                  {PRICE_TRACK_LABELS[track]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="filtro-min">Mayor a $</Label>
            <MoneyInput id="filtro-min" value={minPrice} onChange={setMinPrice} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="filtro-max">Menor a $</Label>
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
              <div key={producto.id} className="min-w-0 rounded-lg border bg-background p-3 shadow-sm">
                <p className="flex items-center gap-1.5 font-medium break-words">
                  <span>
                    {index + 1}. {producto.nombre} · {producto.kg} kg
                  </span>
                  {producto.oferta && (
                    <span title="En oferta">
                      <BadgePercent className="size-4 shrink-0 text-amber-600" aria-label="En oferta" />
                    </span>
                  )}
                </p>
                <p className="text-sm text-muted-foreground">
                  {PRICE_TRACK_LABELS[precioTrack]}: {currency(precioPorTrack(producto, precioTrack))}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <GenerarPdfSheet
        open={pdfOpen}
        onOpenChange={setPdfOpen}
        productos={filtrados}
        precioTrackFiltro={precioTrack}
        marcaPorId={marcaPorId}
        categoriaPorId={categoriaPorId}
        proveedorPorId={proveedorPorId}
      />
    </div>
  );
}
