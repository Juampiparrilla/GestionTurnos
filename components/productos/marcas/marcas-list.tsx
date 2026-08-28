"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/productos/search-input";
import type { Marca } from "@/types/marca";
import { MarcaRow } from "./marca-row";
import { CreateMarcaSheet } from "./create-marca-sheet";

export function MarcasList({ marcas, descripcion }: { marcas: Marca[]; descripcion: string }) {
  const [createOpen, setCreateOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filtradas = marcas.filter((m) => m.nombre.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">{descripcion}</p>
        <Button onClick={() => setCreateOpen(true)}>+ Crear marca</Button>
      </div>
      <SearchInput value={query} onChange={setQuery} placeholder="Buscar marca..." />
      {filtradas.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          {marcas.length === 0 ? "Todavía no hay marcas." : "No se encontraron marcas."}
        </div>
      ) : (
        <div className="grid gap-3">
          {filtradas.map((marca, index) => (
            <MarcaRow key={marca.id} marca={marca} numero={index + 1} />
          ))}
        </div>
      )}
      <CreateMarcaSheet open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
