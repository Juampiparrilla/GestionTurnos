// Paleta de colores estable por persona: el mismo id siempre cae en el
// mismo color, tanto en la tabla del calendario como en la leyenda.
const PERSON_COLORS = [
  { bg: "bg-blue-500/15", text: "text-blue-700 dark:text-blue-400" },
  { bg: "bg-emerald-500/15", text: "text-emerald-700 dark:text-emerald-400" },
  { bg: "bg-purple-500/15", text: "text-purple-700 dark:text-purple-400" },
  { bg: "bg-pink-500/15", text: "text-pink-700 dark:text-pink-400" },
  { bg: "bg-indigo-500/15", text: "text-indigo-700 dark:text-indigo-400" },
  { bg: "bg-teal-500/15", text: "text-teal-700 dark:text-teal-400" },
  { bg: "bg-orange-500/15", text: "text-orange-700 dark:text-orange-400" },
  { bg: "bg-cyan-500/15", text: "text-cyan-700 dark:text-cyan-400" },
] as const;

export function getPersonColor(id: string): { bg: string; text: string } {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) & 0xffffffff;
  }
  const index = Math.abs(hash) % PERSON_COLORS.length;
  return PERSON_COLORS[index];
}
