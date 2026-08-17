// Filtra caracteres inválidos mientras el usuario escribe, en línea con
// las reglas de lib/validations/user.ts (esa es la autoridad real; esto
// es solo para que no se puedan ni tipear caracteres que van a ser
// rechazados de todas formas).

export function sanitizeFullName(value: string): string {
  return value.replace(/[^\p{L}\s'-]/gu, "");
}

export function sanitizeUsername(value: string): string {
  return value.replace(/[^a-zA-Z0-9._-]/g, "");
}

export function sanitizeDni(value: string): string {
  return value.replace(/\D/g, "").slice(0, 8);
}
