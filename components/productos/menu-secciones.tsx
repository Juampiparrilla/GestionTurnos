"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, FileText, Home, LayoutGrid, Package, Percent, Tag, Truck } from "lucide-react";
import { LinkPendingSpinner } from "@/components/link-pending-spinner";
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
// entrar de nuevo) o al inicio (el hub de Productos), sin sumar una fila
// nueva de navegación en la pantalla -- ocupa el mismo lugar que ya
// ocupaba la flechita. No lista la sección en la que ya se está parado.
export function MenuSecciones() {
  const pathname = usePathname();

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
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem
          render={
            <Link href="/productos">
              <Home className="size-4" aria-hidden="true" />
              Inicio
              <LinkPendingSpinner />
            </Link>
          }
        />
        <DropdownMenuSeparator />
        {SECCIONES.filter(({ href }) => href !== pathname).map(({ href, label, icon: Icon }) => (
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
