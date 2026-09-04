"use client";

import { useState } from "react";
import { Plus, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/productos/search-input";
import { EmptyState } from "@/components/empty-state";
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
        <Plus className="size-4" aria-hidden="true" />
        Crear proveedor
      </Button>
      <SearchInput value={query} onChange={setQuery} placeholder="Buscar proveedor..." />
      {filtrados.length === 0 ? (
        <EmptyState icon={Truck}>
          {proveedores.length === 0 ? "Todavía no hay proveedores." : "No se encontraron proveedores."}
        </EmptyState>
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
