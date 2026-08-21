export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Para columnas `date` sin hora (ej. "2026-01-01"): se formatea con
// operaciones de string, no con Date, para no correr el día por huso
// horario al construir un Date a partir de un string sin hora.
export function formatDateOnly(isoDate: string): string {
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
}
