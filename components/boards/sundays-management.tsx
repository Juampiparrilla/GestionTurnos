"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LinkPendingSpinner } from "@/components/link-pending-spinner";
import { CreateSundaySheet } from "./create-sunday-sheet";
import { EditSundaySheet } from "./edit-sunday-sheet";
import { formatDateOnly, formatDateTime } from "@/lib/format-date";
import type { Board, BoardMember, OrgDirectoryEntry } from "@/types/board";
import type { Sunday } from "@/types/sunday";

export function SundaysManagement({
  board,
  sundays,
  members,
  directory,
  isAdmin,
}: {
  board: Board;
  sundays: Sunday[];
  members: BoardMember[];
  directory: OrgDirectoryEntry[];
  isAdmin: boolean;
}) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editingSunday, setEditingSunday] = useState<Sunday | null>(null);

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
          <h1 className="text-xl font-semibold">Domingos</h1>
          <p className="text-sm text-muted-foreground">{board.name}</p>
        </div>
        {isAdmin && <Button onClick={() => setCreateOpen(true)}>+ Asignar domingo</Button>}
      </div>

      {sundays.length === 0 ? (
        <p className="text-sm text-muted-foreground">Todavía no hay domingos asignados.</p>
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
              {sundays.map((sunday) => (
                <tr
                  key={sunday.id}
                  className={`border-b last:border-0 ${isAdmin ? "cursor-pointer hover:bg-muted/50" : ""}`}
                  onClick={isAdmin ? () => setEditingSunday(sunday) : undefined}
                >
                  <td className="p-2 whitespace-nowrap align-top">
                    {formatDateOnly(sunday.sunday_date)}
                  </td>
                  <td className="p-2 align-top">{nameOf(sunday.user_id)}</td>
                  <td className="p-2 align-top">
                    <p className="whitespace-nowrap">
                      {formatDateTime(sunday.updated_by ? sunday.updated_at : sunday.created_at)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {nameOf(sunday.updated_by ?? sunday.created_by)}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isAdmin && (
        <CreateSundaySheet
          boardId={board.id}
          members={memberDirectory}
          open={createOpen}
          onOpenChange={setCreateOpen}
        />
      )}

      {isAdmin && editingSunday && (
        <EditSundaySheet
          boardId={board.id}
          sunday={editingSunday}
          members={memberDirectory}
          onOpenChange={(open) => {
            if (!open) setEditingSunday(null);
          }}
        />
      )}
    </div>
  );
}
