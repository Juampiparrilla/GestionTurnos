// Genera un slug base a partir del nombre de la organización. La
// unicidad final (agregar -2, -3, ...) la resuelve
// create_organization_with_super_admin() en la base de datos, no acá.
export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // saca acentos (é -> e, ñ -> n, etc.)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
