"use client";

import { useState } from "react";
import { FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Marca } from "@/types/marca";
import type { Categoria } from "@/types/categoria";
import type { Proveedor } from "@/types/proveedor";
import type { Producto } from "@/types/producto";
import type { Organization } from "@/types/organization";
import { GenerarPdfSheet } from "./generar-pdf-sheet";
import { useProductoFiltros } from "@/components/productos/use-producto-filtros";
import { ProductoFiltrosPanel } from "@/components/productos/producto-filtros-panel";
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
  const [pdfOpen, setPdfOpen] = useState(false);
  const filtros = useProductoFiltros(productos);
  const { filtrados } = filtros;

  const marcaPorId = new Map(marcas.map((m) => [m.id, m.nombre]));
  const categoriaPorId = new Map(categorias.map((c) => [c.id, c.nombre]));
  const proveedorPorId = new Map(proveedores.map((p) => [p.id, p.nombre]));

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{descripcion}</p>

      <OrganizationContactCard organization={organization} onUpdated={setOrganization} />

      <ProductoFiltrosPanel
        idPrefix="filtro"
        marcas={marcas}
        categorias={categorias}
        proveedores={proveedores}
        filtros={filtros}
      />

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
