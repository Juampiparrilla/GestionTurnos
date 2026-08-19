export type AssignmentStatus = "EMPLEADO" | "FERIADO" | "CERRADO";

export type ShiftAssignment = {
  id: string;
  organization_id: string;
  board_id: string;
  shift_configuration_id: string;
  day_of_week: number;
  status: AssignmentStatus;
  user_id: string | null;
  valid_from: string;
  valid_to: string | null;
  created_by: string | null;
  created_at: string;
};

export const DAY_LABELS = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
] as const;

export const DAY_LABELS_SHORT = ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"] as const;

export const ASSIGNMENT_STATUS_LABEL: Record<AssignmentStatus, string> = {
  EMPLEADO: "Empleado",
  FERIADO: "Feriado",
  CERRADO: "Cerrado",
};

// Date.getDay() usa 0=Domingo; nuestro day_of_week usa 0=Lunes.
export function todayDayOfWeek(): number {
  const jsDay = new Date().getDay();
  return jsDay === 0 ? 6 : jsDay - 1;
}
