"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Ban, ChevronDown, ChevronUp, Pencil, RotateCcw, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PendingOverlay } from "@/components/pending-overlay";
import { ProductosDeEntidad } from "@/components/productos/productos-de-entidad";
import { showSuccessToast, showErrorToast } from "@/lib/toast";
import type { Marca } from "@/types/marca";
import { EditMarcaSheet } from "./edit-marca-sheet";

export function MarcaRow({ marca, numero, marcas }: { marca: Marca; numero: number; marcas: Marca[] }) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [isPending, startTransition] = useTransition();

  function toggleActive() {
    const pregunta = marca.active
      ? `¿Desactivar la marca "${marca.nombre}"? Podés reactivarla después.`
      : `¿Reactivar la marca "${marca.nombre}"?`;
    if (!confirm(pregunta)) return;

    startTransition(async () => {
      const res = await fetch(`/api/marcas/${marca.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !marca.active }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        showErrorToast(data?.error ?? "No se pudo guardar el cambio.");
        return;
      }
      showSuccessToast(marca.active ? "Marca desactivada" : "Marca reactivada");
      router.refresh();
    });
  }

  function deleteForever() {
    if (!confirm(`Esto borra "${marca.nombre}" para siempre y no se puede deshacer. ¿Continuar?`)) return;

    startTransition(async () => {
      const res = await fetch(`/api/marcas/${marca.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        showErrorToast(data?.error ?? "No se pudo borrar la marca.");
        return;
      }
      showSuccessToast("Marca borrada");
      router.refresh();
    });
  }

  return (
    <>
      <PendingOverlay pending={isPending} />
      <div className="min-w-0 rounded-lg border bg-background shadow-sm">
        <div className="flex min-w-0 items-center justify-between gap-3 p-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="w-6 shrink-0 text-sm text-muted-foreground">{numero}.</span>
            <p className="truncate font-medium">{marca.nombre}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {!marca.active && <Badge variant="outline">Inactiva</Badge>}
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setExpanded((v) => !v)}
              aria-label={expanded ? "Ocultar productos" : "Ver productos"}
            >
              {expanded ? (
                <ChevronUp className="size-4" aria-hidden="true" />
              ) : (
                <ChevronDown className="size-4" aria-hidden="true" />
              )}
            </Button>
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
        {expanded && (
          <ProductosDeEntidad
            endpoint={`/api/marcas/${marca.id}/productos`}
            campo="marcaId"
            placeholder="Cambiar marca"
            opciones={marcas
              .filter((m) => m.id !== marca.id && m.active)
              .map((m) => ({ value: m.id, label: m.nombre }))}
          />
        )}
      </div>
      <EditMarcaSheet marca={marca} open={editOpen} onOpenChange={setEditOpen} />
    </>
  );
}
