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
import { Switch } from "@/components/ui/switch";
import { uppercaseOnChange } from "@/lib/productos/uppercase-input";
import type { Marca } from "@/types/marca";
import type { Categoria } from "@/types/categoria";
import type { Proveedor } from "@/types/proveedor";
import type { Producto } from "@/types/producto";
import { MarcaSelectField } from "./marca-select-field";
import { CategoriaSelectField } from "./categoria-select-field";
import { ProveedorSelectField } from "./proveedor-select-field";

export function EditProductoSheet({
  producto,
  open,
  onOpenChange,
  marcas,
  categorias,
  proveedores,
}: {
  producto: Producto;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  marcas: Marca[];
  categorias: Categoria[];
  proveedores: Proveedor[];
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState(producto.active);

  const [marcaOptions, setMarcaOptions] = useState(marcas);
  const [categoriaOptions, setCategoriaOptions] = useState(categorias);
  const [proveedorOptions, setProveedorOptions] = useState(proveedores);
  const [marcaId, setMarcaId] = useState(producto.marca_id ?? "");
  const [categoriaId, setCategoriaId] = useState(producto.categoria_id ?? "");
  const [proveedorId, setProveedorId] = useState(producto.proveedor_id ?? "");

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    setError(null);

    const payload = {
      nombre: formData.get("nombre"),
      marcaId,
      categoriaId,
      proveedorId,
      descripcion: formData.get("descripcion"),
      active,
    };

    const res = await fetch(`/api/productos/${producto.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "No se pudo guardar el cambio.");
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
    onOpenChange(false);
    router.refresh();
  }

  return (
    <>
      <PendingOverlay pending={isSubmitting} />
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Editar producto</SheetTitle>
          </SheetHeader>
          <form action={handleSubmit} className="flex flex-col gap-4 px-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                name="nombre"
                defaultValue={producto.nombre}
                maxLength={150}
                onChange={uppercaseOnChange}
                required
              />
            </div>
            <MarcaSelectField
              marcas={marcaOptions}
              value={marcaId}
              onChange={setMarcaId}
              onMarcaCreated={(nueva) =>
                setMarcaOptions((prev) => [...prev, nueva].sort((a, b) => a.nombre.localeCompare(b.nombre)))
              }
            />
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
              <Input
                id="descripcion"
                name="descripcion"
                defaultValue={producto.descripcion ?? ""}
                maxLength={500}
                onChange={uppercaseOnChange}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <Label htmlFor="active">Producto activo</Label>
              <Switch id="active" checked={active} onCheckedChange={setActive} />
            </div>
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            <SheetFooter className="px-0">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Guardando..." : "Guardar cambios"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}
