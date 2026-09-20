"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { CalendarClock, DollarSign, House, Menu, Package } from "lucide-react";
import { LinkPendingSpinner } from "@/components/link-pending-spinner";
import { cn } from "@/lib/utils";

const ITEMS = (isAdmin: boolean) => [
  { href: "/", label: "Inicio", icon: House, activo: (p: string) => p === "/" },
  { href: "/tableros", label: "Horarios", icon: CalendarClock, activo: (p: string) => p.startsWith("/tableros") },
  // Un no-admin no tiene el listado: /productos le muestra un aviso.
  { href: isAdmin ? "/productos/productos" : "/productos", label: "Productos", icon: Package, activo: (p: string) => p.startsWith("/productos") },
  { href: "/caja", label: "Caja", icon: DollarSign, activo: (p: string) => p.startsWith("/caja") },
  {
    href: "/mas",
    label: "Más",
    icon: Menu,
    activo: (p: string) => p.startsWith("/mas") || p.startsWith("/usuarios"),
  },
];

export function BottomNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const [escribiendo, setEscribiendo] = useState(false);

  // Con el teclado abierto se esconde la barra: si no, queda apoyada arriba del
  // teclado y le saca lugar al campo que se está escribiendo.
  useEffect(() => {
    const esCampo = (el: EventTarget | null) =>
      el instanceof HTMLElement &&
      el.matches("input:not([type=checkbox]):not([type=radio]):not([type=button]):not([type=submit]), textarea");
    const alEntrar = (e: FocusEvent) => {
      if (esCampo(e.target)) setEscribiendo(true);
    };
    const alSalir = () => setEscribiendo(false);
    document.addEventListener("focusin", alEntrar);
    document.addEventListener("focusout", alSalir);
    return () => {
      document.removeEventListener("focusin", alEntrar);
      document.removeEventListener("focusout", alSalir);
    };
  }, []);

  return (
    <nav
      aria-label="Secciones"
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t bg-background pb-[env(safe-area-inset-bottom)] md:hidden",
        escribiendo && "max-md:hidden",
      )}
    >
      <div className="mx-auto grid max-w-3xl grid-cols-5">
        {ITEMS(isAdmin).map(({ href, label, icon: Icon, activo }) => {
          const activa = activo(pathname);
          return (
            <Link
              key={href}
              href={href}
              aria-current={activa ? "page" : undefined}
              className={cn(
                "flex flex-col items-center justify-center gap-1 py-2 text-[11px] transition-colors",
                activa
                  ? "font-bold text-foreground shadow-[inset_0_3px_0_var(--brand-accent)]"
                  : "font-medium text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="size-[22px]" aria-hidden="true" />
              {label}
              <LinkPendingSpinner />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
