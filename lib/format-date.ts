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

// Fecha y hora para nombres de archivo (PDF, Excel) -- formato argentino
// (DD-MM-AAAA, 24hs) pero con guiones en vez de "/" y ":", que no son
// válidos en un nombre de archivo.
export function formatFechaHoraArchivo(date: Date = new Date()): string {
  const partes = new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const valor = (tipo: string) => partes.find((p) => p.type === tipo)?.value ?? "00";
  return `${valor("day")}-${valor("month")}-${valor("year")}_${valor("hour")}-${valor("minute")}`;
}
