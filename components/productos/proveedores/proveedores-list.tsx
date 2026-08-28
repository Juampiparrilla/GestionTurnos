"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/productos/search-input";
import type { Proveedor } from "@/types/proveedor";
import { ProveedorRow } from "./proveedor-row";
import { CreateProveedorSheet } from "./create-proveedor-sheet";

export function ProveedoresList({ proveedores }: { proveedores: Proveedor[] }) {
  const [createOpen, setCreateOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filtrados = proveedores.filter((p) => p.nombre.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <div className="space-y-4">
      <SearchInput value={query} onChange={setQuery} placeholder="Buscar proveedor..." />
      <Button onClick={() => setCreateOpen(true)}>+ Crear proveedor</Button>
      {filtrados.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          {proveedores.length === 0 ? "Todavía no hay proveedores." : "No se encontraron proveedores."}
        </div>
      ) : (
        <div className="grid gap-3">
          {filtrados.map((proveedor, index) => (
            <ProveedorRow key={proveedor.id} proveedor={proveedor} numero={index + 1} />
          ))}
        </div>
      )}
      <CreateProveedorSheet open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
