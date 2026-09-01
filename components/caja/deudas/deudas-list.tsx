"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ESTADO_DEUDA_LABEL, type CajaDeuda, type EstadoDeuda } from "@/types/caja";
import { DeudaRow } from "./deuda-row";
import { CreateDeudaSheet } from "./create-deuda-sheet";

export function DeudasList({ deudas: deudasIniciales }: { deudas: CajaDeuda[] }) {
  const [deudas, setDeudas] = useState(deudasIniciales);
  const [createOpen, setCreateOpen] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState("");

  const filtradas = useMemo(
    () => (filtroEstado ? deudas.filter((d) => d.estado === filtroEstado) : deudas),
    [deudas, filtroEstado],
  );

  function handleCreated(deuda: CajaDeuda) {
    setDeudas((prev) => [deuda, ...prev]);
  }

  function handleUpdated(deuda: CajaDeuda) {
    setDeudas((prev) => prev.map((d) => (d.id === deuda.id ? deuda : d)));
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Plata que le prestaron al negocio (ej. para pagar el alquiler) — no cuenta como ingreso ni egreso en el
        Dashboard.
      </p>
      <Button onClick={() => setCreateOpen(true)} className="w-full">
        + Registrar deuda
      </Button>

      <div className="space-y-1.5">
        <Select value={filtroEstado} onValueChange={(v) => setFiltroEstado(v ?? "")}>
          <SelectTrigger className="w-full">
            <SelectValue>{(v: EstadoDeuda | "") => (v ? ESTADO_DEUDA_LABEL[v] : "Todas")}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todas</SelectItem>
            <SelectItem value="pendiente">Pendientes</SelectItem>
            <SelectItem value="pagada">Pagadas</SelectItem>
            <SelectItem value="anulada">Anuladas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtradas.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          {deudas.length === 0 ? "Todavía no hay deudas registradas." : "No se encontraron deudas."}
        </div>
      ) : (
        <div className="grid gap-2">
          {filtradas.map((deuda) => (
            <DeudaRow key={deuda.id} deuda={deuda} onUpdated={handleUpdated} />
          ))}
        </div>
      )}

      <CreateDeudaSheet open={createOpen} onOpenChange={setCreateOpen} onCreated={handleCreated} />
    </div>
  );
}
