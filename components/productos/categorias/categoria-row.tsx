"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Ban, Pencil, RotateCcw, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PendingOverlay } from "@/components/pending-overlay";
import type { Categoria } from "@/types/categoria";
import { EditCategoriaSheet } from "./edit-categoria-sheet";

export function CategoriaRow({ categoria, numero }: { categoria: Categoria; numero: number }) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function toggleActive() {
    const pregunta = categoria.active
      ? `¿Desactivar la categoría "${categoria.nombre}"? Podés reactivarla después.`
      : `¿Reactivar la categoría "${categoria.nombre}"?`;
    if (!confirm(pregunta)) return;

    startTransition(async () => {
      await fetch(`/api/categorias/${categoria.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !categoria.active }),
      });
      router.refresh();
    });
  }

  function deleteForever() {
    if (!confirm(`Esto borra "${categoria.nombre}" para siempre y no se puede deshacer. ¿Continuar?`)) return;

    startTransition(async () => {
      const res = await fetch(`/api/categorias/${categoria.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        alert(data?.error ?? "No se pudo borrar la categoría.");
        return;
      }
      router.refresh();
    });
  }

  return (
    <>
      <PendingOverlay pending={isPending} />
      <div className="flex min-w-0 items-center justify-between gap-3 rounded-lg border bg-background p-4 shadow-sm">
        <div className="flex min-w-0 items-center gap-3">
          <span className="w-6 shrink-0 text-sm text-muted-foreground">{numero}.</span>
          <div className="min-w-0">
            <p className="truncate font-medium">{categoria.nombre}</p>
            {categoria.descripcion && (
              <p className="truncate text-sm text-muted-foreground">{categoria.descripcion}</p>
            )}
          </div>
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
            aria-label={categoria.active ? "Desactivar" : "Reactivar"}
          >
            {categoria.active ? (
              <Ban className="size-4" aria-hidden="true" />
            ) : (
              <RotateCcw className="size-4" aria-hidden="true" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={deleteForever}
            disabled={isPending}
            aria-label="Borrar definitivamente"
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
      <EditCategoriaSheet categoria={categoria} open={editOpen} onOpenChange={setEditOpen} />
    </>
  );
}
