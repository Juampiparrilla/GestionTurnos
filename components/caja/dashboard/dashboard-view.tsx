"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, HandCoins, List, Tag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LinkPendingSpinner } from "@/components/link-pending-spinner";
import { showErrorToast } from "@/lib/toast";
import { PERIODO_LABEL, resolverRangoPeriodo, type PeriodoCaja } from "@/lib/caja/periodos";
import { formatDateOnly } from "@/lib/format-date";
import { TIPO_MOVIMIENTO_LABEL, type CajaMovimiento } from "@/types/caja";
import type { Board } from "@/types/board";
import type { ShiftConfiguration } from "@/types/shift";
import { ResumenCards } from "./resumen-cards";
import { IngresosChart } from "./ingresos-chart";
import { ResumenTurnos } from "./resumen-turnos";
import { MejorPeorDia } from "./mejor-peor-dia";

const SIN_TURNO = "sin_turno";
const PERIODOS: PeriodoCaja[] = ["hoy", "ayer", "ultimos_7", "ultimos_30", "este_mes", "mes_anterior", "personalizado"];

export function DashboardView({
  boards,
  shifts,
  isAdmin,
}: {
  boards: Board[];
  shifts: ShiftConfiguration[];
  isAdmin: boolean;
}) {
  const [periodo, setPeriodo] = useState<PeriodoCaja>("hoy");
  const [rangoPersonalizado, setRangoPersonalizado] = useState({ desde: "", hasta: "" });
  const [boardId, setBoardId] = useState("");
  const [turnoNombre, setTurnoNombre] = useState("");
  const [tipo, setTipo] = useState("");
  const [movimientos, setMovimientos] = useState<CajaMovimiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtrosOpen, setFiltrosOpen] = useState(false);

  const hayFiltrosActivos = periodo !== "hoy" || boardId !== "" || turnoNombre !== "" || tipo !== "";
  const shiftPorId = useMemo(() => new Map(shifts.map((s) => [s.id, s.name])), [shifts]);

  const rango = useMemo(() => {
    try {
      return resolverRangoPeriodo(
        periodo,
        new Date(),
        periodo === "personalizado" && rangoPersonalizado.desde && rangoPersonalizado.hasta
          ? rangoPersonalizado
          : undefined,
      );
    } catch {
      return null;
    }
  }, [periodo, rangoPersonalizado]);

  const turnosDelLocal = boardId ? shifts.filter((s) => s.board_id === boardId) : shifts;
  const nombresDeTurno = useMemo(
    () => Array.from(new Set(turnosDelLocal.map((s) => s.name).filter((n): n is string => Boolean(n)))),
    [turnosDelLocal],
  );

  useEffect(() => {
    if (!rango) return;

    const params = new URLSearchParams({ desde: rango.desde, hasta: rango.hasta });
    if (boardId) params.set("boardId", boardId);
    if (tipo) params.set("tipo", tipo);

    // eslint-disable-next-line react-hooks/set-state-in-effect -- kickoff del fetch de este mismo efecto, no hay librería de data-fetching en el proyecto
    setLoading(true);
    fetch(`/api/caja/movimientos?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => setMovimientos(data.movimientos ?? []))
      .catch(() => showErrorToast("No se pudieron cargar los movimientos."))
      .finally(() => setLoading(false));
  }, [rango, boardId, tipo]);

  // El turno se filtra por NOMBRE, no por id (ver misma nota en
  // MovimientosView): dos locales pueden tener cada uno su propio "Mañana".
  const movimientosDelTurno = useMemo(() => {
    if (!turnoNombre) return movimientos;
    if (turnoNombre === SIN_TURNO) {
      return movimientos.filter((m) => !m.shift_configuration_id);
    }
    return movimientos.filter(
      (m) => m.shift_configuration_id && shiftPorId.get(m.shift_configuration_id) === turnoNombre,
    );
  }, [movimientos, turnoNombre, shiftPorId]);

  const activos = useMemo(() => movimientosDelTurno.filter((m) => m.estado === "activo"), [movimientosDelTurno]);

  const ingresos = useMemo(() => activos.filter((m) => m.tipo === "ingreso").reduce((acc, m) => acc + m.monto, 0), [activos]);
  const egresos = useMemo(() => activos.filter((m) => m.tipo === "egreso").reduce((acc, m) => acc + m.monto, 0), [activos]);

  const chartData = useMemo(() => {
    const porDia = new Map<string, number>();
    for (const m of activos) {
      if (m.tipo !== "ingreso") continue;
      porDia.set(m.fecha, (porDia.get(m.fecha) ?? 0) + m.monto);
    }
    return Array.from(porDia.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([fecha, valor]) => ({ fecha, ingresos: valor }));
  }, [activos]);

  const resumenTurnos = useMemo(() => {
    const porTurno = new Map<string, number>();
    for (const m of activos) {
      if (m.tipo !== "ingreso") continue;
      const nombre = m.shift_configuration_id
        ? (shifts.find((s) => s.id === m.shift_configuration_id)?.name ?? "Turno")
        : "Sin turno";
      porTurno.set(nombre, (porTurno.get(nombre) ?? 0) + m.monto);
    }
    return Array.from(porTurno.entries()).map(([turno, monto]) => ({ turno, monto }));
  }, [activos, shifts]);

  // Promedio diario = ingresos totales / cantidad de días del período que
  // efectivamente tuvieron algún ingreso (no los días del rango sin ventas).
  const promedioDiario = chartData.length > 0 ? ingresos / chartData.length : 0;

  function limpiarFiltros() {
    setPeriodo("hoy");
    setRangoPersonalizado({ desde: "", hasta: "" });
    setBoardId("");
    setTurnoNombre("");
    setTipo("");
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Link
          href="/caja/movimientos"
          className="flex items-center justify-center gap-2 rounded-lg bg-zinc-900 p-4 text-center text-white shadow-sm transition-colors hover:bg-zinc-800"
        >
          <List className="size-5" aria-hidden="true" />
          <span className="font-medium">Movimientos</span>
          <LinkPendingSpinner />
        </Link>
        {isAdmin && (
          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/caja/etiquetas"
              className="flex flex-col items-center justify-center gap-1 rounded-lg bg-zinc-900 p-3 text-center text-white shadow-sm transition-colors hover:bg-zinc-800"
            >
              <Tag className="size-5" aria-hidden="true" />
              <span className="text-sm font-medium">Etiqueta</span>
              <LinkPendingSpinner />
            </Link>
            <Link
              href="/caja/deudas"
              className="flex flex-col items-center justify-center gap-1 rounded-lg bg-zinc-900 p-3 text-center text-white shadow-sm transition-colors hover:bg-zinc-800"
            >
              <HandCoins className="size-5" aria-hidden="true" />
              <span className="text-sm font-medium">Deuda</span>
              <LinkPendingSpinner />
            </Link>
          </div>
        )}
      </div>

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

      {rango && (
        <p className="text-xs text-muted-foreground">
          {formatDateOnly(rango.desde)} — {formatDateOnly(rango.hasta)}
        </p>
      )}

      {filtrosOpen && (
      <div className="grid gap-3 rounded-lg border border-zinc-300 bg-zinc-100 p-3 dark:border-zinc-700 dark:bg-zinc-800">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Filtros</p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={limpiarFiltros}
            disabled={!hayFiltrosActivos}
            className="h-auto gap-1 px-2 py-1 text-muted-foreground"
          >
            <X className="size-3.5" aria-hidden="true" />
            Limpiar filtros
          </Button>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="periodo">Período</Label>
          <Select value={periodo} onValueChange={(v) => setPeriodo((v as PeriodoCaja) ?? "hoy")}>
            <SelectTrigger id="periodo" className="w-full">
              <SelectValue>{(v: PeriodoCaja) => PERIODO_LABEL[v]}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {PERIODOS.map((p) => (
                <SelectItem key={p} value={p}>
                  {PERIODO_LABEL[p]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {periodo === "personalizado" && (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="rango-desde">Desde</Label>
              <Input
                id="rango-desde"
                type="date"
                value={rangoPersonalizado.desde}
                onChange={(e) => setRangoPersonalizado((r) => ({ ...r, desde: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rango-hasta">Hasta</Label>
              <Input
                id="rango-hasta"
                type="date"
                value={rangoPersonalizado.hasta}
                onChange={(e) => setRangoPersonalizado((r) => ({ ...r, hasta: e.target.value }))}
              />
            </div>
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="dash-local">Local</Label>
          <Select value={boardId} onValueChange={(v) => { setBoardId(v ?? ""); setTurnoNombre(""); }}>
            <SelectTrigger id="dash-local" className="w-full">
              <SelectValue>{(v: string) => boards.find((b) => b.id === v)?.name ?? "Todos"}</SelectValue>
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
          <Label htmlFor="dash-turno">Turno</Label>
          <Select value={turnoNombre} onValueChange={(v) => setTurnoNombre(v ?? "")}>
            <SelectTrigger id="dash-turno" className="w-full">
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
          <Label htmlFor="dash-tipo">Tipo</Label>
          <Select value={tipo} onValueChange={(v) => setTipo(v ?? "")}>
            <SelectTrigger id="dash-tipo" className="w-full">
              <SelectValue>{(v: string) => (v ? TIPO_MOVIMIENTO_LABEL[v as "ingreso" | "egreso"] : "Todos")}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              <SelectItem value="ingreso">Ingresos</SelectItem>
              <SelectItem value="egreso">Egresos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      )}

      {loading ? (
        <p className="text-center text-sm text-muted-foreground">Cargando...</p>
      ) : (
        <>
          <ResumenCards ingresos={ingresos} egresos={egresos} balance={ingresos - egresos} promedioDiario={promedioDiario} />
          <IngresosChart datos={chartData} />
          <MejorPeorDia datos={chartData} />
          <ResumenTurnos resumen={resumenTurnos} />
        </>
      )}
    </div>
  );
}
