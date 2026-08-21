// Paleta de colores para identificar personas en el calendario. Se
// asignan por ORDEN (no por hash del id): así se garantiza que nunca
// se repite un color mientras haya menos personas que colores en la
// paleta. Un hash con módulo tiene ~12% de probabilidad de colisión
// entre solo dos personas, y mucho más con un puñado de empleados
// (paradoja del cumpleaños), así que no sirve para esto.
export const PERSON_COLORS = [
  { bg: "bg-blue-500/15", text: "text-blue-700 dark:text-blue-400" },
  { bg: "bg-emerald-500/15", text: "text-emerald-700 dark:text-emerald-400" },
  { bg: "bg-purple-500/15", text: "text-purple-700 dark:text-purple-400" },
  { bg: "bg-pink-500/15", text: "text-pink-700 dark:text-pink-400" },
  { bg: "bg-cyan-500/15", text: "text-cyan-700 dark:text-cyan-400" },
  { bg: "bg-lime-500/15", text: "text-lime-700 dark:text-lime-400" },
  { bg: "bg-orange-500/15", text: "text-orange-700 dark:text-orange-400" },
  { bg: "bg-violet-500/15", text: "text-violet-700 dark:text-violet-400" },
  { bg: "bg-teal-500/15", text: "text-teal-700 dark:text-teal-400" },
  { bg: "bg-fuchsia-500/15", text: "text-fuchsia-700 dark:text-fuchsia-400" },
] as const;

export type PersonColor = { bg: string; text: string };

// people: lista de ids en un orden estable (ej. orden alfabético ya
// aplicado antes de llamar a esta función).
export function buildPersonColorMap(peopleIds: string[]): Map<string, PersonColor> {
  const map = new Map<string, PersonColor>();
  peopleIds.forEach((id, index) => {
    if (!map.has(id)) {
      map.set(id, PERSON_COLORS[index % PERSON_COLORS.length]);
    }
  });
  return map;
}
