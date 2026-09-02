"use client";

import { useState, useTransition } from "react";
import { Ban, ChevronDown, ChevronUp, Pencil } from "lucide-react";
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
import { TIPO_MOVIMIENTO_LABEL, type CajaEtiqueta, type CajaMovimiento } from "@/types/caja";
import type { Board } from "@/types/board";
import type { ShiftConfiguration } from "@/types/shift";
import { EditMovimientoSheet } from "./edit-movimiento-sheet";

export function MovimientoRow({
  movimiento,
  etiquetaNombre,
  boardNombre,
  turnoNombre,
  usuarioNombre,
  puedeAnular,
  etiquetas,
  boards,
  shifts,
  onUpdated,
}: {
  movimiento: CajaMovimiento;
  etiquetaNombre: string;
  boardNombre: string;
  turnoNombre: string;
  usuarioNombre: string;
  puedeAnular: boolean;
  etiquetas: CajaEtiqueta[];
  boards: Board[];
  shifts: ShiftConfiguration[];
  onUpdated: (movimiento: CajaMovimiento) => void;
}) {
  const [motivo, setMotivo] = useState("");
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [isPending, startTransition] = useTransition();

  function anular() {
    startTransition(async () => {
      const res = await fetch(`/api/caja/movimientos/${movimiento.id}/anular`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ motivo }),
      });
      const data = await res.json();
      if (!res.ok) {
        showErrorToast(data?.error ?? "No se pudo anular el movimiento.");
        return;
      }
      setOpen(false);
      onUpdated(data.movimiento);
      showSuccessToast("Movimiento anulado");
    });
  }

  const anulado = movimiento.estado === "anulado";
  const signo = movimiento.tipo === "ingreso" ? "+" : "-";

  return (
    <div className={`rounded-lg border bg-background p-3 shadow-sm ${anulado ? "opacity-60" : ""}`}>
      <PendingOverlay pending={isPending} />
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={movimiento.tipo === "ingreso" ? "default" : "destructive"}>
              {TIPO_MOVIMIENTO_LABEL[movimiento.tipo]}
            </Badge>
            {anulado && <Badge variant="outline">Anulado</Badge>}
            <p className="truncate font-medium">{etiquetaNombre}</p>
          </div>
          {expanded && (
            <>
              <p className="text-sm text-muted-foreground">
                {formatDateOnly(movimiento.fecha)} · {boardNombre} · {turnoNombre} · {usuarioNombre}
              </p>
              {movimiento.observacion && (
                <p className="mt-1 text-sm text-muted-foreground">{movimiento.observacion}</p>
              )}
            </>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <p className={`font-semibold ${movimiento.tipo === "ingreso" ? "text-emerald-600" : "text-rose-600"}`}>
            {signo} {formatMonto(movimiento.monto)}
          </p>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setExpanded((v) => !v)}
            aria-label={expanded ? "Ver menos" : "Ver más"}
          >
            {expanded ? (
              <ChevronUp className="size-4" aria-hidden="true" />
            ) : (
              <ChevronDown className="size-4" aria-hidden="true" />
            )}
          </Button>
          {puedeAnular && !anulado && (
            <>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Editar movimiento"
                onClick={() => setEditOpen(true)}
              >
                <Pencil className="size-4" aria-hidden="true" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Anular movimiento"
                onClick={() => setOpen(true)}
              >
                <Ban className="size-4" aria-hidden="true" />
              </Button>
              <EditMovimientoSheet
                movimiento={movimiento}
                etiquetas={etiquetas}
                boards={boards}
                shifts={shifts}
                open={editOpen}
                onOpenChange={setEditOpen}
                onUpdated={onUpdated}
              />
              <AlertDialog open={open} onOpenChange={setOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Anular este movimiento?</AlertDialogTitle>
                  <AlertDialogDescription>
                    {etiquetaNombre} · {formatMonto(movimiento.monto)}. No se puede deshacer, pero queda en el
                    historial.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="space-y-2 px-4">
                  <Label htmlFor={`motivo-${movimiento.id}`}>Motivo (opcional)</Label>
                  <Textarea
                    id={`motivo-${movimiento.id}`}
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
