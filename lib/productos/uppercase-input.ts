import type { ChangeEvent } from "react";

// Convención del módulo Productos: todo texto libre se guarda en mayúsculas
// (nombres, descripciones, marca, contacto, notas, SKU). Muta el input
// directo en el DOM -- mismo patrón que sanitizeFullName/sanitizeUsername
// en components/users/create-user-sheet.tsx -- así funciona con formularios
// no controlados (FormData) sin tener que convertirlos a estado de React.
export function uppercaseOnChange(event: ChangeEvent<HTMLInputElement>) {
  event.target.value = event.target.value.toUpperCase();
}
