import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { DashboardView } from "@/components/caja/dashboard/dashboard-view";
import type { Board } from "@/types/board";
import type { ShiftConfiguration } from "@/types/shift";

export default async function CajaDashboardPage() {
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect("/login");
  }

  const isAdmin = profile.role === "ADMIN" || profile.role === "SUPER_ADMIN";
  const supabase = await createClient();

  let boards: Board[] = [];
  if (isAdmin) {
    const { data } = await supabase.from("boards").select("*").order("name");
    boards = (data as Board[] | null) ?? [];
  } else {
    const { data } = await supabase
      .from("board_members")
      .select("boards(*)")
      .eq("user_id", profile.id)
      .eq("active", true);
    boards = ((data ?? []) as unknown as { boards: Board }[]).map((m) => m.boards).filter(Boolean);
  }

  const boardIds = boards.map((b) => b.id);
  const { data: shifts } =
    boardIds.length > 0
      ? await supabase.from("shift_configurations").select("*").in("board_id", boardIds).order("sort_order")
      : { data: [] as ShiftConfiguration[] };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Caja</h1>
      <DashboardView boards={boards} shifts={(shifts as ShiftConfiguration[] | null) ?? []} isAdmin={isAdmin} />
    </div>
  );
}
