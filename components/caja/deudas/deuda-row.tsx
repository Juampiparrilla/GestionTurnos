"use client";

import { useState, useTransition } from "react";
import { Ban, Check, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PendingOverlay } from "@/components/pending-overlay";
import { showSuccessToast, showErrorToast } from "@/lib/toast";
import { formatDateOnly } from "@/lib/format-date";
import { formatMonto } from "@/lib/caja/formato-moneda";
import { ESTADO_DEUDA_LABEL, type CajaDeuda } from "@/types/caja";
import { EditDeudaSheet } from "./edit-deuda-sheet";

export function DeudaRow({
  deuda,
  onUpdated,
}: {
  deuda: CajaDeuda;
  onUpdated: (deuda: CajaDeuda) => void;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [anularOpen, setAnularOpen] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [isPending, startTransition] = useTransition();

  const pendiente = deuda.estado === "pendiente";

  function marcarPagada() {
    startTransition(async () => {
      const res = await fetch(`/api/caja/deudas/${deuda.id}/pagar`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        showErrorToast(data?.error ?? "No se pudo marcar la deuda como pagada.");
        return;
      }
      onUpdated(data.deuda);
      showSuccessToast("Deuda marcada como pagada");
    });
  }

  function anular() {
    startTransition(async () => {
      const res = await fetch(`/api/caja/deudas/${deuda.id}/anular`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ motivo }),
      });
      const data = await res.json();
      if (!res.ok) {
        showErrorToast(data?.error ?? "No se pudo anular la deuda.");
        return;
      }
      setAnularOpen(false);
      onUpdated(data.deuda);
      showSuccessToast("Deuda anulada");
    });
  }

  const badgeVariant = deuda.estado === "pagada" ? "default" : deuda.estado === "anulada" ? "outline" : "secondary";

  return (
    <div className={`rounded-lg border bg-background p-3 shadow-sm ${!pendiente ? "opacity-70" : ""}`}>
      <PendingOverlay pending={isPending} />
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={badgeVariant}>{ESTADO_DEUDA_LABEL[deuda.estado]}</Badge>
            <p className="truncate font-medium">{deuda.acreedor}</p>
          </div>
          <p className="text-sm text-muted-foreground">{formatDateOnly(deuda.fecha)}</p>
          {deuda.observacion && <p className="mt-1 text-sm text-muted-foreground">{deuda.observacion}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <p className="font-semibold">{formatMonto(deuda.monto)}</p>
          {pendiente && (
            <>
              <Button variant="ghost" size="icon" aria-label="Editar deuda" onClick={() => setEditOpen(true)}>
                <Pencil className="size-4" aria-hidden="true" />
              </Button>
              <div className="flex items-center gap-1.5 border-l pl-2">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Marcar pagada"
                  onClick={marcarPagada}
                  disabled={isPending}
                >
                  <Check className="size-4" aria-hidden="true" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Anular deuda"
                  onClick={() => setAnularOpen(true)}
                >
                  <Ban className="size-4" aria-hidden="true" />
                </Button>
              </div>
              <EditDeudaSheet deuda={deuda} open={editOpen} onOpenChange={setEditOpen} onUpdated={onUpdated} />
              <AlertDialog open={anularOpen} onOpenChange={setAnularOpen}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Anular esta deuda?</AlertDialogTitle>
                    <AlertDialogDescription>
                      {deuda.acreedor} · {formatMonto(deuda.monto)}. No se puede deshacer, pero queda en el historial.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="space-y-2 px-4">
                    <Label htmlFor={`motivo-deuda-${deuda.id}`}>Motivo (opcional)</Label>
                    <Textarea
                      id={`motivo-deuda-${deuda.id}`}
                      value={motivo}
                      onChange={(e) => setMotivo(e.target.value.toUpperCase())}
                      maxLength={500}
                      rows={2}
                    />
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={anular}
                      className="bg-destructive/10 text-destructive hover:bg-destructive/20"
                    >
                      Anular
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
