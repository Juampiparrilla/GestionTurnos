"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/productos/search-input";
import type { Proveedor } from "@/types/proveedor";
import { ProveedorRow } from "./proveedor-row";
import { CreateProveedorSheet } from "./create-proveedor-sheet";

export function ProveedoresList({ proveedores, descripcion }: { proveedores: Proveedor[]; descripcion: string }) {
  const [createOpen, setCreateOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filtrados = proveedores.filter((p) => p.nombre.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{descripcion}</p>
      <Button onClick={() => setCreateOpen(true)} className="w-full">
        + Crear proveedor
      </Button>
      <SearchInput value={query} onChange={setQuery} placeholder="Buscar proveedor..." />
      {filtrados.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          {proveedores.length === 0 ? "Todavía no hay proveedores." : "No se encontraron proveedores."}
        </div>
      ) : (
        <div className="grid gap-3">
          {filtrados.map((proveedor, index) => (
            <ProveedorRow key={proveedor.id} proveedor={proveedor} numero={index + 1} proveedores={proveedores} />
          ))}
        </div>
      )}
      <CreateProveedorSheet open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
