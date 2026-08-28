"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  AGRUPACION_LABELS,
  compartirPdfReportePorWhatsApp,
  generarPdfReporte,
  type Agrupacion,
} from "@/lib/productos/generar-pdf-reporte";
import { PRICE_TRACK_LABELS, type PriceTrack } from "@/lib/productos/price-track";
import type { Producto } from "@/types/producto";
import type { Organization } from "@/types/organization";

type Modo = "negocio" | "cliente";

export function GenerarPdfSheet({
  open,
  onOpenChange,
  productos,
  precioTrackFiltro,
  marcaPorId,
  categoriaPorId,
  proveedorPorId,
  organization,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productos: Producto[];
  precioTrackFiltro: PriceTrack;
  marcaPorId: Map<string, string>;
  categoriaPorId: Map<string, string>;
  proveedorPorId: Map<string, string>;
  organization: Organization;
}) {
  const [modo, setModo] = useState<Modo>("negocio");
  const [precioTracks, setPrecioTracks] = useState<PriceTrack[]>([precioTrackFiltro]);
  const [agrupacion, setAgrupacion] = useState<Agrupacion>("ninguna");
  const [isSharing, setIsSharing] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);

  const opciones =
    modo === "negocio"
      ? ({ modo: "negocio", agrupacion } as const)
      : ({ modo: "cliente", precioTracks, agrupacion } as const);
  const sinPreciosElegidos = modo === "cliente" && precioTracks.length === 0;

  function toggleTrack(track: PriceTrack, checked: boolean) {
    setPrecioTracks((prev) => (checked ? [...prev, track] : prev.filter((t) => t !== track)));
  }

  function handleDescargar() {
    generarPdfReporte(
      productos,
      { marcaPorId, categoriaPorId, proveedorPorId, organization },
      opciones,
    );
    onOpenChange(false);
  }

  async function handleCompartir() {
    setShareError(null);
    setIsSharing(true);
    const resultado = await compartirPdfReportePorWhatsApp(
      productos,
      { marcaPorId, categoriaPorId, proveedorPorId, organization },
      opciones,
    );
    setIsSharing(false);
    if (!resultado.ok) {
      setShareError(resultado.error);
      return;
    }
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Generar PDF</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-4 px-4">
          <div className="space-y-2">
            <Label htmlFor="pdf-modo">Tipo de reporte</Label>
            <Select name="pdf-modo" value={modo} onValueChange={(v) => setModo((v as Modo) ?? "negocio")}>
              <SelectTrigger id="pdf-modo" className="w-full">
                <SelectValue>
                  {(v: Modo) => (v === "negocio" ? "Para el negocio (info completa)" : "Para cliente")}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="negocio">Para el negocio (info completa)</SelectItem>
                <SelectItem value="cliente">Para cliente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pdf-agrupacion">Agrupar por</Label>
            <Select
              name="pdf-agrupacion"
              value={agrupacion}
              onValueChange={(v) => setAgrupacion((v as Agrupacion) ?? "ninguna")}
            >
              <SelectTrigger id="pdf-agrupacion" className="w-full">
                <SelectValue>{(v: Agrupacion) => AGRUPACION_LABELS[v]}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(AGRUPACION_LABELS) as Agrupacion[]).map((valor) => (
                  <SelectItem key={valor} value={valor}>
                    {AGRUPACION_LABELS[valor]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {modo === "cliente" && (
            <div className="space-y-2">
              <Label>Precio a mostrar</Label>
              <div className="flex flex-col gap-2">
                {(Object.keys(PRICE_TRACK_LABELS) as PriceTrack[]).map((track) => (
                  <div key={track} className="flex items-center justify-between rounded-lg border p-3">
                    <Label htmlFor={`pdf-precio-${track}`}>{PRICE_TRACK_LABELS[track]}</Label>
                    <Switch
                      id={`pdf-precio-${track}`}
                      checked={precioTracks.includes(track)}
                      onCheckedChange={(checked) => toggleTrack(track, checked)}
                    />
                  </div>
                ))}
              </div>
              {sinPreciosElegidos && (
                <p className="text-sm text-destructive">Elegí al menos un precio para mostrar.</p>
              )}
            </div>
          )}

          <p className="text-sm text-muted-foreground">
            {productos.length} {productos.length === 1 ? "producto incluido" : "productos incluidos"}.
          </p>

          {shareError && (
            <p role="alert" className="text-sm text-destructive">
              {shareError}
            </p>
          )}
        </div>
        <SheetFooter className="px-0">
          <Button onClick={handleDescargar} disabled={productos.length === 0 || sinPreciosElegidos}>
            Descargar PDF
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleCompartir}
            disabled={productos.length === 0 || sinPreciosElegidos || isSharing}
          >
            <MessageCircle className="size-4" aria-hidden="true" />
            {isSharing ? "Preparando..." : "Compartir por WhatsApp"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
