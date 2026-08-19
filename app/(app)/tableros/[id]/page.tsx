import { notFound } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { BoardDetail } from "@/components/boards/board-detail";
import type { Board, BoardMember, OrgDirectoryEntry } from "@/types/board";

export default async function BoardDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  const isAdmin = profile?.role === "ADMIN" || profile?.role === "SUPER_ADMIN";

  const supabase = await createClient();

  const { data: board } = await supabase.from("boards").select("*").eq("id", id).maybeSingle();

  if (!board) {
    notFound();
  }

  const { data: members } = await supabase
    .from("board_members")
    .select("*")
    .eq("board_id", id)
    .eq("active", true);

  const { data: directory } = await supabase.rpc("list_org_profiles_directory");

  return (
    <BoardDetail
      board={board as Board}
      members={(members as BoardMember[] | null) ?? []}
      directory={(directory as OrgDirectoryEntry[] | null) ?? []}
      isAdmin={isAdmin}
    />
  );
}
