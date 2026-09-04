import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarClock, DollarSign, Package, Users } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { LinkPendingSpinner } from "@/components/link-pending-spinner";
import { QuienTrabajaHoy } from "@/components/home/quien-trabaja-hoy";
import { CajaHoyCard } from "@/components/home/caja-hoy-card";
import { hoyISO } from "@/lib/caja/periodos";
import { todayDayOfWeek } from "@/types/assignment";
import { ROLE_LABEL } from "@/types/profile";
import type { Board, OrgDirectoryEntry } from "@/types/board";
import type { ShiftConfiguration } from "@/types/shift";
import type { ShiftAssignment } from "@/types/assignment";

export default async function HomePage() {
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect("/login");
  }

  const isAdmin = profile.role === "ADMIN" || profile.role === "SUPER_ADMIN";
  const isSuperAdmin = profile.role === "SUPER_ADMIN";
  const supabase = await createClient();

  let boards: Board[] = [];
  if (isAdmin) {
    const { data } = await supabase.from("boards").select("*").eq("active", true).order("name");
    boards = (data as Board[] | null) ?? [];
  } else {
    const { data } = await supabase
      .from("board_members")
      .select("boards(*)")
      .eq("user_id", profile.id)
      .eq("active", true);
    boards = ((data ?? []) as unknown as { boards: Board }[])
      .map((m) => m.boards)
      .filter((b): b is Board => Boolean(b) && b.active);
  }

  const boardIds = boards.map((b) => b.id);
  const hoy = hoyISO();

  const [{ data: shifts }, { data: assignments }, { data: directory }, { data: movimientosHoy }] = await Promise.all([
    boardIds.length > 0
      ? supabase.from("shift_configurations").select("*").in("board_id", boardIds).eq("active", true).order("sort_order")
      : Promise.resolve({ data: [] as ShiftConfiguration[] }),
    boardIds.length > 0
      ? supabase
          .from("shift_assignments")
          .select("*")
          .in("board_id", boardIds)
          .eq("day_of_week", todayDayOfWeek())
          .is("valid_to", null)
      : Promise.resolve({ data: [] as ShiftAssignment[] }),
    supabase.rpc("list_org_profiles_directory"),
    boardIds.length > 0
      ? supabase
          .from("caja_movimientos")
          .select("tipo, monto")
          .in("board_id", boardIds)
          .eq("fecha", hoy)
          .eq("estado", "activo")
      : Promise.resolve({ data: [] as { tipo: string; monto: number }[] }),
  ]);

  const ingresosHoy = (movimientosHoy ?? [])
    .filter((m) => m.tipo === "ingreso")
    .reduce((acc, m) => acc + m.monto, 0);
  const egresosHoy = (movimientosHoy ?? [])
    .filter((m) => m.tipo === "egreso")
    .reduce((acc, m) => acc + m.monto, 0);

  const accesos = [
    { href: "/tableros", label: "Horarios", icon: CalendarClock },
    { href: "/productos", label: "Productos", icon: Package },
    { href: "/caja", label: "Caja", icon: DollarSign },
    ...(isSuperAdmin ? [{ href: "/usuarios", label: "Usuarios", icon: Users }] : []),
  ];
  // Con cantidad impar de accesos, el último queda solo en la grilla de 2
  // columnas y le sobra la mitad de la fila -- se saca y se muestra abajo
  // ocupando todo el ancho, en vez de dejar un hueco vacío al lado.
  const accesosImpares = accesos.length % 2 !== 0;
  const accesosEnGrilla = accesosImpares ? accesos.slice(0, -1) : accesos;
  const accesoSuelto = accesosImpares ? accesos[accesos.length - 1] : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Hola, {profile.full_name}</h1>
        <p className="text-sm text-muted-foreground">{ROLE_LABEL[profile.role]}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {accesosEnGrilla.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center justify-center gap-2 rounded-lg bg-zinc-900 p-8 text-center text-white shadow-sm transition-colors hover:bg-zinc-800"
          >
            <Icon className="size-6" aria-hidden="true" />
            <span className="font-medium">{label}</span>
            <LinkPendingSpinner />
          </Link>
        ))}
      </div>

      {accesoSuelto && (
        <Link
          href={accesoSuelto.href}
          className="flex items-center justify-center gap-2 rounded-lg bg-zinc-900 p-4 text-center text-white shadow-sm transition-colors hover:bg-zinc-800"
        >
          <accesoSuelto.icon className="size-5" aria-hidden="true" />
          <span className="font-medium">{accesoSuelto.label}</span>
          <LinkPendingSpinner />
        </Link>
      )}

      <QuienTrabajaHoy
        boards={boards}
        shifts={(shifts as ShiftConfiguration[] | null) ?? []}
        assignments={(assignments as ShiftAssignment[] | null) ?? []}
        directory={(directory as OrgDirectoryEntry[] | null) ?? []}
      />

      {boardIds.length > 0 && <CajaHoyCard ingresos={ingresosHoy} egresos={egresosHoy} />}
    </div>
  );
}
