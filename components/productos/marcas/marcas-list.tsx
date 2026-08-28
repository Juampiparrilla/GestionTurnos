"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Marca } from "@/types/marca";
import { MarcaRow } from "./marca-row";
import { CreateMarcaSheet } from "./create-marca-sheet";

export function MarcasList({ marcas }: { marcas: Marca[] }) {
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="space-y-4">
      <Button onClick={() => setCreateOpen(true)}>+ Crear marca</Button>
      {marcas.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          Todavía no hay marcas.
        </div>
      ) : (
        <div className="grid gap-3">
          {marcas.map((marca) => (
            <MarcaRow key={marca.id} marca={marca} />
          ))}
        </div>
      )}
      <CreateMarcaSheet open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
