"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Combobox,
  ComboboxClear,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxInputGroup,
  ComboboxItem,
  ComboboxList,
  ComboboxPopup,
  ComboboxPortal,
  ComboboxPositioner,
  ComboboxTrigger,
} from "@/components/ui/combobox";
import { PendingOverlay } from "@/components/pending-overlay";
import { showSuccessToast } from "@/lib/toast";
import type { Proveedor } from "@/types/proveedor";

// Selector de proveedor con un "+" al lado para crear uno nuevo sin salir
// de la pantalla de producto (create/edit) -- pide solo el nombre; el resto
// de los datos de contacto se completan después desde /productos/proveedores.
export function ProveedorSelectField({
  proveedores,
  value,
  onChange,
  onProveedorCreated,
}: {
  proveedores: Proveedor[];
  value: string;
  onChange: (value: string) => void;
  onProveedorCreated: (proveedor: Proveedor) => void;
}) {
  const [creating, setCreating] = useState(false);
  const [nombre, setNombre] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    if (!nombre.trim()) return;
    setIsSubmitting(true);
    setError(null);

    const res = await fetch("/api/proveedores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "No se pudo crear el proveedor.");
      setIsSubmitting(false);
      return;
    }

    onProveedorCreated({
      id: data.id,
      organization_id: "",
      nombre,
      contacto: null,
      telefono: null,
      email: null,
      notas: null,
      active: true,
      created_by: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    onChange(data.id);
    setNombre("");
    setCreating(false);
    setIsSubmitting(false);
    showSuccessToast("Proveedor creado con éxito");
  }

  return (
    <div className="space-y-2">
      <PendingOverlay pending={isSubmitting} />
      <div className="flex items-center justify-between">
        <Label htmlFor="proveedorId">Proveedor</Label>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={() => setCreating((v) => !v)}
          aria-label={creating ? "Cancelar" : "Nuevo proveedor"}
        >
          {creating ? <X className="size-3.5" /> : <Plus className="size-3.5" />}
        </Button>
      </div>

      {creating ? (
        <div className="flex gap-2">
          <Input
            autoFocus
            value={nombre}
            onChange={(e) => setNombre(e.target.value.toUpperCase())}
            placeholder="Nombre del proveedor"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleCreate();
              }
            }}
          />
          <Button type="button" onClick={handleCreate} disabled={isSubmitting}>
            {isSubmitting ? "..." : "Crear"}
          </Button>
        </div>
      ) : (
        <Combobox
          items={proveedores.map((p) => p.id)}
          value={value}
          onValueChange={(v) => onChange(v ?? "")}
          itemToStringLabel={(id: string) => proveedores.find((p) => p.id === id)?.nombre ?? ""}
        >
          <ComboboxInputGroup>
            <ComboboxInput id="proveedorId" placeholder="Buscar proveedor..." />
            <ComboboxClear />
            <ComboboxTrigger />
          </ComboboxInputGroup>
          <ComboboxPortal>
            <ComboboxPositioner>
              <ComboboxPopup>
                <ComboboxEmpty>No se encontraron proveedores.</ComboboxEmpty>
                <ComboboxList>
                  {(id: string) => (
                    <ComboboxItem key={id} value={id}>
                      {proveedores.find((p) => p.id === id)?.nombre ?? ""}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxPopup>
            </ComboboxPositioner>
          </ComboboxPortal>
        </Combobox>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
