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
      />
    </div>
  );
}
