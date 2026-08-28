"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PendingOverlay } from "@/components/pending-overlay";
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
        <Select name="categoriaId" value={value} onValueChange={(v) => onChange(v ?? "")}>
          <SelectTrigger id="categoriaId">
            <SelectValue>
              {(id: string) => (id ? (categorias.find((c) => c.id === id)?.nombre ?? "Sin categoría") : "Sin categoría")}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Sin categoría</SelectItem>
            {categorias.map((categoria) => (
              <SelectItem key={categoria.id} value={categoria.id}>
                {categoria.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
