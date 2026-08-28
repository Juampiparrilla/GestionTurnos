"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { compartirPdfReportePorWhatsApp, generarPdfReporte } from "@/lib/productos/generar-pdf-reporte";
import { PRICE_TRACK_LABELS, type PriceTrack } from "@/lib/productos/price-track";
import type { Producto } from "@/types/producto";

type Modo = "negocio" | "cliente";

export function GenerarPdfSheet({
  open,
  onOpenChange,
  productos,
  precioTrackFiltro,
  marcaPorId,
  categoriaPorId,
  proveedorPorId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productos: Producto[];
  precioTrackFiltro: PriceTrack;
  marcaPorId: Map<string, string>;
  categoriaPorId: Map<string, string>;
  proveedorPorId: Map<string, string>;
}) {
  const [modo, setModo] = useState<Modo>("negocio");
  const [precioTrack, setPrecioTrack] = useState<PriceTrack>(precioTrackFiltro);
  const [isSharing, setIsSharing] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);

  const opciones = modo === "negocio" ? ({ modo: "negocio" } as const) : ({ modo: "cliente", precioTrack } as const);

  function handleDescargar() {
    generarPdfReporte(productos, { marcaPorId, categoriaPorId, proveedorPorId }, opciones);
    onOpenChange(false);
  }

  async function handleCompartir() {
    setShareError(null);
    setIsSharing(true);
    const resultado = await compartirPdfReportePorWhatsApp(
      productos,
      { marcaPorId, categoriaPorId, proveedorPorId },
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

          {modo === "cliente" && (
            <div className="space-y-2">
              <Label htmlFor="pdf-precio">Precio a mostrar</Label>
              <Select
                name="pdf-precio"
                value={precioTrack}
                onValueChange={(v) => setPrecioTrack((v as PriceTrack) ?? "cerrada")}
              >
                <SelectTrigger id="pdf-precio" className="w-full">
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
          <Button onClick={handleDescargar} disabled={productos.length === 0}>
            Descargar PDF
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleCompartir}
            disabled={productos.length === 0 || isSharing}
          >
            <MessageCircle className="size-4" aria-hidden="true" />
            {isSharing ? "Preparando..." : "Compartir por WhatsApp"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
