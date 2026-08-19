import { getCurrentProfile } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { BoardsList } from "@/components/boards/boards-list";
import type { Board } from "@/types/board";

export default async function TablerosPage() {
  const profile = await getCurrentProfile();
  const isAdmin = profile?.role === "ADMIN" || profile?.role === "SUPER_ADMIN";

  const supabase = await createClient();
  const { data: boards } = await supabase.from("boards").select("*").order("name");

  const boardList = (boards as Board[] | null) ?? [];

  let memberCounts: Record<string, number> = {};
  if (isAdmin && boardList.length > 0) {
    const { data: members } = await supabase
      .from("board_members")
      .select("board_id")
      .eq("active", true)
      .in(
        "board_id",
        boardList.map((b) => b.id),
      );

    memberCounts = (members ?? []).reduce<Record<string, number>>((acc, m) => {
      acc[m.board_id] = (acc[m.board_id] ?? 0) + 1;
      return acc;
    }, {});
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">{isAdmin ? "Tableros" : "Mis tableros"}</h1>
        <p className="text-sm text-muted-foreground">
          {isAdmin
            ? "Gestioná los locales de tu organización."
            : "Los tableros a los que estás asignado."}
        </p>
      </div>
      <BoardsList boards={boardList} memberCounts={memberCounts} isAdmin={isAdmin} />
    </div>
  );
}
