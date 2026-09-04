"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, CalendarClock, Home, PartyPopper, Settings, Sun } from "lucide-react";
import { LinkPendingSpinner } from "@/components/link-pending-spinner";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

// `trigger` "plain": flecha suelta como ya usan Productos/Caja (junto a un
// título). "icon-button": mismo botón outline cuadrado que Descargar/
// Configurar en el calendario, para que las tres queden en una sola fila.
export function MenuSeccionesHorario({
  boardId,
  isAdmin,
  trigger = "plain",
}: {
  boardId: string;
  isAdmin: boolean;
  trigger?: "plain" | "icon-button";
}) {
  const pathname = usePathname();

  const secciones = [
    { href: `/tableros/${boardId}`, label: "Calendario", icon: CalendarClock },
    ...(isAdmin
      ? [{ href: `/tableros/${boardId}/configuracion`, label: "Configuración", icon: Settings }]
      : []),
    { href: `/tableros/${boardId}/domingos`, label: "Domingos", icon: Sun },
    { href: `/tableros/${boardId}/feriados`, label: "Feriados", icon: PartyPopper },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            title="Ir a otra sección de este horario"
            aria-label="Ir a otra sección de este horario"
            className={cn(
              trigger === "icon-button"
                ? buttonVariants({ variant: "outline", size: "icon" })
                : "inline-flex items-center text-muted-foreground hover:text-foreground",
            )}
          >
            <ArrowLeft className={trigger === "icon-button" ? "size-4" : "size-5"} aria-hidden="true" />
          </button>
        }
      />
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem
          render={
            <Link href="/tableros">
              <Home className="size-4" aria-hidden="true" />
              Volver a Horarios
              <LinkPendingSpinner />
            </Link>
          }
        />
        <DropdownMenuSeparator />
        {secciones
          .filter(({ href }) => href !== pathname)
          .map(({ href, label, icon: Icon }) => (
            <DropdownMenuItem
              key={href}
              render={
                <Link href={href}>
                  <Icon className="size-4" aria-hidden="true" />
                  {label}
                  <LinkPendingSpinner />
                </Link>
              }
            />
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
