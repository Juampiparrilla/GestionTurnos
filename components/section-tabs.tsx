"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LinkPendingSpinner } from "@/components/link-pending-spinner";
import { cn } from "@/lib/utils";

export type SectionTab = { href: string; label: string; exact?: boolean };

// Pestañas de las pantallas de una sección (Caja, Productos, un Horario):
// reemplazan al menú de la flecha para saltar entre pantallas hermanas. Si no
// entran todas en el ancho, se desplazan de costado y la activa queda a la vista.
export function SectionTabs({ label, tabs }: { label: string; tabs: SectionTab[] }) {
  const pathname = usePathname();
  const activaRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    activaRef.current?.scrollIntoView({ inline: "center", block: "nearest" });
  }, [pathname]);

  return (
    <nav aria-label={label} className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex w-max gap-2">
        {tabs.map(({ href, label: texto, exact }) => {
          const activa = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              ref={activa ? activaRef : undefined}
              aria-current={activa ? "page" : undefined}
              className={cn(
                "inline-flex h-9 items-center rounded-full border px-4 text-sm font-medium whitespace-nowrap transition-colors",
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
      </div>
    </nav>
  );
}
