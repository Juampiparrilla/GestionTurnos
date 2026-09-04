"use client";

import { useState } from "react";
import { Plus, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/productos/search-input";
import { EmptyState } from "@/components/empty-state";
import type { CajaEtiqueta } from "@/types/caja";
import { EtiquetaRow } from "./etiqueta-row";
import { CreateEtiquetaSheet } from "./create-etiqueta-sheet";

export function EtiquetasList({
  etiquetas,
  etiquetasEnUso,
}: {
  etiquetas: CajaEtiqueta[];
  etiquetasEnUso: Set<string>;
}) {
  const [createOpen, setCreateOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filtradas = etiquetas.filter((e) => e.nombre.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Las etiquetas clasifican los movimientos de Caja. Una etiqueta ya usada en movimientos no se puede borrar ni
        cambiar de tipo — se desactiva en su lugar.
      </p>
      <Button onClick={() => setCreateOpen(true)} className="w-full">
        <Plus className="size-4" aria-hidden="true" />
        Crear etiqueta
      </Button>
      <SearchInput value={query} onChange={setQuery} placeholder="Buscar etiqueta..." />
      {filtradas.length === 0 ? (
        <EmptyState icon={Tag}>
          {etiquetas.length === 0 ? "Todavía no hay etiquetas." : "No se encontraron etiquetas."}
        </EmptyState>
      ) : (
        <div className="grid gap-2">
          {filtradas.map((etiqueta) => (
            <EtiquetaRow key={etiqueta.id} etiqueta={etiqueta} enUso={etiquetasEnUso.has(etiqueta.id)} />
          ))}
        </div>
      )}
      <CreateEtiquetaSheet open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
