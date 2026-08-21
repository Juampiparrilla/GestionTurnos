import { notFound } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { SundaysManagement } from "@/components/boards/sundays-management";
import type { Board, BoardMember, OrgDirectoryEntry } from "@/types/board";
import type { Sunday } from "@/types/sunday";

export default async function BoardSundaysPage({
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

  const { data: sundays } = await supabase
    .from("sundays")
    .select("*")
    .eq("board_id", id)
    .order("sunday_date", { ascending: false });

  const { data: members } = await supabase
    .from("board_members")
    .select("*")
    .eq("board_id", id)
    .eq("active", true);

  const { data: directory } = await supabase.rpc("list_org_profiles_directory");

  return (
    <SundaysManagement
      board={board as Board}
      sundays={(sundays as Sunday[] | null) ?? []}
      members={(members as BoardMember[] | null) ?? []}
      directory={(directory as OrgDirectoryEntry[] | null) ?? []}
      isAdmin={isAdmin}
    />
  );
}
