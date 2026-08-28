import { redirect } from "next/navigation";
import { requireSuperAdmin } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import { UsersList } from "@/components/users/users-list";
import type { Profile } from "@/types/profile";
import type { Invitation } from "@/types/invitation";

export default async function InactiveUsersPage() {
  const actor = await requireSuperAdmin();
  if (!actor) {
    redirect("/");
  }

  const supabase = await createClient();
  const { data: users } = await supabase
    .from("profiles")
    .select("*")
    .eq("active", false)
    .order("full_name");

  const { data: invitations } = await supabase
    .from("invitations")
    .select("*")
    .eq("kind", "ACTIVATION")
    .order("created_at", { ascending: false });

  const invitationByUser: Record<string, Invitation> = {};
  for (const invitation of (invitations as Invitation[] | null) ?? []) {
    if (!invitationByUser[invitation.user_id]) {
      invitationByUser[invitation.user_id] = invitation;
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Usuarios inactivos</h1>
        <p className="text-sm text-muted-foreground">
          Usuarios desactivados de tu organización.
        </p>
      </div>
      <UsersList
        users={(users as Profile[] | null) ?? []}
        actorRole={actor.role}
        actorId={actor.id}
        boardsByUser={{}}
        invitationByUser={invitationByUser}
        mode="inactive"
      />
    </div>
  );
}
