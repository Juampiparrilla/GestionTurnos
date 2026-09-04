import { buildPersonColorMap, type PersonColor } from "@/lib/person-colors";
import type { Board, OrgDirectoryEntry } from "@/types/board";
import type { ShiftConfiguration } from "@/types/shift";
import type { ShiftAssignment } from "@/types/assignment";

const NEUTRAL_COLOR: PersonColor = { bg: "bg-muted", text: "text-muted-foreground" };

function initials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const second = parts[1]?.[0] ?? "";
  return (first + second).toUpperCase();
}

function formatShift(shift: ShiftConfiguration) {
  return shift.name ?? `${shift.start_time.slice(0, 5)} - ${shift.end_time.slice(0, 5)}`;
}

function EstadoTurno({
  assignment,
  directoryById,
  colorByPersonId,
}: {
  assignment: ShiftAssignment | undefined;
  directoryById: Map<string, OrgDirectoryEntry>;
  colorByPersonId: Map<string, PersonColor>;
}) {
  if (!assignment) {
    return <span className="text-muted-foreground">Sin asignar</span>;
  }
  if (assignment.status === "FERIADO") {
    return (
      <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
        Feriado
      </span>
    );
  }
  if (assignment.status === "CERRADO") {
    return (
      <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-xs font-semibold text-red-700 dark:text-red-400">
        Cerrado
      </span>
    );
  }
  const persona = assignment.user_id ? directoryById.get(assignment.user_id) : null;
  const color = persona ? (colorByPersonId.get(persona.id) ?? NEUTRAL_COLOR) : NEUTRAL_COLOR;
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={`inline-flex size-5 items-center justify-center rounded-full text-[9px] font-semibold ${color.bg} ${color.text}`}
      >
        {persona ? initials(persona.full_name) : "?"}
      </span>
      <span className="font-medium">{persona?.full_name ?? "—"}</span>
    </span>
  );
}

// Resumen de "hoy" para no tener que entrar a cada horario a ver quién
// trabaja -- mismos datos que ya muestra el calendario de cada tablero
// (mismos colores por persona, para reconocerla de un vistazo), pero
// filtrados al día de hoy.
export function QuienTrabajaHoy({
  boards,
  shifts,
  assignments,
  directory,
}: {
  boards: Board[];
  shifts: ShiftConfiguration[];
  assignments: ShiftAssignment[];
  directory: OrgDirectoryEntry[];
}) {
  const directoryById = new Map(directory.map((d) => [d.id, d]));
  const assignmentByShiftId = new Map(assignments.map((a) => [a.shift_configuration_id, a]));

  const boardsConTurnos = boards
    .map((board) => ({
      board,
      turnos: shifts.filter((s) => s.board_id === board.id).sort((a, b) => a.sort_order - b.sort_order),
    }))
    .filter(({ turnos }) => turnos.length > 0);

  if (boardsConTurnos.length === 0) return null;

  const personaIds = assignments
    .filter((a) => a.status === "EMPLEADO" && a.user_id)
    .map((a) => a.user_id as string)
    .sort((a, b) => (directoryById.get(a)?.full_name ?? "").localeCompare(directoryById.get(b)?.full_name ?? ""));
  const colorByPersonId = buildPersonColorMap(Array.from(new Set(personaIds)));

  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <p className="mb-3 text-sm font-medium">Quién trabaja hoy</p>
      <div className="space-y-3">
        {boardsConTurnos.map(({ board, turnos }) => (
          <div key={board.id} className="rounded-lg bg-background p-3 shadow-sm">
            <p className="text-sm font-medium text-muted-foreground">{board.name}</p>
            <div className="mt-1.5 space-y-1.5">
              {turnos.map((shift) => (
                <div key={shift.id} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{formatShift(shift)}</span>
                  <EstadoTurno
                    assignment={assignmentByShiftId.get(shift.id)}
                    directoryById={directoryById}
                    colorByPersonId={colorByPersonId}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
