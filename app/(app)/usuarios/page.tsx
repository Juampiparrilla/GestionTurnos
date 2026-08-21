import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import { UsersList } from "@/components/users/users-list";
import type { Profile } from "@/types/profile";
import type { Invitation } from "@/types/invitation";

export default async function UsuariosPage() {
  const actor = await requireAdmin();
  if (!actor) {
    redirect("/");
  }

  const supabase = await createClient();
  const { data: users } = await supabase.from("profiles").select("*").order("full_name");

  const { data: activeAssignments } = await supabase
    .from("shift_assignments")
    .select("user_id, board:boards(name)")
    .eq("status", "EMPLEADO")
    .is("valid_to", null);

  const boardsByUser: Record<string, string[]> = {};
  for (const row of activeAssignments ?? []) {
    const boardEntry = row.board as { name: string }[] | { name: string } | null;
    const boardName = Array.isArray(boardEntry) ? boardEntry[0]?.name : boardEntry?.name;
    if (!row.user_id || !boardName) continue;
    const existing = boardsByUser[row.user_id] ?? [];
    if (!existing.includes(boardName)) {
      boardsByUser[row.user_id] = [...existing, boardName];
    }
  }

  const { data: invitations } = await supabase
    .from("invitations")
    .select("*")
    .order("created_at", { ascending: false });

  // Ya vienen ordenadas por mas reciente primero: la primera que
  // encontramos para cada usuario es la relevante para mostrar.
  const invitationByUser: Record<string, Invitation> = {};
  for (const invitation of (invitations as Invitation[] | null) ?? []) {
    if (!invitationByUser[invitation.user_id]) {
      invitationByUser[invitation.user_id] = invitation;
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Usuarios</h1>
        <p className="text-sm text-muted-foreground">
          Gestioná los usuarios de tu organización.
        </p>
      </div>
      <UsersList
        users={(users as Profile[] | null) ?? []}
        actorRole={actor.role}
        actorId={actor.id}
        boardsByUser={boardsByUser}
        invitationByUser={invitationByUser}
      />
    </div>
  );
}
