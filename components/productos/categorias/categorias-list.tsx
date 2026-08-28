"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Categoria } from "@/types/categoria";
import { CategoriaRow } from "./categoria-row";
import { CreateCategoriaSheet } from "./create-categoria-sheet";

export function CategoriasList({ categorias }: { categorias: Categoria[] }) {
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="space-y-4">
      <Button onClick={() => setCreateOpen(true)}>+ Crear categoría</Button>
      {categorias.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          Todavía no hay categorías.
        </div>
      ) : (
        <div className="grid gap-3">
          {categorias.map((categoria) => (
            <CategoriaRow key={categoria.id} categoria={categoria} />
          ))}
        </div>
      )}
      <CreateCategoriaSheet open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
