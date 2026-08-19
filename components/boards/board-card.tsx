import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { Board } from "@/types/board";

export function BoardCard({
  board,
  memberCount,
}: {
  board: Board;
  memberCount?: number;
}) {
  return (
    <Link
      href={`/tableros/${board.id}`}
      className="flex items-center justify-between rounded-lg border bg-background p-4 shadow-sm transition-colors hover:bg-muted/50"
    >
      <div className="min-w-0">
        <p className="truncate font-medium">{board.name}</p>
        {board.description && (
          <p className="truncate text-sm text-muted-foreground">{board.description}</p>
        )}
        {typeof memberCount === "number" && (
          <p className="text-xs text-muted-foreground">
            {memberCount} {memberCount === 1 ? "persona" : "personas"}
          </p>
        )}
      </div>
      {!board.active && (
        <Badge variant="outline" className="shrink-0">
          Inactivo
        </Badge>
      )}
    </Link>
  );
}
