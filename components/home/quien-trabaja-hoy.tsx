import type { Board, OrgDirectoryEntry } from "@/types/board";
import type { ShiftConfiguration } from "@/types/shift";
import type { ShiftAssignment } from "@/types/assignment";

function formatShift(shift: ShiftConfiguration) {
  return shift.name ?? `${shift.start_time.slice(0, 5)} - ${shift.end_time.slice(0, 5)}`;
}

function EstadoTurno({
  assignment,
  directoryById,
}: {
  assignment: ShiftAssignment | undefined;
  directoryById: Map<string, OrgDirectoryEntry>;
}) {
  if (!assignment) {
    return <span className="text-muted-foreground">Sin asignar</span>;
  }
  if (assignment.status === "FERIADO") {
    return <span className="font-medium text-amber-700 dark:text-amber-400">Feriado</span>;
  }
  if (assignment.status === "CERRADO") {
    return <span className="font-medium text-red-700 dark:text-red-400">Cerrado</span>;
  }
  const persona = assignment.user_id ? directoryById.get(assignment.user_id) : null;
  return <span className="font-medium">{persona?.full_name ?? "—"}</span>;
}

// Resumen de "hoy" para no tener que entrar a cada horario a ver quién
// trabaja -- mismos datos que ya muestra el calendario de cada tablero,
// pero filtrados al día de hoy y de un vistazo.
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

  return (
    <div className="rounded-lg border bg-background p-4 shadow-sm">
      <p className="mb-3 text-sm font-medium">Quién trabaja hoy</p>
      <div className="space-y-3">
        {boardsConTurnos.map(({ board, turnos }) => (
          <div key={board.id}>
            <p className="text-sm font-medium text-muted-foreground">{board.name}</p>
            <div className="mt-1 space-y-1">
              {turnos.map((shift) => (
                <div key={shift.id} className="flex items-center justify-between text-sm">
                  <span>{formatShift(shift)}</span>
                  <EstadoTurno assignment={assignmentByShiftId.get(shift.id)} directoryById={directoryById} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
