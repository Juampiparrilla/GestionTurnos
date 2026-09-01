"use client";

import { useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { Download, FileSpreadsheet, Upload } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { PendingOverlay } from "@/components/pending-overlay";
import { cn } from "@/lib/utils";

type ResultadoImportacion = {
  creados: number;
  actualizados: number;
  errores: { fila: number; mensaje: string }[];
};

export function ImportarExcelSheet() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<ResultadoImportacion | null>(null);
  const [nombreArchivo, setNombreArchivo] = useState<string | null>(null);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      setError(null);
      setResultado(null);
      setNombreArchivo(null);
    }
  }

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setNombreArchivo(file.name);
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
    if (data.creados > 0 || data.actualizados > 0) router.refresh();
  }

  return (
    <>
      <PendingOverlay pending={isUploading} />
      <button
        type="button"
        onClick={() => handleOpenChange(true)}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 p-4 text-center text-white shadow-sm transition-colors hover:bg-zinc-800"
      >
        <FileSpreadsheet className="size-5" aria-hidden="true" />
        <span className="font-medium">Importar / Actualizar Excel</span>
      </button>

      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Importar productos desde Excel</SheetTitle>
            <SheetDescription>
              Subí una planilla para crear productos nuevos, actualizar los que ya tenés cargados, o las dos cosas a
              la vez — cada fila con la columna ID vacía crea un producto, y cada fila con ID actualiza ese producto
              puntual.
            </SheetDescription>
          </SheetHeader>

          <div className="flex flex-col gap-4 px-4">
            <div className="space-y-2 rounded-lg border p-3">
              <p className="text-sm font-medium">Crear productos nuevos</p>
              <p className="text-xs text-muted-foreground">
                Descargá la plantilla vacía, completala (nombre, cantidad, marca, categoría, proveedor, costo y los
                tres % de ganancia) y subila más abajo.
              </p>
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- descarga un archivo, no navega a una página; Link rompería la descarga */}
              <a
                href="/api/productos/import/plantilla"
                className={cn(buttonVariants({ variant: "outline" }), "w-full gap-1.5")}
              >
                <Download className="size-4" aria-hidden="true" />
                Descargar plantilla vacía
              </a>
            </div>

            <div className="space-y-2 rounded-lg border border-zinc-300 bg-zinc-100 p-3 dark:border-zinc-700 dark:bg-zinc-800">
              <p className="text-sm font-medium">Actualizar productos existentes</p>
              <p className="text-xs text-muted-foreground">
                Descargá tu catálogo actual (ya viene con el ID de cada producto), editá lo que necesites y subilo de
                vuelta más abajo.
              </p>
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- descarga un archivo, no navega a una página; Link rompería la descarga */}
              <a
                href="/api/productos/import/exportar"
                className={cn(buttonVariants({ variant: "default" }), "w-full gap-1.5")}
              >
                <Download className="size-4" aria-hidden="true" />
                Descargar catálogo actual
              </a>
            </div>

            <div className="space-y-2">
              <Label htmlFor="archivo-excel">Subir planilla completa</Label>
              <label
                htmlFor="archivo-excel"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "w-full cursor-pointer gap-1.5",
                  isUploading && "pointer-events-none opacity-50",
                )}
              >
                <Upload className="size-4" aria-hidden="true" />
                Elegir archivo
              </label>
              <input
                id="archivo-excel"
                type="file"
                accept=".xlsx"
                onChange={handleFile}
                disabled={isUploading}
                className="sr-only"
              />
              {nombreArchivo && <p className="truncate text-xs text-muted-foreground">{nombreArchivo}</p>}
            </div>

            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}

            {resultado && (
              <div className="space-y-2 rounded-lg border p-3 text-sm">
                <p className="font-medium">
                  {resultado.creados} {resultado.creados === 1 ? "producto creado" : "productos creados"},{" "}
                  {resultado.actualizados} {resultado.actualizados === 1 ? "actualizado" : "actualizados"}
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
