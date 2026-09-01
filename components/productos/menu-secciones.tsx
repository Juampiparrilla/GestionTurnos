"use client";

import Link from "next/link";
import { ArrowLeft, FileText, Home, LayoutGrid, Package, Percent, Tag, Truck } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const SECCIONES = [
  { href: "/productos/productos", label: "Productos", icon: Package },
  { href: "/productos/marcas", label: "Marcas", icon: Tag },
  { href: "/productos/categorias", label: "Categorías", icon: LayoutGrid },
  { href: "/productos/proveedores", label: "Proveedores", icon: Truck },
  { href: "/productos/actualizar-costos", label: "Actualizar costos", icon: Percent },
  { href: "/productos/reportes", label: "Reportes", icon: FileText },
];

// Reemplaza el "volver" simple de cada pantalla de Productos por un menú:
// saltar directo a cualquier otra sección (antes había que volver al hub y
// entrar de nuevo) o al inicio, sin sumar una fila nueva de navegación en
// la pantalla -- ocupa el mismo lugar que ya ocupaba la flechita.
export function MenuSecciones() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            title="Ir a otra sección"
            aria-label="Ir a otra sección"
            className="inline-flex items-center text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-5" aria-hidden="true" />
          </button>
        }
      />
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          render={
            <Link href="/">
              <Home className="size-4" aria-hidden="true" />
              Inicio
            </Link>
          }
        />
        <DropdownMenuSeparator />
        {SECCIONES.map(({ href, label, icon: Icon }) => (
          <DropdownMenuItem
            key={href}
            render={
              <Link href={href}>
                <Icon className="size-4" aria-hidden="true" />
                {label}
              </Link>
            }
          />
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
