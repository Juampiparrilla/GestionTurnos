"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LinkPendingSpinner } from "@/components/link-pending-spinner";
import { cn } from "@/lib/utils";

export type SectionTab = { href: string; label: string; exact?: boolean };

// Pestañas livianas (solo texto, con una raya abajo en la activa) para saltar
// entre las pantallas de una sección (Caja, Productos, un Horario). Solo se
// muestran en el celular: en la compu se usa el menú de la flecha de siempre.
export function SectionTabs({ label, tabs }: { label: string; tabs: SectionTab[] }) {
  const pathname = usePathname();

  return (
    <nav aria-label={label} className="flex justify-between border-b md:hidden">
      {tabs.map(({ href, label: texto, exact }) => {
        const activa = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            aria-current={activa ? "page" : undefined}
            className={cn(
              "-mb-px border-b-2 px-0.5 py-3 text-sm whitespace-nowrap transition-colors",
              activa
                ? "border-brand-accent font-semibold text-foreground"
                : "border-transparent font-medium text-muted-foreground hover:text-foreground",
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
