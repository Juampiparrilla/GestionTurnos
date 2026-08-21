"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LinkPendingSpinner } from "@/components/link-pending-spinner";
import { CreateHolidaySheet } from "./create-holiday-sheet";
import { EditHolidaySheet } from "./edit-holiday-sheet";
import { formatDateOnly, formatDateTime } from "@/lib/format-date";
import type { Board, BoardMember, OrgDirectoryEntry } from "@/types/board";
import type { Holiday } from "@/types/holiday";

export function HolidaysManagement({
  board,
  holidays,
  members,
  directory,
  isAdmin,
}: {
  board: Board;
  holidays: Holiday[];
  members: BoardMember[];
  directory: OrgDirectoryEntry[];
  isAdmin: boolean;
}) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null);

  const directoryById = new Map(directory.map((d) => [d.id, d]));
  const memberDirectory = members
    .map((m) => directoryById.get(m.user_id))
    .filter((d): d is OrgDirectoryEntry => !!d)
    .sort((a, b) => a.full_name.localeCompare(b.full_name));

  function nameOf(id: string | null): string {
    if (!id) return "—";
    return directoryById.get(id)?.full_name ?? "—";
  }

  return (
    <div className="space-y-6">
      <Link
        href={`/tableros/${board.id}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Volver al calendario
        <LinkPendingSpinner />
      </Link>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Feriados</h1>
          <p className="text-sm text-muted-foreground">{board.name}</p>
        </div>
        {isAdmin && <Button onClick={() => setCreateOpen(true)}>+ Asignar feriado</Button>}
      </div>

      {holidays.length === 0 ? (
        <p className="text-sm text-muted-foreground">Todavía no hay feriados asignados.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-2 text-left font-medium">Fecha</th>
                <th className="p-2 text-left font-medium">Persona asignada</th>
                <th className="p-2 text-left font-medium">Última modificación</th>
              </tr>
            </thead>
            <tbody>
              {holidays.map((holiday) => (
                <tr
                  key={holiday.id}
                  className={`border-b last:border-0 ${isAdmin ? "cursor-pointer hover:bg-muted/50" : ""}`}
                  onClick={isAdmin ? () => setEditingHoliday(holiday) : undefined}
                >
                  <td className="p-2 whitespace-nowrap align-top">
                    {formatDateOnly(holiday.holiday_date)}
                  </td>
                  <td className="p-2 align-top">{nameOf(holiday.user_id)}</td>
                  <td className="p-2 align-top">
                    <p className="whitespace-nowrap">
                      {formatDateTime(holiday.updated_by ? holiday.updated_at : holiday.created_at)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {nameOf(holiday.updated_by ?? holiday.created_by)}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isAdmin && (
        <CreateHolidaySheet
          boardId={board.id}
          members={memberDirectory}
          open={createOpen}
          onOpenChange={setCreateOpen}
        />
      )}

      {isAdmin && editingHoliday && (
        <EditHolidaySheet
          boardId={board.id}
          holiday={editingHoliday}
          members={memberDirectory}
          onOpenChange={(open) => {
            if (!open) setEditingHoliday(null);
          }}
        />
      )}
    </div>
  );
}
