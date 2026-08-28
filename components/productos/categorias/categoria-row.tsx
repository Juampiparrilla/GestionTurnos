"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, RotateCcw, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Categoria } from "@/types/categoria";
import { EditCategoriaSheet } from "./edit-categoria-sheet";

export function CategoriaRow({ categoria }: { categoria: Categoria }) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function toggleActive() {
    if (categoria.active && !confirm(`¿Eliminar la categoría "${categoria.nombre}"?`)) {
      return;
    }
    startTransition(async () => {
      await fetch(`/api/categorias/${categoria.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !categoria.active }),
      });
      router.refresh();
    });
  }

  return (
    <>
      <div className="flex items-center justify-between gap-3 rounded-lg border bg-background p-4 shadow-sm">
        <div className="min-w-0">
          <p className="truncate font-medium">{categoria.nombre}</p>
          {categoria.descripcion && (
            <p className="truncate text-sm text-muted-foreground">{categoria.descripcion}</p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {!categoria.active && <Badge variant="outline">Inactiva</Badge>}
          <Button variant="ghost" size="icon-sm" onClick={() => setEditOpen(true)} aria-label="Editar">
            <Pencil className="size-4" aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={toggleActive}
            disabled={isPending}
            aria-label={categoria.active ? "Eliminar" : "Reactivar"}
          >
            {categoria.active ? (
              <Trash2 className="size-4" aria-hidden="true" />
            ) : (
              <RotateCcw className="size-4" aria-hidden="true" />
            )}
          </Button>
        </div>
      </div>
      <EditCategoriaSheet categoria={categoria} open={editOpen} onOpenChange={setEditOpen} />
    </>
  );
}
