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
    titulo: "Horarios",
    descripcion:
      "Cada horario representa un local o unidad de trabajo (ej. \"Magnolia I\"). Tiene sus propios turnos configurables (ej. Mañana 08:30-13:30, Tarde 16:30-21:30) y una grilla semanal recurrente: para cada turno y día de la semana elegís quién trabaja, o si ese turno está Feriado, Cerrado o Sin asignar.",
  },
  {
    titulo: "Feriados y domingos",
    descripcion:
      "Aparte de la grilla semanal hay dos registros de fechas puntuales: Feriados y Domingos. Ahí anotás la fecha real y quién cubre ese día, con historial de quién hizo el último cambio y cuándo.",
  },
  {
    titulo: "Resumen y descarga",
    descripcion:
      "Un resumen por persona muestra cuántos turnos, domingos y feriados tiene cada uno. El horario se puede descargar como imagen para compartir por WhatsApp.",
  },
  {
    titulo: "Personas asignadas",
    descripcion:
      "Desde la configuración de cada horario se agregan o quitan las personas que pueden trabajar ahí -- solo esas personas van a aparecer como opción al asignar un turno.",
  },
  {
    titulo: "Invitaciones",
    descripcion:
      "No hay registro público de usuarios: un Administrador crea la cuenta y genera un link de invitación que se comparte manualmente (por WhatsApp), sin depender de email. Lo mismo para restablecer una contraseña olvidada.",
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
          <DialogTitle>Funcionalidades de Horarios</DialogTitle>
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
