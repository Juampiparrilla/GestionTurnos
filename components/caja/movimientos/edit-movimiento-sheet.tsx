"use client";

import { useMemo, useState, useTransition } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MoneyInput } from "@/components/productos/money-input";
import { PendingOverlay } from "@/components/pending-overlay";
import { showSuccessToast } from "@/lib/toast";
import { hoyISO } from "@/lib/caja/periodos";
import { TipoSelector } from "@/components/caja/nuevo/tipo-selector";
import type { CajaEtiqueta, CajaMovimiento, TipoMovimientoCaja } from "@/types/caja";
import type { Board } from "@/types/board";
import type { ShiftConfiguration } from "@/types/shift";

const SIN_TURNO = "sin_turno";

export function EditMovimientoSheet({
  movimiento,
  etiquetas,
  boards,
  shifts,
  open,
  onOpenChange,
  onUpdated,
}: {
  movimiento: CajaMovimiento;
  etiquetas: CajaEtiqueta[];
  boards: Board[];
  shifts: ShiftConfiguration[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: (movimiento: CajaMovimiento) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [tipo, setTipo] = useState<TipoMovimientoCaja>(movimiento.tipo);
  const [etiquetaId, setEtiquetaId] = useState(movimiento.etiqueta_id);
  const [monto, setMonto] = useState(movimiento.monto);
  const [fecha, setFecha] = useState(movimiento.fecha);
  const [boardId, setBoardId] = useState(movimiento.board_id);
  const [shiftConfigurationId, setShiftConfigurationId] = useState(movimiento.shift_configuration_id ?? SIN_TURNO);
  const [observacion, setObservacion] = useState(movimiento.observacion ?? "");

  // Incluye la etiqueta actual del movimiento aunque esté inactiva o sea de
  // otro tipo (recién elegido) -- si no, desaparecería del selector al editar.
  const etiquetasDelTipo = useMemo(() => {
    const delTipo = etiquetas.filter((e) => e.tipo === tipo && e.active);
    const actual = etiquetas.find((e) => e.id === etiquetaId);
    if (actual && actual.tipo === tipo && !delTipo.some((e) => e.id === actual.id)) {
      return [...delTipo, actual];
    }
    return delTipo;
  }, [etiquetas, tipo, etiquetaId]);

  const turnosDelLocal = useMemo(() => shifts.filter((s) => s.board_id === boardId), [shifts, boardId]);

  function handleTipoChange(nuevoTipo: TipoMovimientoCaja) {
    setTipo(nuevoTipo);
    setEtiquetaId("");
  }

  function handleBoardChange(nuevoBoardId: string) {
    setBoardId(nuevoBoardId);
    setShiftConfigurationId(SIN_TURNO);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (!etiquetaId) {
      setError("Elegí una etiqueta.");
      return;
    }
    if (monto <= 0) {
      setError("El monto tiene que ser mayor a 0.");
      return;
    }

    const payload = {
      tipo,
      etiquetaId,
      monto,
      fecha,
      boardId,
      shiftConfigurationId: shiftConfigurationId === SIN_TURNO ? null : shiftConfigurationId,
      observacion,
    };

    startTransition(async () => {
      const res = await fetch(`/api/caja/movimientos/${movimiento.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "No se pudo guardar el cambio.");
        return;
      }

      onUpdated(data.movimiento);
      onOpenChange(false);
      showSuccessToast("Movimiento actualizado con éxito");
    });
  }

  return (
    <>
      <PendingOverlay pending={isPending} />
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Editar movimiento</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-4">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <TipoSelector value={tipo} onChange={handleTipoChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-etiqueta">Etiqueta</Label>
              <Select value={etiquetaId} onValueChange={(v) => setEtiquetaId(v ?? "")}>
                <SelectTrigger id="edit-etiqueta" className="w-full">
                  <SelectValue>
                    {(v: string) => etiquetasDelTipo.find((e) => e.id === v)?.nombre ?? "Seleccione una etiqueta..."}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {etiquetasDelTipo.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-monto">Importe</Label>
              <MoneyInput id="edit-monto" value={monto} onChange={setMonto} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-fecha">Fecha</Label>
              <Input
                id="edit-fecha"
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                max={hoyISO()}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-local">Local</Label>
              <Select value={boardId} onValueChange={(v) => handleBoardChange(v ?? "")}>
                <SelectTrigger id="edit-local" className="w-full">
                  <SelectValue>{(v: string) => boards.find((b) => b.id === v)?.name ?? "Seleccione un local..."}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {boards.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-turno">Turno</Label>
              <Select value={shiftConfigurationId} onValueChange={(v) => setShiftConfigurationId(v ?? SIN_TURNO)}>
                <SelectTrigger id="edit-turno" className="w-full">
                  <SelectValue>
                    {(v: string) =>
                      v === SIN_TURNO ? "Sin turno" : turnosDelLocal.find((s) => s.id === v)?.name ?? "Sin turno"
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={SIN_TURNO}>Sin turno</SelectItem>
                  {turnosDelLocal.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name ?? `${s.start_time.slice(0, 5)} - ${s.end_time.slice(0, 5)}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-observacion">Observación (opcional)</Label>
              <Textarea
                id="edit-observacion"
                value={observacion}
                onChange={(e) => setObservacion(e.target.value.toUpperCase())}
                maxLength={500}
                rows={2}
              />
            </div>

            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}

            <SheetFooter className="px-0">
              <Button type="submit" disabled={isPending}>
                {isPending ? "Guardando..." : "Guardar cambios"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}
