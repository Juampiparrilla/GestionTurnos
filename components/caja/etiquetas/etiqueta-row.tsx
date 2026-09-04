"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Ban, Pencil, RotateCcw, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PendingOverlay } from "@/components/pending-overlay";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { showSuccessToast, showErrorToast } from "@/lib/toast";
import { TIPO_MOVIMIENTO_LABEL, type CajaEtiqueta } from "@/types/caja";
import { EditEtiquetaSheet } from "./edit-etiqueta-sheet";

export function EtiquetaRow({ etiqueta, enUso }: { etiqueta: CajaEtiqueta; enUso: boolean }) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [confirmToggleOpen, setConfirmToggleOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function toggleActive() {
    startTransition(async () => {
      const res = await fetch(`/api/caja/etiquetas/${etiqueta.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !etiqueta.active }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        showErrorToast(data?.error ?? "No se pudo guardar el cambio.");
        return;
      }
      showSuccessToast(etiqueta.active ? "Etiqueta desactivada" : "Etiqueta reactivada");
      router.refresh();
    });
  }

  function deleteForever() {
    startTransition(async () => {
      const res = await fetch(`/api/caja/etiquetas/${etiqueta.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        showErrorToast(data?.error ?? "No se pudo borrar la etiqueta.");
        return;
      }
      showSuccessToast("Etiqueta borrada");
      router.refresh();
    });
  }

  return (
    <>
      <PendingOverlay pending={isPending} />
      <div className="flex items-center justify-between gap-2 rounded-lg border bg-background p-3 shadow-sm">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="truncate font-medium">{etiqueta.nombre}</p>
            <Badge variant={etiqueta.tipo === "ingreso" ? "default" : "destructive"}>
              {TIPO_MOVIMIENTO_LABEL[etiqueta.tipo]}
            </Badge>
            {!etiqueta.active && <Badge variant="outline">Inactiva</Badge>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setEditOpen(true)} aria-label="Editar">
            <Pencil className="size-4" aria-hidden="true" />
          </Button>
          <div className="flex items-center gap-1.5 border-l pl-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setConfirmToggleOpen(true)}
              disabled={isPending}
              aria-label={etiqueta.active ? "Desactivar" : "Reactivar"}
            >
              {etiqueta.active ? (
                <Ban className="size-4" aria-hidden="true" />
              ) : (
                <RotateCcw className="size-4" aria-hidden="true" />
              )}
            </Button>
            {!enUso && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setConfirmDeleteOpen(true)}
                disabled={isPending}
                aria-label="Borrar definitivamente"
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="size-4" aria-hidden="true" />
              </Button>
            )}
          </div>
        </div>
      </div>
      <EditEtiquetaSheet etiqueta={etiqueta} enUso={enUso} open={editOpen} onOpenChange={setEditOpen} />
      <ConfirmDialog
        open={confirmToggleOpen}
        onOpenChange={setConfirmToggleOpen}
        title={etiqueta.active ? "¿Desactivar esta etiqueta?" : "¿Reactivar esta etiqueta?"}
        description={
          etiqueta.active
            ? `"${etiqueta.nombre}" deja de aparecer para nuevos movimientos. Podés reactivarla después.`
            : `"${etiqueta.nombre}" vuelve a estar disponible para nuevos movimientos.`
        }
        confirmLabel={etiqueta.active ? "Desactivar" : "Reactivar"}
        onConfirm={() => {
          setConfirmToggleOpen(false);
          toggleActive();
        }}
      />
      <ConfirmDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        title="¿Borrar esta etiqueta?"
        description={`Esto borra "${etiqueta.nombre}" para siempre y no se puede deshacer.`}
        confirmLabel="Borrar"
        destructive
        onConfirm={() => {
          setConfirmDeleteOpen(false);
          deleteForever();
        }}
      />
    </>
  );
}
