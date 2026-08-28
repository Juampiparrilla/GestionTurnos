import Link from "next/link";
import { CalendarClock, Package, Users } from "lucide-react";
import { signOut } from "@/lib/auth/actions";
import { SignOutButton } from "@/components/sign-out-button";
import { LinkPendingSpinner } from "@/components/link-pending-spinner";
import { ROLE_LABEL, type Profile } from "@/types/profile";

export function NavHeader({ profile }: { profile: Profile }) {
  const isAdmin = profile.role === "ADMIN" || profile.role === "SUPER_ADMIN";

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
        <nav className="flex items-center gap-3">
          <Link
            href="/tableros"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <CalendarClock className="size-4" aria-hidden="true" />
            {isAdmin ? "Horarios" : "Mis horarios"}
            <LinkPendingSpinner />
          </Link>
          {isAdmin && (
            <Link
              href="/usuarios"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
              <Users className="size-4" aria-hidden="true" />
              Usuarios
              <LinkPendingSpinner />
            </Link>
          )}
          <Link
            href="/productos"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <Package className="size-4" aria-hidden="true" />
            Productos
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
