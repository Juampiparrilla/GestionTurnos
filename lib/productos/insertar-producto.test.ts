import { describe, expect, it, vi } from "vitest";
import { insertarProducto, type NuevoProducto } from "@/lib/productos/insertar-producto";

// Mock del cliente de Supabase -- nunca toca una base real, solo simula las
// respuestas de .from("productos").insert(...).select().single() en el
// orden en que se van a pedir.
function mockSupabase(respuestas: Array<{ data: unknown; error: { code: string; message: string } | null }>) {
  let intento = 0;
  const single = vi.fn(() => Promise.resolve(respuestas[intento++]));
  const select = vi.fn(() => ({ single }));
  const insert = vi.fn<(row: Record<string, unknown>) => { select: typeof select }>(() => ({ select }));
  const from = vi.fn(() => ({ insert }));
  return { client: { from } as unknown as Parameters<typeof insertarProducto>[0], insert, from };
}

const producto: NuevoProducto = {
  organization_id: "org-1",
  nombre: "ALIMENTO PERRO ADULTO",
  marca_id: null,
  categoria_id: null,
  proveedor_id: null,
  descripcion: null,
  kg: 20,
  unidad_medida: "kg",
  costo: 10000,
  porcentaje_ganancia_cerrada: 30,
  precio_venta_cerrada: 13000,
  precio_manual_cerrada: false,
  porcentaje_ganancia_abierta: 30,
  precio_venta_abierta: 13000,
  precio_manual_abierta: false,
  porcentaje_ganancia_por_mayor: 20,
  precio_venta_por_mayor: 12000,
  precio_manual_por_mayor: false,
  oferta: false,
  created_by: "user-1",
};

describe("insertarProducto", () => {
  it("inserta bien al primer intento", async () => {
    const { client, insert } = mockSupabase([{ data: { id: "p1" }, error: null }]);
    const result = await insertarProducto(client, producto);
    expect(result).toEqual({ ok: true, producto: { id: "p1" } });
    expect(insert).toHaveBeenCalledTimes(1);
  });

  it("reintenta con otro sufijo si el código choca, sin tocar el nombre+cantidad", async () => {
    const { client, insert } = mockSupabase([
      { data: null, error: { code: "23505", message: 'duplicate key value violates unique constraint "productos_codigo_key"' } },
      { data: { id: "p2" }, error: null },
    ]);
    const result = await insertarProducto(client, producto);
    expect(result).toEqual({ ok: true, producto: { id: "p2" } });
    expect(insert).toHaveBeenCalledTimes(2);

    const [primerIntento, segundoIntento] = insert.mock.calls.map((call) => call[0]?.codigo);
    expect(primerIntento).not.toBe(segundoIntento);
  });

  it("corta al toque si el choque es por nombre+cantidad repetido (producto duplicado real)", async () => {
    const { client, insert } = mockSupabase([
      { data: null, error: { code: "23505", message: 'duplicate key value violates unique constraint "productos_org_nombre_kg_unique"' } },
    ]);
    const result = await insertarProducto(client, producto);
    expect(result).toEqual({ ok: false, motivo: "duplicado" });
    expect(insert).toHaveBeenCalledTimes(1);
  });

  it("no reintenta ante un error que no es de clave duplicada", async () => {
    const { client, insert } = mockSupabase([{ data: null, error: { code: "23503", message: "foreign key violation" } }]);
    const result = await insertarProducto(client, producto);
    expect(result).toEqual({ ok: false, motivo: "otro" });
    expect(insert).toHaveBeenCalledTimes(1);
  });

  it("se rinde después de agotar los reintentos de código", async () => {
    const errorCodigo = { code: "23505", message: 'duplicate key value violates unique constraint "productos_codigo_key"' };
    const { client, insert } = mockSupabase(Array.from({ length: 20 }, () => ({ data: null, error: errorCodigo })));
    const result = await insertarProducto(client, producto);
    expect(result).toEqual({ ok: false, motivo: "codigo" });
    expect(insert).toHaveBeenCalledTimes(20);
  });
});
