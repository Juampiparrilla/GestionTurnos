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
import type { Categoria } from "@/types/categoria";

// Selector de categoría con un "+" al lado para crear una nueva sin salir
// de la pantalla de producto (create/edit) -- pide solo el nombre; si hace
// falta cargar descripción, se completa después desde /productos/categorias.
export function CategoriaSelectField({
  categorias,
  value,
  onChange,
  onCategoriaCreated,
}: {
  categorias: Categoria[];
  value: string;
  onChange: (value: string) => void;
  onCategoriaCreated: (categoria: Categoria) => void;
}) {
  const [creating, setCreating] = useState(false);
  const [nombre, setNombre] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    if (!nombre.trim()) return;
    setIsSubmitting(true);
    setError(null);

    const res = await fetch("/api/categorias", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "No se pudo crear la categoría.");
      setIsSubmitting(false);
      return;
    }

    onCategoriaCreated({
      id: data.id,
      organization_id: "",
      nombre,
      descripcion: null,
      active: true,
      created_by: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    onChange(data.id);
    setNombre("");
    setCreating(false);
    setIsSubmitting(false);
    showSuccessToast("Categoría creada con éxito");
  }

  return (
    <div className="space-y-2">
      <PendingOverlay pending={isSubmitting} />
      <div className="flex items-center justify-between">
        <Label htmlFor="categoriaId">Categoría</Label>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={() => setCreating((v) => !v)}
          aria-label={creating ? "Cancelar" : "Nueva categoría"}
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
            placeholder="Nombre de la categoría"
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
          items={categorias.map((c) => c.id)}
          value={value}
          onValueChange={(v) => onChange(v ?? "")}
          itemToStringLabel={(id: string) => categorias.find((c) => c.id === id)?.nombre ?? ""}
        >
          <ComboboxInputGroup>
            <ComboboxInput id="categoriaId" placeholder="Buscar categoría..." />
            <ComboboxClear />
            <ComboboxTrigger />
          </ComboboxInputGroup>
          <ComboboxPortal>
            <ComboboxPositioner>
              <ComboboxPopup>
                <ComboboxEmpty>No se encontraron categorías.</ComboboxEmpty>
                <ComboboxList>
                  {(id: string) => (
                    <ComboboxItem key={id} value={id}>
                      {categorias.find((c) => c.id === id)?.nombre ?? ""}
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
