import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/require-role";
import { createClient } from "@/lib/supabase/server";
import { UsersList } from "@/components/users/users-list";
import type { Profile } from "@/types/profile";

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
      />
    </div>
  );
}
