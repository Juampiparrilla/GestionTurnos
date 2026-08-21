import { notFound } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { HolidaysManagement } from "@/components/boards/holidays-management";
import type { Board, BoardMember, OrgDirectoryEntry } from "@/types/board";
import type { Holiday } from "@/types/holiday";

export default async function BoardHolidaysPage({
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

  const { data: holidays } = await supabase
    .from("holidays")
    .select("*")
    .eq("board_id", id)
    .order("holiday_date", { ascending: false });

  const { data: members } = await supabase
    .from("board_members")
    .select("*")
    .eq("board_id", id)
    .eq("active", true);

  const { data: directory } = await supabase.rpc("list_org_profiles_directory");

  return (
    <HolidaysManagement
      board={board as Board}
      holidays={(holidays as Holiday[] | null) ?? []}
      members={(members as BoardMember[] | null) ?? []}
      directory={(directory as OrgDirectoryEntry[] | null) ?? []}
      isAdmin={isAdmin}
    />
  );
}
