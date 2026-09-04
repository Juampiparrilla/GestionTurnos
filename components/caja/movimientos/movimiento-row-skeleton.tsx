import { Skeleton } from "@/components/ui/skeleton";

export function MovimientoRowSkeleton() {
  return (
    <div className="rounded-lg border bg-background p-3 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/3" />
        </div>
        <Skeleton className="h-5 w-16 shrink-0" />
      </div>
    </div>
  );
}
