// Código único legible a partir del nombre del producto (ej. "Alimento
// Perro Adulto" -> "ALIMENTO-PERRO-ADULTO"). Es un identificador visual,
// no reemplaza el id -- por eso se resuelve el conflicto agregando un
// sufijo numérico en vez de fallar, similar a como los sistemas de
// archivos resuelven "archivo.pdf" vs "archivo (2).pdf".
//
// El rango U+0300-U+036F son los diacríticos Unicode que separa `normalize("NFD")`
// (ej. "ó" -> "o" + acento combinado) -- se arma con fromCharCode para evitar
// que el propio caracter combinado quede pegado en el código fuente.
const DIACRITICOS = new RegExp(`[${String.fromCharCode(0x0300)}-${String.fromCharCode(0x036f)}]`, "g");

export function generarCodigoBase(nombre: string): string {
  const base = nombre
    .normalize("NFD")
    .replace(DIACRITICOS, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return base || "PRODUCTO";
}

export function generarCodigoConSufijo(base: string, intento: number): string {
  return intento === 0 ? base : `${base}-${intento + 1}`;
}
