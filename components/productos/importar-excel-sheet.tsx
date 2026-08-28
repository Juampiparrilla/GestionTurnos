"use client";

import { useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { Download, FileSpreadsheet } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { PendingOverlay } from "@/components/pending-overlay";
import { cn } from "@/lib/utils";

type ResultadoImportacion = {
  creados: number;
  errores: { fila: number; mensaje: string }[];
};

export function ImportarExcelSheet() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<ResultadoImportacion | null>(null);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      setError(null);
      setResultado(null);
    }
  }

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setError(null);
    setResultado(null);
    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/productos/import", { method: "POST", body: formData });
    const data = await res.json().catch(() => null);

    setIsUploading(false);

    if (!res.ok || !data) {
      setError(data?.error ?? "No se pudo importar el archivo.");
      return;
    }

    setResultado(data);
    if (data.creados > 0) router.refresh();
  }

  return (
    <>
      <PendingOverlay pending={isUploading} />
      <Button type="button" variant="outline" className="w-full" onClick={() => handleOpenChange(true)}>
        <FileSpreadsheet className="size-4" aria-hidden="true" />
        Importar Excel
      </Button>

      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Importar productos desde Excel</SheetTitle>
            <SheetDescription>
              Descargá la plantilla, completala fuera de la app (nombre, kg, marca, categoría, proveedor, costo y los
              tres % de ganancia) y subila de vuelta para crear varios productos de una sola vez.
            </SheetDescription>
          </SheetHeader>

          <div className="flex flex-col gap-4 px-4">
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- descarga un archivo, no navega a una página; Link rompería la descarga */}
            <a
              href="/api/productos/import/plantilla"
              className={cn(buttonVariants({ variant: "outline" }), "gap-1.5")}
            >
              <Download className="size-4" aria-hidden="true" />
              Descargar plantilla
            </a>

            <div className="space-y-2">
              <Label htmlFor="archivo-excel">Subir planilla completa</Label>
              <Input
                id="archivo-excel"
                type="file"
                accept=".xlsx"
                onChange={handleFile}
                disabled={isUploading}
              />
            </div>

            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}

            {resultado && (
              <div className="space-y-2 rounded-lg border p-3 text-sm">
                <p className="font-medium">
                  {resultado.creados} {resultado.creados === 1 ? "producto importado" : "productos importados"}
                </p>
                {resultado.errores.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-destructive">
                      {resultado.errores.length}{" "}
                      {resultado.errores.length === 1 ? "fila con error" : "filas con error"}:
                    </p>
                    <ul className="max-h-40 list-disc space-y-0.5 overflow-y-auto pl-4 text-muted-foreground">
                      {resultado.errores.map((e) => (
                        <li key={e.fila}>
                          Fila {e.fila}: {e.mensaje}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
