"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BoardCard } from "./board-card";
import { CreateBoardSheet } from "./create-board-sheet";
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
        {isAdmin && <Button onClick={() => setCreateOpen(true)}>+ Crear tablero</Button>}
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          {isAdmin
            ? "Todavía no tenés tableros. Creá tu primer tablero para comenzar."
            : "No tenés tableros asignados todavía."}
        </div>
        <CreateBoardSheet open={createOpen} onOpenChange={setCreateOpen} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {isAdmin && <Button onClick={() => setCreateOpen(true)}>+ Crear tablero</Button>}
      <div className="grid gap-3">
        {boards.map((board) => (
          <BoardCard key={board.id} board={board} memberCount={memberCounts[board.id]} />
        ))}
      </div>
      <CreateBoardSheet open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
