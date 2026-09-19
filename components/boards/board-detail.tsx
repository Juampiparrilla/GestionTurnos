"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EditBoardSheet } from "./edit-board-sheet";
import { MemberManagement } from "./member-management";
import { ShiftsManagement } from "./shifts-management";
import { MenuSeccionesHorario } from "./menu-secciones-horario";
import type { Board, BoardMember, OrgDirectoryEntry } from "@/types/board";
import type { ShiftConfiguration } from "@/types/shift";

export function BoardDetail({
  board,
  members,
  directory,
  shifts,
  isAdmin,
}: {
  board: Board;
  members: BoardMember[];
  directory: OrgDirectoryEntry[];
  shifts: ShiftConfiguration[];
  isAdmin: boolean;
}) {
  const [editOpen, setEditOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold">{board.name}</h1>
            {!board.active && <Badge variant="outline">Inactivo</Badge>}
          </div>
          <p className="text-sm text-muted-foreground">Configuración del horario</p>
          {board.description && (
            <p className="mt-1 text-sm text-muted-foreground">{board.description}</p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {isAdmin && (
            <Button variant="outline" onClick={() => setEditOpen(true)}>
              Editar
            </Button>
          )}
          <MenuSeccionesHorario boardId={board.id} isAdmin={isAdmin} />
        </div>
      </div>

      <ShiftsManagement boardId={board.id} shifts={shifts} isAdmin={isAdmin} />

      <MemberManagement
        boardId={board.id}
        members={members}
        directory={directory}
        isAdmin={isAdmin}
      />

      {isAdmin && (
        <EditBoardSheet board={board} open={editOpen} onOpenChange={setEditOpen} />
      )}
    </div>
  );
}
