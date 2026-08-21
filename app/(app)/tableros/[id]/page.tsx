import { notFound } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { BoardCalendar } from "@/components/boards/board-calendar";
import type { Board, BoardMember, OrgDirectoryEntry } from "@/types/board";
import type { ShiftConfiguration } from "@/types/shift";
import type { ShiftAssignment } from "@/types/assignment";
import type { Holiday } from "@/types/holiday";
import type { Sunday } from "@/types/sunday";

export default async function BoardCalendarPage({
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

  const { data: shifts } = await supabase
    .from("shift_configurations")
    .select("*")
    .eq("board_id", id)
    .eq("active", true)
    .order("sort_order");

  const { data: assignments } = await supabase
    .from("shift_assignments")
    .select("*")
    .eq("board_id", id)
    .is("valid_to", null);

  const { data: members } = await supabase
    .from("board_members")
    .select("*")
    .eq("board_id", id)
    .eq("active", true);

  const { data: directory } = await supabase.rpc("list_org_profiles_directory");

  const { data: holidays } = await supabase
    .from("holidays")
    .select("*")
    .eq("board_id", id);

  const { data: sundays } = await supabase
    .from("sundays")
    .select("*")
    .eq("board_id", id);

  return (
    <BoardCalendar
      board={board as Board}
      shifts={(shifts as ShiftConfiguration[] | null) ?? []}
      assignments={(assignments as ShiftAssignment[] | null) ?? []}
      members={(members as BoardMember[] | null) ?? []}
      directory={(directory as OrgDirectoryEntry[] | null) ?? []}
      holidays={(holidays as Holiday[] | null) ?? []}
      sundays={(sundays as Sunday[] | null) ?? []}
      isAdmin={isAdmin}
    />
  );
}
