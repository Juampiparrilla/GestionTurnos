"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarClock, DollarSign, House, Menu, Package } from "lucide-react";
import { LinkPendingSpinner } from "@/components/link-pending-spinner";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/", label: "Inicio", icon: House, activo: (p: string) => p === "/" },
  { href: "/tableros", label: "Horarios", icon: CalendarClock, activo: (p: string) => p.startsWith("/tableros") },
  { href: "/productos", label: "Productos", icon: Package, activo: (p: string) => p.startsWith("/productos") },
  { href: "/caja", label: "Caja", icon: DollarSign, activo: (p: string) => p.startsWith("/caja") },
  {
    href: "/mas",
    label: "Más",
    icon: Menu,
    activo: (p: string) => p.startsWith("/mas") || p.startsWith("/usuarios"),
  },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Secciones"
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-background pb-[env(safe-area-inset-bottom)]"
    >
      <div className="mx-auto grid max-w-3xl grid-cols-5">
        {ITEMS.map(({ href, label, icon: Icon, activo }) => {
          const activa = activo(pathname);
          return (
            <Link
              key={href}
              href={href}
              aria-current={activa ? "page" : undefined}
              className={cn(
                "flex flex-col items-center justify-center gap-1 py-2 text-[11px] transition-colors",
                activa ? "font-bold text-foreground" : "font-medium text-muted-foreground hover:text-foreground",
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
