"use client";

import { useState } from "react";
import { LayoutGrid, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InfoPantalla } from "@/components/info-pantalla";
import { SearchInput } from "@/components/productos/search-input";
import { EmptyState } from "@/components/empty-state";
import type { Categoria } from "@/types/categoria";
import { CategoriaRow } from "./categoria-row";
import { CreateCategoriaSheet } from "./create-categoria-sheet";

export function CategoriasList({ categorias, descripcion }: { categorias: Categoria[]; descripcion: string }) {
  const [createOpen, setCreateOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filtradas = categorias.filter((c) => c.nombre.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground max-md:hidden">{descripcion}</p>
      <div className="flex gap-2">
        <Button onClick={() => setCreateOpen(true)} className="flex-1">
          <Plus className="size-4" aria-hidden="true" />
          Crear categoría
        </Button>
        <InfoPantalla titulo="Categorías" texto={descripcion} />
      </div>
      <SearchInput value={query} onChange={setQuery} placeholder="Buscar categoría..." />
      {filtradas.length === 0 ? (
        <EmptyState icon={LayoutGrid}>
          {categorias.length === 0 ? "Todavía no hay categorías." : "No se encontraron categorías."}
        </EmptyState>
      ) : (
        <div className="grid gap-3">
          {filtradas.map((categoria, index) => (
            <CategoriaRow key={categoria.id} categoria={categoria} numero={index + 1} categorias={categorias} />
          ))}
        </div>
      )}
      <CreateCategoriaSheet open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
