"use client";

import { useState } from "react";
import Link from "next/link";
import { FileSpreadsheet, FileText, MoreHorizontal, Percent } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ImportarExcelSheet } from "@/components/productos/importar-excel-sheet";
import { LinkPendingSpinner } from "@/components/link-pending-spinner";
import { cn } from "@/lib/utils";

// Menú "⋯" del listado de Productos, solo en el celular: agrupa lo que no es la
// acción principal (importar Excel, Actualizar costos, Reportes) para que la
// pantalla tenga un único botón fuerte. En la compu esas cosas siguen en el hub
// de Productos.
export function ProductosMasMenu() {
  const [importarOpen, setImportarOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button
              type="button"
              title="Más opciones"
              aria-label="Más opciones"
              className={cn(buttonVariants({ variant: "outline", size: "icon" }), "md:hidden")}
            >
              <MoreHorizontal className="size-5" aria-hidden="true" />
            </button>
          }
        />
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuItem onClick={() => setImportarOpen(true)}>
            <FileSpreadsheet className="size-4" aria-hidden="true" />
            Importar / actualizar Excel
          </DropdownMenuItem>
          <DropdownMenuItem
            render={
              <Link href="/productos/actualizar-costos">
                <Percent className="size-4" aria-hidden="true" />
                Actualizar costos
                <LinkPendingSpinner />
              </Link>
            }
          />
          <DropdownMenuItem
            render={
              <Link href="/productos/reportes">
                <FileText className="size-4" aria-hidden="true" />
                Reportes
                <LinkPendingSpinner />
              </Link>
            }
          />
        </DropdownMenuContent>
      </DropdownMenu>

      <ImportarExcelSheet open={importarOpen} onOpenChange={setImportarOpen} hideTrigger />
    </>
  );
}
