export type TipoMovimientoCaja = "ingreso" | "egreso";
export type EstadoMovimientoCaja = "activo" | "anulado";
export type OrigenMovimientoCaja = "manual" | "venta" | "ajuste";
export type TurnoDelDia = "manana" | "tarde" | "sin_turno";

export type CajaEtiqueta = {
  id: string;
  organization_id: string;
  nombre: string;
  tipo: TipoMovimientoCaja;
  active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type CajaMovimiento = {
  id: string;
  organization_id: string;
  tipo: TipoMovimientoCaja;
  etiqueta_id: string;
  monto: number;
  fecha: string;
  board_id: string;
  shift_configuration_id: string | null;
  observacion: string | null;
  origen: OrigenMovimientoCaja;
  estado: EstadoMovimientoCaja;
  anulado_por: string | null;
  anulado_en: string | null;
  motivo_anulacion: string | null;
  created_by: string;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

export const TIPO_MOVIMIENTO_LABEL: Record<TipoMovimientoCaja, string> = {
  ingreso: "Ingreso",
  egreso: "Egreso",
};

export type EstadoDeuda = "pendiente" | "pagada" | "anulada";

export type CajaDeuda = {
  id: string;
  organization_id: string;
  fecha: string;
  acreedor: string;
  monto: number;
  estado: EstadoDeuda;
  observacion: string | null;
  pagada_por: string | null;
  pagada_en: string | null;
  anulada_por: string | null;
  anulada_en: string | null;
  motivo_anulacion: string | null;
  created_by: string;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

export const ESTADO_DEUDA_LABEL: Record<EstadoDeuda, string> = {
  pendiente: "Pendiente",
  pagada: "Pagada",
  anulada: "Anulada",
};
