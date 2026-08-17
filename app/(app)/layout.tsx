import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/session";
import { signOut } from "@/lib/auth/actions";
import { NavHeader } from "@/components/nav-header";

export const runtime = "nodejs";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  if (!profile.active) {
    await signOut();
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <NavHeader profile={profile} />
      <main className="mx-auto max-w-3xl px-4 py-6">{children}</main>
    </div>
  );
}
