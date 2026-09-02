"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, HandCoins, Home, List, Tags } from "lucide-react";
import { LinkPendingSpinner } from "@/components/link-pending-spinner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function MenuSecciones({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();

  const secciones = [
    { href: "/caja/movimientos", label: "Movimientos", icon: List },
    ...(isAdmin
      ? [
          { href: "/caja/etiquetas", label: "Etiquetas", icon: Tags },
          { href: "/caja/deudas", label: "Deudas", icon: HandCoins },
        ]
      : []),
  ];

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
            <Link href="/caja">
              <Home className="size-4" aria-hidden="true" />
              Dashboard
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
