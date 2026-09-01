"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { showErrorToast } from "@/lib/toast";
import { hoyISO, toISODate } from "@/lib/caja/periodos";
import { TIPO_MOVIMIENTO_LABEL, type CajaEtiqueta, type CajaMovimiento } from "@/types/caja";
import type { Board, OrgDirectoryEntry } from "@/types/board";
import type { ShiftConfiguration } from "@/types/shift";
import { MovimientoRow } from "./movimiento-row";

const SIN_TURNO = "sin_turno";

function hace30Dias() {
  const d = new Date();
  d.setDate(d.getDate() - 29);
  return toISODate(d);
}

type Filtros = {
  desde: string;
  hasta: string;
  boardId: string;
  turnoNombre: string;
  tipo: string;
  etiquetaId: string;
};

function filtrosPorDefecto(): Filtros {
  return { desde: hace30Dias(), hasta: hoyISO(), boardId: "", turnoNombre: "", tipo: "", etiquetaId: "" };
}

export function MovimientosView({
  boards,
  etiquetas,
  shifts,
  directory,
  isAdmin,
}: {
  boards: Board[];
  etiquetas: CajaEtiqueta[];
  shifts: ShiftConfiguration[];
  directory: OrgDirectoryEntry[];
  isAdmin: boolean;
}) {
  const [draft, setDraft] = useState<Filtros>(filtrosPorDefecto());
  const [aplicados, setAplicados] = useState<Filtros>(draft);
  const [movimientos, setMovimientos] = useState<CajaMovimiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtrosOpen, setFiltrosOpen] = useState(false);

  const porDefecto = filtrosPorDefecto();
  const hayFiltrosActivos =
    aplicados.desde !== porDefecto.desde ||
    aplicados.hasta !== porDefecto.hasta ||
    aplicados.boardId !== "" ||
    aplicados.turnoNombre !== "" ||
    aplicados.tipo !== "" ||
    aplicados.etiquetaId !== "";

  const etiquetaPorId = useMemo(() => new Map(etiquetas.map((e) => [e.id, e.nombre])), [etiquetas]);
  const boardPorId = useMemo(() => new Map(boards.map((b) => [b.id, b.name])), [boards]);
  const shiftPorId = useMemo(() => new Map(shifts.map((s) => [s.id, s.name ?? `${s.start_time.slice(0, 5)} - ${s.end_time.slice(0, 5)}`])), [shifts]);
  const usuarioPorId = useMemo(() => new Map(directory.map((d) => [d.id, d.full_name])), [directory]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (aplicados.desde) params.set("desde", aplicados.desde);
    if (aplicados.hasta) params.set("hasta", aplicados.hasta);
    if (aplicados.boardId) params.set("boardId", aplicados.boardId);
    if (aplicados.tipo) params.set("tipo", aplicados.tipo);
    if (aplicados.etiquetaId) params.set("etiquetaId", aplicados.etiquetaId);

    // eslint-disable-next-line react-hooks/set-state-in-effect -- kickoff del fetch de este mismo efecto, no hay librería de data-fetching en el proyecto
    setLoading(true);
    fetch(`/api/caja/movimientos?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => setMovimientos(data.movimientos ?? []))
      .catch(() => showErrorToast("No se pudieron cargar los movimientos."))
      .finally(() => setLoading(false));
  }, [aplicados]);

  // El turno se filtra por NOMBRE, no por id: dos locales pueden tener cada
  // uno su propio "Mañana" (filas distintas en shift_configurations) y con
  // "Todos" los locales seleccionado hay que traer los movimientos de
  // cualquiera de los dos, no solo uno. El filtro se aplica en el cliente
  // sobre lo ya traído (acotado por fecha), no en la consulta a la API.
  const movimientosFiltrados = useMemo(() => {
    if (!aplicados.turnoNombre) return movimientos;
    if (aplicados.turnoNombre === SIN_TURNO) {
      return movimientos.filter((m) => !m.shift_configuration_id);
    }
    return movimientos.filter(
      (m) => m.shift_configuration_id && shiftPorId.get(m.shift_configuration_id) === aplicados.turnoNombre,
    );
  }, [movimientos, aplicados.turnoNombre, shiftPorId]);

  const turnosDelLocal = draft.boardId ? shifts.filter((s) => s.board_id === draft.boardId) : shifts;
  const nombresDeTurno = useMemo(
    () => Array.from(new Set(turnosDelLocal.map((s) => shiftPorId.get(s.id)).filter((n): n is string => Boolean(n)))),
    [turnosDelLocal, shiftPorId],
  );

  function limpiar() {
    const porDefecto = filtrosPorDefecto();
    setDraft(porDefecto);
    setAplicados(porDefecto);
  }

  return (
    <div className="space-y-4">
      <Button
        type="button"
        className="w-full justify-between"
        onClick={() => setFiltrosOpen((v) => !v)}
      >
        <span>Filtros{hayFiltrosActivos ? " (activos)" : ""}</span>
        {filtrosOpen ? (
          <ChevronUp className="size-4" aria-hidden="true" />
        ) : (
          <ChevronDown className="size-4" aria-hidden="true" />
        )}
      </Button>

      {filtrosOpen && (
      <div className="grid gap-3 rounded-lg border border-zinc-300 bg-zinc-100 p-3 dark:border-zinc-700 dark:bg-zinc-800">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Filtros</p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={limpiar}
            className="h-auto gap-1 px-2 py-1 text-muted-foreground"
          >
            <X className="size-3.5" aria-hidden="true" />
            Limpiar filtros
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="desde">Desde</Label>
            <Input
              id="desde"
              type="date"
              value={draft.desde}
              onChange={(e) => setDraft((f) => ({ ...f, desde: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="hasta">Hasta</Label>
            <Input
              id="hasta"
              type="date"
              value={draft.hasta}
              onChange={(e) => setDraft((f) => ({ ...f, hasta: e.target.value }))}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="filtro-local">Local</Label>
          <Select
            value={draft.boardId}
            onValueChange={(v) => setDraft((f) => ({ ...f, boardId: v ?? "", turnoNombre: "" }))}
          >
            <SelectTrigger id="filtro-local" className="w-full">
              <SelectValue>{(v: string) => boardPorId.get(v) ?? "Todos"}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              {boards.map((b) => (
                <SelectItem key={b.id} value={b.id}>
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="filtro-turno">Turno</Label>
          <Select
            value={draft.turnoNombre}
            onValueChange={(v) => setDraft((f) => ({ ...f, turnoNombre: v ?? "" }))}
          >
            <SelectTrigger id="filtro-turno" className="w-full">
              <SelectValue>{(v: string) => (v === SIN_TURNO ? "Sin turno" : v || "Todos")}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              <SelectItem value={SIN_TURNO}>Sin turno</SelectItem>
              {nombresDeTurno.map((nombre) => (
                <SelectItem key={nombre} value={nombre}>
                  {nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="filtro-tipo">Tipo</Label>
          <Select value={draft.tipo} onValueChange={(v) => setDraft((f) => ({ ...f, tipo: v ?? "" }))}>
            <SelectTrigger id="filtro-tipo" className="w-full">
              <SelectValue>{(v: string) => (v ? TIPO_MOVIMIENTO_LABEL[v as "ingreso" | "egreso"] : "Todos")}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              <SelectItem value="ingreso">Ingresos</SelectItem>
              <SelectItem value="egreso">Egresos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="filtro-etiqueta">Etiqueta</Label>
          <Select value={draft.etiquetaId} onValueChange={(v) => setDraft((f) => ({ ...f, etiquetaId: v ?? "" }))}>
            <SelectTrigger id="filtro-etiqueta" className="w-full">
              <SelectValue>{(v: string) => etiquetaPorId.get(v) ?? "Todas"}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas</SelectItem>
              {etiquetas.map((e) => (
                <SelectItem key={e.id} value={e.id}>
                  {e.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button type="button" onClick={() => setAplicados(draft)} className="w-full">
          Filtrar
        </Button>
      </div>
      )}

      {loading ? (
        <p className="text-center text-sm text-muted-foreground">Cargando...</p>
      ) : movimientosFiltrados.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          No se encontraron movimientos con estos filtros.
        </div>
      ) : (
        <div className="grid gap-2">
          {movimientosFiltrados.map((m) => (
            <MovimientoRow
              key={m.id}
              movimiento={m}
              etiquetaNombre={etiquetaPorId.get(m.etiqueta_id) ?? "Etiqueta borrada"}
              boardNombre={boardPorId.get(m.board_id) ?? "Local"}
              turnoNombre={m.shift_configuration_id ? (shiftPorId.get(m.shift_configuration_id) ?? "Turno") : "Sin turno"}
              usuarioNombre={usuarioPorId.get(m.created_by) ?? "-"}
              puedeAnular={isAdmin}
              etiquetas={etiquetas}
              boards={boards}
              shifts={shifts}
              onUpdated={(actualizado) =>
                setMovimientos((prev) => prev.map((mov) => (mov.id === actualizado.id ? actualizado : mov)))
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
