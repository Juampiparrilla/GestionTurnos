import { Skeleton } from "@/components/ui/skeleton";

// Mismo "molde" que ResumenCards + IngresosChart + ResumenTurnos, para que
// la pantalla no salte de un texto "Cargando..." a la grilla completa de
// golpe -- se nota mucho menos el cambio cuando el placeholder ya tiene la
// forma de lo que va a aparecer.
export function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <Skeleton className="h-[104px] w-full rounded-lg" />
        <div className="grid grid-cols-3 gap-2">
          <Skeleton className="h-[58px] rounded-lg" />
          <Skeleton className="h-[58px] rounded-lg" />
          <Skeleton className="h-[58px] rounded-lg" />
        </div>
      </div>
      <Skeleton className="h-56 w-full rounded-lg" />
      <Skeleton className="h-20 w-full rounded-lg" />
    </div>
  );
}
