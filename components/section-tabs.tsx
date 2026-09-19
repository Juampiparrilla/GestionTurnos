"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LinkPendingSpinner } from "@/components/link-pending-spinner";
import { cn } from "@/lib/utils";

export type SectionTab = { href: string; label: string; exact?: boolean };

// Pestañas de las pantallas de una sección (Caja, Productos, un Horario):
// reemplazan al menú de la flecha para saltar entre pantallas hermanas. Van en
// grilla (no en una fila que se desliza) para que se vean todas de un vistazo:
// hasta 3 en una fila, 4 en 2x2, y más de 4 en filas de 3.
export function SectionTabs({ label, tabs }: { label: string; tabs: SectionTab[] }) {
  const pathname = usePathname();
  const columnas = tabs.length <= 3 ? tabs.length : tabs.length === 4 ? 2 : 3;

  return (
    <nav aria-label={label} className="grid gap-2 md:hidden" style={{ gridTemplateColumns: `repeat(${columnas}, minmax(0, 1fr))` }}>
      {tabs.map(({ href, label: texto, exact }) => {
        const activa = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            aria-current={activa ? "page" : undefined}
            className={cn(
              "inline-flex h-9 items-center justify-center rounded-full border px-2 text-sm font-medium whitespace-nowrap transition-colors",
              activa
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-background text-foreground/80 hover:bg-muted",
            )}
          >
            {texto}
            <LinkPendingSpinner />
          </Link>
        );
      })}
    </nav>
  );
}
