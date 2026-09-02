"use client";

import { useMemo, useState, useTransition } from "react";
import { Pin, PinOff } from "lucide-react";
import { PendingOverlay } from "@/components/pending-overlay";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MontoSumaInput } from "@/components/caja/monto-suma-input";
import { showSuccessToast } from "@/lib/toast";
import { hoyISO } from "@/lib/caja/periodos";
import { TipoSelector } from "./tipo-selector";
import { EtiquetaSelectField } from "./etiqueta-select-field";
import type { CajaEtiqueta, CajaMovimiento, TipoMovimientoCaja } from "@/types/caja";
import type { Board } from "@/types/board";
import type { ShiftConfiguration } from "@/types/shift";

const SIN_TURNO = "sin_turno";

export function NuevoMovimientoSheet({
  open,
  onOpenChange,
  etiquetas: etiquetasIniciales,
  boards,
  shifts,
  onCreated,
  onEtiquetaCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  etiquetas: CajaEtiqueta[];
  boards: Board[];
  shifts: ShiftConfiguration[];
  onCreated: (movimiento: CajaMovimiento) => void;
  onEtiquetaCreated: (etiqueta: CajaEtiqueta) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [anclado, setAnclado] = useState(false);

  const [etiquetas, setEtiquetas] = useState(etiquetasIniciales);
  const [tipo, setTipo] = useState<TipoMovimientoCaja>("ingreso");
  const [etiquetaId, setEtiquetaId] = useState("");
  const [monto, setMonto] = useState(0);
  const [fecha, setFecha] = useState(hoyISO());
  const [boardId, setBoardId] = useState(boards.length === 1 ? boards[0].id : "");
  const [shiftConfigurationId, setShiftConfigurationId] = useState(SIN_TURNO);
  const [observacion, setObservacion] = useState("");
  const [montoFieldKey, setMontoFieldKey] = useState(0);

  const etiquetasDelTipo = useMemo(() => etiquetas.filter((e) => e.tipo === tipo), [etiquetas, tipo]);
  const turnosDelLocal = useMemo(() => shifts.filter((s) => s.board_id === boardId), [shifts, boardId]);

  function resetForm() {
    setTipo("ingreso");
    setEtiquetaId("");
    setMonto(0);
    setFecha(hoyISO());
    setBoardId(boards.length === 1 ? boards[0].id : "");
    setShiftConfigurationId(SIN_TURNO);
    setObservacion("");
    setError(null);
    // MontoSumaInput guarda su propia expresión interna ("5000+3000") --
    // sin remontarlo, al anclar y cargar varios movimientos seguidos
    // quedaría pegada la suma del anterior.
    setMontoFieldKey((k) => k + 1);
  }

  function handleOpenChange(next: boolean) {
    if (next) resetForm();
    onOpenChange(next);
  }

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
    if (!boardId) {
      setError("Elegí un local.");
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
      const res = await fetch("/api/caja/movimientos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "No se pudo crear el movimiento.");
        return;
      }

      onCreated(data.movimiento);
      resetForm();
      if (!anclado) onOpenChange(false);
      showSuccessToast("Movimiento registrado con éxito");
    });
  }

  return (
    <>
      <PendingOverlay pending={isPending} />
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <div className="flex items-center justify-between gap-2">
              <SheetTitle>Nuevo movimiento</SheetTitle>
              <Button
                type="button"
                variant={anclado ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setAnclado((v) => !v)}
                className="gap-1.5"
                title={
                  anclado
                    ? "El formulario queda abierto después de guardar"
                    : "Anclar: dejar el formulario abierto para cargar varios seguidos"
                }
              >
                {anclado ? <Pin className="size-4" aria-hidden="true" /> : <PinOff className="size-4" aria-hidden="true" />}
                {anclado ? "Anclado" : "Anclar"}
              </Button>
            </div>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-4">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <TipoSelector value={tipo} onChange={handleTipoChange} />
            </div>

            <EtiquetaSelectField
              etiquetas={etiquetasDelTipo}
              tipo={tipo}
              value={etiquetaId}
              onChange={setEtiquetaId}
              onEtiquetaCreated={(nueva) => {
                setEtiquetas((prev) => [...prev, nueva]);
                onEtiquetaCreated(nueva);
              }}
            />

            <div className="space-y-2">
              <Label htmlFor="monto">Importe</Label>
              <MontoSumaInput key={montoFieldKey} id="monto" value={monto} onChange={setMonto} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fecha">Fecha</Label>
              <Input
                id="fecha"
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                max={hoyISO()}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="local">Local</Label>
              <Select value={boardId} onValueChange={(v) => handleBoardChange(v ?? "")}>
                <SelectTrigger id="local" className="w-full">
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
              <Label htmlFor="turno">Turno</Label>
              <Select value={shiftConfigurationId} onValueChange={(v) => setShiftConfigurationId(v ?? SIN_TURNO)}>
                <SelectTrigger id="turno" className="w-full" disabled={!boardId}>
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
              <Label htmlFor="observacion">Observación (opcional)</Label>
              <Textarea
                id="observacion"
                value={observacion}
                onChange={(e) => setObservacion(e.target.value.toUpperCase())}
                maxLength={500}
                rows={2}
                placeholder="Ej. PAGO CORRESPONDIENTE AL MES DE SEPTIEMBRE."
              />
            </div>

            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}

            <SheetFooter className="px-0">
              <Button type="submit" disabled={isPending}>
                {isPending ? "Guardando..." : "Guardar movimiento"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}
