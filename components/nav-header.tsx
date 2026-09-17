"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarClock, DollarSign, Package, Users } from "lucide-react";
import { signOut } from "@/lib/auth/actions";
import { SignOutButton } from "@/components/sign-out-button";
import { LinkPendingSpinner } from "@/components/link-pending-spinner";
import { cn } from "@/lib/utils";
import { ROLE_LABEL, type Profile } from "@/types/profile";

export function NavHeader({ profile }: { profile: Profile }) {
  const pathname = usePathname();
  const isAdmin = profile.role === "ADMIN" || profile.role === "SUPER_ADMIN";
  const isSuperAdmin = profile.role === "SUPER_ADMIN";

  const linkClass = (activo: boolean) =>
    cn(
      "inline-flex items-center rounded-md p-1.5 text-muted-foreground transition-colors hover:text-foreground",
      activo && "bg-foreground text-background hover:text-background",
    );

  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <div>
          <Link href="/" className="font-semibold">
            Mi Negocio
          </Link>
          <p className="text-xs text-muted-foreground">
            {profile.full_name} · {ROLE_LABEL[profile.role]}
          </p>
        </div>
        <nav className="flex items-center gap-2">
          {isSuperAdmin && (
            <Link
              href="/usuarios"
              title="Usuarios"
              aria-label="Usuarios"
              className={linkClass(pathname.startsWith("/usuarios"))}
            >
              <Users className="size-5" aria-hidden="true" />
              <LinkPendingSpinner />
            </Link>
          )}
          <Link
            href="/tableros"
            title={isAdmin ? "Horarios" : "Mis horarios"}
            aria-label={isAdmin ? "Horarios" : "Mis horarios"}
            className={linkClass(pathname.startsWith("/tableros"))}
          >
            <CalendarClock className="size-5" aria-hidden="true" />
            <LinkPendingSpinner />
          </Link>
          <Link
            href="/productos"
            title="Productos"
            aria-label="Productos"
            className={linkClass(pathname.startsWith("/productos"))}
          >
            <Package className="size-5" aria-hidden="true" />
            <LinkPendingSpinner />
          </Link>
          <Link
            href="/caja"
            title="Caja"
            aria-label="Caja"
            className={linkClass(pathname.startsWith("/caja"))}
          >
            <DollarSign className="size-5" aria-hidden="true" />
            <LinkPendingSpinner />
          </Link>
          <form action={signOut}>
            <SignOutButton />
          </form>
        </nav>
      </div>
    </header>
  );
}
