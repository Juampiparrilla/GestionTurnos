"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import type { Categoria } from "@/types/categoria";
import { EditCategoriaSheet } from "./edit-categoria-sheet";

export function CategoriaRow({ categoria }: { categoria: Categoria }) {
  const [editOpen, setEditOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setEditOpen(true)}
        className="flex w-full items-center justify-between rounded-lg border bg-background p-4 text-left shadow-sm transition-colors hover:bg-muted/50"
      >
        <div className="min-w-0">
          <p className="truncate font-medium">{categoria.nombre}</p>
          {categoria.descripcion && (
            <p className="truncate text-sm text-muted-foreground">{categoria.descripcion}</p>
          )}
        </div>
        {!categoria.active && <Badge variant="outline">Inactiva</Badge>}
      </button>
      <EditCategoriaSheet categoria={categoria} open={editOpen} onOpenChange={setEditOpen} />
    </>
  );
}
