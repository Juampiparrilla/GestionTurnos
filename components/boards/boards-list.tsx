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
        <div className="flex flex-col gap-4 max-md:flex-row-reverse max-md:gap-2">
          <FuncionalidadesDialog />
          {isAdmin && (
            <Button className="w-full max-md:w-auto max-md:flex-1" onClick={() => setCreateOpen(true)}>
              <Plus className="size-4" aria-hidden="true" />
              Crear horario
            </Button>
          )}
        </div>
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
      <div className="flex flex-col gap-4 max-md:flex-row-reverse max-md:gap-2">
        <FuncionalidadesDialog />
        {isAdmin && (
          <Button className="w-full max-md:w-auto max-md:flex-1" onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" aria-hidden="true" />
            Crear horario
          </Button>
        )}
      </div>
      <div className="grid gap-3">
        {boards.map((board) => (
          <BoardCard key={board.id} board={board} memberCount={memberCounts[board.id]} />
        ))}
      </div>
      <CreateBoardSheet open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
