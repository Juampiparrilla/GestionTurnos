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
    titulo: "Ajuste masivo por proveedor",
    descripcion:
      "Desde la pantalla de un proveedor se actualiza el % de ganancia de todos sus productos de una sola vez, sin pisar los precios marcados como manuales.",
  },
  {
    titulo: "Reportes con filtros",
    descripcion:
      "Filtrá productos por categoría, marca, proveedor, kg, oferta y precio (podés elegir varias opciones a la vez en cada filtro) y agrupalos por categoría, marca o proveedor.",
  },
  {
    titulo: "PDF y WhatsApp",
    descripcion:
      "Generá un PDF interno (con costos y porcentajes) o uno para el cliente (con los precios que elijas mostrar) y compartilo directo por WhatsApp desde el celular.",
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
