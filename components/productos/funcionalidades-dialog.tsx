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
    titulo: "Productos",
    descripcion:
      "Alta, edición y baja de productos con costo, kg y tres precios de venta (bolsa cerrada, bolsa abierta y por mayor), cada uno con su % de ganancia o un precio manual.",
  },
  {
    titulo: "Marcas, categorías y proveedores",
    descripcion:
      "Se administran desde sus propias pantallas, y también se pueden crear al vuelo sin salir del formulario de producto.",
  },
  {
    titulo: "Costo por varias unidades o por descuento",
    descripcion:
      "Si compraste varias unidades por un total (ej. 3 bolsas por $18.000) o te dieron un precio de lista con un % de descuento, el formulario calcula solo el costo unitario en vez de tener que hacer la cuenta a mano.",
  },
  {
    titulo: "Ajuste masivo por proveedor",
    descripcion:
      "Desde la pantalla de un proveedor se actualiza el % de ganancia de todos sus productos de una sola vez, sin pisar los precios marcados como manuales.",
  },
  {
    titulo: "Reportes con filtros",
    descripcion:
      "Filtrá productos por categoría, marca, proveedor, kg, oferta y precio (podés elegir varias opciones a la vez en cada filtro), con un botón para limpiar todo, y agrupalos por categoría, marca o proveedor.",
  },
  {
    titulo: "PDF y WhatsApp",
    descripcion:
      "Generá un PDF horizontal interno (con costos y porcentajes) o uno para el cliente (con los precios que elijas mostrar y una fecha de validez opcional) y compartilo directo por WhatsApp desde el celular. Lleva el nombre y teléfono del negocio como marca de agua.",
  },
  {
    titulo: "Código de producto",
    descripcion:
      "Cada producto recibe un código único generado a partir de su nombre, para identificarlo rápido en listados, reportes y PDFs.",
  },
  {
    titulo: "Importar Excel",
    descripcion:
      "Descargá una plantilla, completala con varios productos a la vez y subila para cargarlos todos juntos en vez de uno por uno.",
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
          <DialogTitle>Funcionalidades de Productos</DialogTitle>
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
