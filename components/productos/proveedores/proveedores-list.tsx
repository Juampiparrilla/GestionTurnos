"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Proveedor } from "@/types/proveedor";
import { ProveedorRow } from "./proveedor-row";
import { CreateProveedorSheet } from "./create-proveedor-sheet";

export function ProveedoresList({ proveedores }: { proveedores: Proveedor[] }) {
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="space-y-4">
      <Button onClick={() => setCreateOpen(true)}>+ Crear proveedor</Button>
      {proveedores.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          Todavía no hay proveedores.
        </div>
      ) : (
        <div className="grid gap-3">
          {proveedores.map((proveedor) => (
            <ProveedorRow key={proveedor.id} proveedor={proveedor} />
          ))}
        </div>
      )}
      <CreateProveedorSheet open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
