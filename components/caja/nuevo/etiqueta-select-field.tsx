"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PendingOverlay } from "@/components/pending-overlay";
import { showSuccessToast } from "@/lib/toast";
import type { CajaEtiqueta, TipoMovimientoCaja } from "@/types/caja";

// Selector de etiqueta con un "+" al lado para crear una nueva sin salir de
// "Nuevo movimiento" (mismo patrón que CategoriaSelectField en Productos) --
// el tipo de la etiqueta nueva queda fijo al tipo ya elegido en el formulario.
export function EtiquetaSelectField({
  etiquetas,
  tipo,
  value,
  onChange,
  onEtiquetaCreated,
}: {
  etiquetas: CajaEtiqueta[];
  tipo: TipoMovimientoCaja;
  value: string;
  onChange: (value: string) => void;
  onEtiquetaCreated: (etiqueta: CajaEtiqueta) => void;
}) {
  const [creating, setCreating] = useState(false);
  const [nombre, setNombre] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    if (!nombre.trim()) return;
    setIsSubmitting(true);
    setError(null);

    const res = await fetch("/api/caja/etiquetas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, tipo }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "No se pudo crear la etiqueta.");
      setIsSubmitting(false);
      return;
    }

    const nuevaEtiqueta: CajaEtiqueta = {
      id: data.id,
      organization_id: "",
      nombre,
      tipo,
      active: true,
      created_by: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    onEtiquetaCreated(nuevaEtiqueta);
    onChange(data.id);
    setNombre("");
    setCreating(false);
    setIsSubmitting(false);
    showSuccessToast("Etiqueta creada con éxito");
  }

  return (
    <div className="space-y-2">
      <PendingOverlay pending={isSubmitting} />
      <div className="flex items-center justify-between">
        <Label htmlFor="etiqueta">Etiqueta</Label>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={() => setCreating((v) => !v)}
          aria-label={creating ? "Cancelar" : "Nueva etiqueta"}
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
            placeholder="Ej. VENTA DEL DÍA"
            maxLength={100}
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
        <Select value={value} onValueChange={(v) => onChange(v ?? "")}>
          <SelectTrigger id="etiqueta" className="w-full">
            <SelectValue>{(v: string) => etiquetas.find((e) => e.id === v)?.nombre ?? "Seleccione una etiqueta..."}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {etiquetas.length === 0 ? (
              <p className="px-2 py-1.5 text-sm text-muted-foreground">
                No hay etiquetas de {tipo === "ingreso" ? "ingreso" : "egreso"}.
              </p>
            ) : (
              etiquetas.map((e) => (
                <SelectItem key={e.id} value={e.id}>
                  {e.nombre}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
