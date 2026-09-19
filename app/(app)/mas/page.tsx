import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronRight, Users } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth/session";
import { signOut } from "@/lib/auth/actions";
import { LinkPendingSpinner } from "@/components/link-pending-spinner";
import { SignOutButton } from "@/components/sign-out-button";
import { ROLE_LABEL } from "@/types/profile";

function iniciales(nombre: string) {
  return nombre
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase())
    .join("");
}

export default async function MasPage() {
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect("/login");
  }

  const isSuperAdmin = profile.role === "SUPER_ADMIN";

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Más</h1>

      <div className="flex items-center gap-3 rounded-2xl border bg-background p-4 shadow-sm">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold">
          {iniciales(profile.full_name)}
        </div>
        <div className="min-w-0">
          <p className="truncate font-semibold">{profile.full_name}</p>
          <p className="text-sm text-muted-foreground">{ROLE_LABEL[profile.role]}</p>
        </div>
      </div>

      {isSuperAdmin && (
        <div className="overflow-hidden rounded-2xl border bg-background shadow-sm">
          <Link href="/usuarios" className="flex items-center gap-3 p-4 text-sm font-medium hover:bg-muted/50">
            <Users className="size-5" aria-hidden="true" />
            <span className="flex-1">Usuarios</span>
            <ChevronRight className="size-4 text-muted-foreground" aria-hidden="true" />
            <LinkPendingSpinner />
          </Link>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border bg-background shadow-sm">
        <form action={signOut}>
          <SignOutButton />
        </form>
      </div>
    </div>
  );
}
