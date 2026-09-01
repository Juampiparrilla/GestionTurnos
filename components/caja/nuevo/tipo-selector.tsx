"use client";

import { ArrowDown, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TipoMovimientoCaja } from "@/types/caja";

export function TipoSelector({
  value,
  onChange,
}: {
  value: TipoMovimientoCaja;
  onChange: (tipo: TipoMovimientoCaja) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <button
        type="button"
        onClick={() => onChange("ingreso")}
        className={cn(
          "flex flex-col items-center gap-1 rounded-lg border-2 p-5 text-center font-medium transition-colors",
          value === "ingreso"
            ? "border-emerald-600 bg-emerald-600 text-white"
            : "border-border bg-background text-foreground hover:bg-muted",
        )}
      >
        <ArrowUp className={cn("size-7", value !== "ingreso" && "text-emerald-600")} aria-hidden="true" />
        Ingreso
      </button>
      <button
        type="button"
        onClick={() => onChange("egreso")}
        className={cn(
          "flex flex-col items-center gap-1 rounded-lg border-2 p-5 text-center font-medium transition-colors",
          value === "egreso"
            ? "border-rose-600 bg-rose-600 text-white"
            : "border-border bg-background text-foreground hover:bg-muted",
        )}
      >
        <ArrowDown className={cn("size-7", value !== "egreso" && "text-rose-600")} aria-hidden="true" />
        Egreso
      </button>
    </div>
  );
}
