"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/productos/search-input";
import type { Categoria } from "@/types/categoria";
import { CategoriaRow } from "./categoria-row";
import { CreateCategoriaSheet } from "./create-categoria-sheet";

export function CategoriasList({ categorias }: { categorias: Categoria[] }) {
  const [createOpen, setCreateOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filtradas = categorias.filter((c) => c.nombre.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <div className="space-y-4">
      <SearchInput value={query} onChange={setQuery} placeholder="Buscar categoría..." />
      <Button onClick={() => setCreateOpen(true)}>+ Crear categoría</Button>
      {filtradas.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          {categorias.length === 0 ? "Todavía no hay categorías." : "No se encontraron categorías."}
        </div>
      ) : (
        <div className="grid gap-3">
          {filtradas.map((categoria, index) => (
            <CategoriaRow key={categoria.id} categoria={categoria} numero={index + 1} />
          ))}
        </div>
      )}
      <CreateCategoriaSheet open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
