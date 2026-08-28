"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Ban, Pencil, RotateCcw, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Marca } from "@/types/marca";
import { EditMarcaSheet } from "./edit-marca-sheet";

export function MarcaRow({ marca }: { marca: Marca }) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function toggleActive() {
    const pregunta = marca.active
      ? `¿Desactivar la marca "${marca.nombre}"? Podés reactivarla después.`
      : `¿Reactivar la marca "${marca.nombre}"?`;
    if (!confirm(pregunta)) return;

    startTransition(async () => {
      await fetch(`/api/marcas/${marca.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !marca.active }),
      });
      router.refresh();
    });
  }

  function deleteForever() {
    if (!confirm(`Esto borra "${marca.nombre}" para siempre y no se puede deshacer. ¿Continuar?`)) return;

    startTransition(async () => {
      const res = await fetch(`/api/marcas/${marca.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        alert(data?.error ?? "No se pudo borrar la marca.");
        return;
      }
      router.refresh();
    });
  }

  return (
    <>
      <div className="flex items-center justify-between gap-3 rounded-lg border bg-background p-4 shadow-sm">
        <p className="min-w-0 truncate font-medium">{marca.nombre}</p>
        <div className="flex shrink-0 items-center gap-2">
          {!marca.active && <Badge variant="outline">Inactiva</Badge>}
          <Button variant="ghost" size="icon-sm" onClick={() => setEditOpen(true)} aria-label="Editar">
            <Pencil className="size-4" aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={toggleActive}
            disabled={isPending}
            aria-label={marca.active ? "Desactivar" : "Reactivar"}
          >
            {marca.active ? (
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
      <EditMarcaSheet marca={marca} open={editOpen} onOpenChange={setEditOpen} />
    </>
  );
}
