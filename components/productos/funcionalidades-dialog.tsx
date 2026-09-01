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
      "Alta, edición y baja de productos con costo y precios de venta, cada uno con su % de ganancia o un precio manual. Se venden por Kg (bolsa cerrada, bolsa abierta y por mayor) o por Unidad (precio unitario y por mayor, para productos que no se venden sueltos, como un sachet o un accesorio) -- por Kg la cantidad admite decimales (ej. 0.5), por Unidad siempre tiene que ser un número entero. En Bolsa abierta el formulario también muestra a cuánto equivale el precio por kg suelto, calculado sobre el precio de la bolsa entera. Al tipear el nombre te sugiere productos que ya tenés cargados, para no repetir uno con una pequeña diferencia. El formulario de alta se puede \"anclar\" para que quede abierto después de crear cada producto, útil para cargar varios seguidos. Crear, editar, desactivar/reactivar o borrar un producto (y lo mismo para Marcas, Categorías y Proveedores) siempre confirma con un mensaje de éxito o de error. El listado también se puede filtrar por categoría, marca, proveedor, cantidad, oferta y precio, igual que en Reportes.",
  },
  {
    titulo: "Marcas, categorías y proveedores",
    descripcion:
      "Se administran desde sus propias pantallas, y también se pueden crear al vuelo sin salir del formulario de producto. En las tres, la flecha de cada fila despliega los productos que tiene (cargados en el momento) y deja reasignar cualquiera a otra marca, categoría o proveedor sin abrir el formulario completo -- para corregir rápido uno que quedó mal cargado.",
  },
  {
    titulo: "Costo por varias unidades o por descuento",
    descripcion:
      "Si compraste varias unidades por un total (ej. 3 bolsas por $18.000) o te dieron un precio de lista con un % de descuento, el formulario calcula solo el costo unitario en vez de tener que hacer la cuenta a mano. Si además venía en un paquete de varias (ej. una caja de 12), esa cantidad se suma al cálculo.",
  },
  {
    titulo: "Ajuste masivo por proveedor",
    descripcion:
      "Desde la pantalla de un proveedor se actualiza el % de ganancia de todos sus productos de una sola vez, sin pisar los precios marcados como manuales.",
  },
  {
    titulo: "Actualizar costos",
    descripcion:
      "Buscá o filtrá para encontrar los productos (por categoría, marca, proveedor, cantidad, oferta o precio) y tildalos a mano de la lista -- de a uno o todos los que quedaron filtrados con un solo botón. La selección se mantiene aunque cambies la búsqueda, así se puede armar de a partes. Al % de ajuste se le pone solo el número para aumentar (ej. 15) o el signo \"-\" adelante para bajar (ej. -15), y se aplica de una al costo de todo lo tildado -- por ejemplo cuando un proveedor sube toda su lista un 15%. Las tres pistas de precio se recalculan solas con el % de ganancia que ya tenía cada una, sin tocar las que están fijadas manualmente.",
  },
  {
    titulo: "Reportes con filtros",
    descripcion:
      "Filtrá productos por categoría, marca, proveedor, cantidad, oferta y precio (podés elegir varias opciones a la vez en cada filtro), con un botón para limpiar todo, y agrupalos por categoría, marca o proveedor.",
  },
  {
    titulo: "PDF y WhatsApp",
    descripcion:
      "Generá un PDF horizontal interno (con costos y porcentajes) o uno para el cliente (con los precios que elijas mostrar y una fecha de validez opcional) y compartilo directo por WhatsApp desde el celular. Cada producto va numerado en la primera columna. Lleva el nombre del negocio como marca de agua, tenue para no tapar la tabla (el teléfono ya se ve arriba de cada hoja). Cuando agrupás por categoría, marca o proveedor, cada grupo se separa con una fila en negro para distinguirlo fácil de los productos (nunca queda el título solo al pie de una hoja) y la numeración arranca de nuevo en cada grupo.",
  },
  {
    titulo: "Código de producto",
    descripcion:
      "Cada producto recibe un código único generado a partir de su nombre, para identificarlo rápido en el listado y en la pantalla de Reportes (no aparece en los PDF, ahí solo interesa el nombre).",
  },
  {
    titulo: "Importar Excel",
    descripcion:
      "Descargá una plantilla vacía para cargar varios productos nuevos de una, o tu catálogo actual para editarlo en Excel y volver a subirlo — actualiza los productos existentes en vez de duplicarlos. Marca, categoría y proveedor se crean solos si escribís un nombre que no existe todavía.",
  },
  {
    titulo: "Actualización automática",
    descripcion:
      "Si cargaste algo desde el celular y tenías esta pantalla abierta en la compu (o al revés), no hace falta apretar F5 -- se actualiza sola al volver a esa pestaña.",
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
