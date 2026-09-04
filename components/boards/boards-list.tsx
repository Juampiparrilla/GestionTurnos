"use client";

import { useState } from "react";
import { CalendarClock, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { BoardCard } from "./board-card";
import { CreateBoardSheet } from "./create-board-sheet";
import { FuncionalidadesDialog } from "./funcionalidades-dialog";
import type { Board } from "@/types/board";

export function BoardsList({
  boards,
  memberCounts,
  isAdmin,
}: {
  boards: Board[];
  memberCounts: Record<string, number>;
  isAdmin: boolean;
}) {
  const [createOpen, setCreateOpen] = useState(false);

  if (boards.length === 0) {
    return (
      <div className="space-y-4">
        <FuncionalidadesDialog />
        {isAdmin && (
          <Button className="w-full" onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" aria-hidden="true" />
            Crear horario
          </Button>
        )}
        <EmptyState icon={CalendarClock}>
          {isAdmin
            ? "Todavía no tenés horarios. Creá tu primer horario para comenzar."
            : "No tenés horarios asignados todavía."}
        </EmptyState>
        <CreateBoardSheet open={createOpen} onOpenChange={setCreateOpen} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <FuncionalidadesDialog />
      {isAdmin && (
        <Button className="w-full" onClick={() => setCreateOpen(true)}>
          <Plus className="size-4" aria-hidden="true" />
          Crear horario
        </Button>
      )}
      <div className="grid gap-3">
        {boards.map((board) => (
          <BoardCard key={board.id} board={board} memberCount={memberCounts[board.id]} />
        ))}
      </div>
      <CreateBoardSheet open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
