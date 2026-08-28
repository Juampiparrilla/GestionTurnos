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
import type { Marca } from "@/types/marca";

// Selector de marca con un "+" al lado para crear una nueva sin salir de
// la pantalla de producto (create/edit) -- mismo patrón que
// categoria-select-field.tsx / proveedor-select-field.tsx.
export function MarcaSelectField({
  marcas,
  value,
  onChange,
  onMarcaCreated,
}: {
  marcas: Marca[];
  value: string;
  onChange: (value: string) => void;
  onMarcaCreated: (marca: Marca) => void;
}) {
  const [creating, setCreating] = useState(false);
  const [nombre, setNombre] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    if (!nombre.trim()) return;
    setIsSubmitting(true);
    setError(null);

    const res = await fetch("/api/marcas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "No se pudo crear la marca.");
      setIsSubmitting(false);
      return;
    }

    onMarcaCreated({
      id: data.id,
      organization_id: "",
      nombre,
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
      <div className="flex items-center justify-between">
        <Label htmlFor="marcaId">Marca</Label>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={() => setCreating((v) => !v)}
          aria-label={creating ? "Cancelar" : "Nueva marca"}
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
            placeholder="Nombre de la marca"
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
        <Select name="marcaId" value={value} onValueChange={(v) => onChange(v ?? "")}>
          <SelectTrigger id="marcaId">
            <SelectValue>
              {(id: string) => (id ? (marcas.find((m) => m.id === id)?.nombre ?? "Sin marca") : "Sin marca")}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Sin marca</SelectItem>
            {marcas.map((marca) => (
              <SelectItem key={marca.id} value={marca.id}>
                {marca.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
