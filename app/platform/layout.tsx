import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentPlatformAdmin } from "@/lib/auth/platform-session";
import { getCurrentProfile } from "@/lib/auth/session";
import { signOut } from "@/lib/auth/actions";
import { SignOutButton } from "@/components/sign-out-button";

export const runtime = "nodejs";

export default async function PlatformLayout({ children }: { children: ReactNode }) {
  const platformAdmin = await getCurrentPlatformAdmin();

  if (!platformAdmin) {
    // Un usuario normal de una organización está autenticado pero no
    // es platform admin: lo mandamos a su app en vez de a /login.
    const profile = await getCurrentProfile();
    redirect(profile ? "/" : "/login");
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <div>
            <Link href="/platform" className="font-semibold">
              Administración de Plataforma
            </Link>
            <p className="text-xs text-muted-foreground">{platformAdmin.full_name}</p>
          </div>
          <form action={signOut}>
            <SignOutButton />
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-6">{children}</main>
    </div>
  );
}
