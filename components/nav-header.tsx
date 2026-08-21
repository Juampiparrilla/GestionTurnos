import Link from "next/link";
import { signOut } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { ROLE_LABEL, type Profile } from "@/types/profile";

export function NavHeader({ profile }: { profile: Profile }) {
  const isAdmin = profile.role === "ADMIN" || profile.role === "SUPER_ADMIN";

  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <div>
          <Link href="/" className="font-semibold">
            Gestión de Turnos
          </Link>
          <p className="text-xs text-muted-foreground">
            {profile.full_name} · {ROLE_LABEL[profile.role]}
          </p>
        </div>
        <nav className="flex items-center gap-3">
          <Link
            href="/tableros"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            {isAdmin ? "Horarios" : "Mis horarios"}
          </Link>
          {isAdmin && (
            <Link
              href="/usuarios"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Usuarios
            </Link>
          )}
          <form action={signOut}>
            <Button type="submit" variant="ghost" size="sm">
              Salir
            </Button>
          </form>
        </nav>
      </div>
    </header>
  );
}
