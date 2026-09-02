"use client";

import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const FUNCIONALIDADES = [
  {
    titulo: "Movimientos",
    descripcion:
      "Registrá un Ingreso o un Egreso: elegí el tipo, una etiqueta (filtrada según el tipo, se puede crear una nueva sin salir del formulario), el importe, la fecha, el local y el turno (o \"Sin turno\" para gastos que no corresponden a uno puntual, ej. un pago de internet). El formulario se abre desde el botón \"+ Nuevo movimiento\" y se puede \"anclar\" para cargar varios movimientos seguidos sin volver a abrirlo. En el Importe se puede sumar (o restar) varias ventas escribiendo, por ejemplo, 5000+3000+1500 -- el total se calcula solo.",
  },
  {
    titulo: "Editar y anular",
    descripcion:
      "Un Administrador o Super Administrador puede editar cualquier campo de un movimiento (por si se cargó mal) o anularlo con un motivo opcional. Un movimiento anulado nunca se borra: queda visible en el historial marcado como \"Anulado\" y deja de contar en los totales del Dashboard.",
  },
  {
    titulo: "Dashboard",
    descripcion:
      "Ingresos, Egresos, Balance (siempre calculado, nunca guardado) y Promedio diario (ingresos del período dividido los días que tuvieron alguna venta), un gráfico de ingresos por día, el día con más y con menos ingresos, y un resumen de ingresos por turno. Todo se puede filtrar por período (Hoy, Ayer, Últimos 7/30 días, Este mes, Mes anterior o un rango a elección), local, turno y tipo.",
  },
  {
    titulo: "Etiquetas",
    descripcion:
      "Clasifican los movimientos (ej. \"Venta del Día\", \"Pago Internet\", \"Compra Mercadería\"). Las administra solo un Administrador o Super Administrador. Una etiqueta ya usada en algún movimiento no se puede borrar ni cambiar de tipo (Ingreso/Egreso) -- se desactiva en su lugar, y sigue apareciendo en los movimientos históricos.",
  },
  {
    titulo: "Deudas",
    descripcion:
      "Plata que le prestaron al negocio (ej. para pagar el alquiler) -- no es una venta ni un gasto real, así que se registra separada y nunca afecta los totales ni el gráfico de Caja. Cada deuda tiene fecha, a quién se le debe, importe y observación opcional, con estado Pendiente → Pagada o Anulada. Solo un Administrador o Super Administrador la ve y gestiona.",
  },
  {
    titulo: "Quién ve qué",
    descripcion:
      "Un Empleado carga y ve movimientos solo de los locales donde está asignado (igual criterio que en Horarios). Editar o anular movimientos, y toda la sección de Etiquetas y Deudas, es exclusivo de Administrador y Super Administrador.",
  },
];

export function FuncionalidadesDialog() {
  return (
    <Dialog>
      <DialogTrigger render={
        <Button variant="outline" className="w-full">
          <Info className="size-4" aria-hidden="true" />
          Funcionalidades
        </Button>
      } />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Funcionalidades de Caja</DialogTitle>
          <DialogDescription>Todo lo que podés hacer en esta sección.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 text-sm">
          {FUNCIONALIDADES.map((f) => (
            <div key={f.titulo}>
              <p className="font-medium">{f.titulo}</p>
              <p className="text-muted-foreground">{f.descripcion}</p>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
