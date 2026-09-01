import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/session";
import { getCurrentPlatformAdmin } from "@/lib/auth/platform-session";
import { signOut } from "@/lib/auth/actions";
import { NavHeader } from "@/components/nav-header";
import { RefreshOnFocus } from "@/components/refresh-on-focus";

export const runtime = "nodejs";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const profile = await getCurrentProfile();

  if (!profile) {
    // Un platform admin está autenticado pero no tiene profile: lo
    // mandamos a su área en vez de reenviarlo a /login (evita un
    // loop, ya que /login redirige a "/" a cualquier user logueado).
    const platformAdmin = await getCurrentPlatformAdmin();
    redirect(platformAdmin ? "/platform" : "/login");
  }

  if (!profile.active) {
    await signOut();
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <RefreshOnFocus />
      <NavHeader profile={profile} />
      <main className="mx-auto max-w-3xl px-4 py-6">{children}</main>
    </div>
  );
}
