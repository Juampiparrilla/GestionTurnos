"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PendingOverlay } from "@/components/pending-overlay";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { uppercaseOnChange } from "@/lib/productos/uppercase-input";
import type { Categoria } from "@/types/categoria";
import type { Proveedor } from "@/types/proveedor";
import { CategoriaSelectField } from "./categoria-select-field";
import { ProveedorSelectField } from "./proveedor-select-field";

export function CreateProductoSheet({
  open,
  onOpenChange,
  categorias,
  proveedores,
  marcas,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categorias: Categoria[];
  proveedores: Proveedor[];
  marcas: string[];
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [categoriaOptions, setCategoriaOptions] = useState(categorias);
  const [proveedorOptions, setProveedorOptions] = useState(proveedores);
  const [categoriaId, setCategoriaId] = useState("");
  const [proveedorId, setProveedorId] = useState("");

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    setError(null);

    const payload = {
      nombre: formData.get("nombre"),
      marca: formData.get("marca"),
      categoriaId,
      proveedorId,
      descripcion: formData.get("descripcion"),
    };

    const res = await fetch("/api/productos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "No se pudo crear el producto.");
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
    onOpenChange(false);
    router.push(`/productos/productos/${data.id}`);
  }

  return (
    <>
      <PendingOverlay pending={isSubmitting} />
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Crear producto</SheetTitle>
          </SheetHeader>
          <form action={handleSubmit} className="flex flex-col gap-4 px-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                name="nombre"
                maxLength={150}
                placeholder="Ej. ADULTO RAZA PEQUEÑA"
                onChange={uppercaseOnChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="marca">Marca</Label>
              <Input
                id="marca"
                name="marca"
                list="marcas-list"
                maxLength={100}
                placeholder="Ej. BELCAN"
                onChange={uppercaseOnChange}
              />
              <datalist id="marcas-list">
                {marcas.map((marca) => (
                  <option key={marca} value={marca} />
                ))}
              </datalist>
            </div>
            <CategoriaSelectField
              categorias={categoriaOptions}
              value={categoriaId}
              onChange={setCategoriaId}
              onCategoriaCreated={(nueva) =>
                setCategoriaOptions((prev) => [...prev, nueva].sort((a, b) => a.nombre.localeCompare(b.nombre)))
              }
            />
            <ProveedorSelectField
              proveedores={proveedorOptions}
              value={proveedorId}
              onChange={setProveedorId}
              onProveedorCreated={(nuevo) =>
                setProveedorOptions((prev) => [...prev, nuevo].sort((a, b) => a.nombre.localeCompare(b.nombre)))
              }
            />
            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción (opcional)</Label>
              <Input id="descripcion" name="descripcion" maxLength={500} onChange={uppercaseOnChange} />
            </div>
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            <SheetFooter className="px-0">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creando..." : "Crear producto"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}
