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
import { showSuccessToast } from "@/lib/toast";
import { MoneyInput } from "@/components/productos/money-input";
import type { Marca } from "@/types/marca";
import type { Categoria } from "@/types/categoria";
import type { Proveedor } from "@/types/proveedor";
import { MarcaSelectField } from "./marca-select-field";
import { CategoriaSelectField } from "./categoria-select-field";
import { ProveedorSelectField } from "./proveedor-select-field";
import { PriceTrackFields } from "./price-track-fields";

export function CreateProductoSheet({
  open,
  onOpenChange,
  marcas,
  categorias,
  proveedores,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  marcas: Marca[];
  categorias: Categoria[];
  proveedores: Proveedor[];
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [marcaOptions, setMarcaOptions] = useState(marcas);
  const [categoriaOptions, setCategoriaOptions] = useState(categorias);
  const [proveedorOptions, setProveedorOptions] = useState(proveedores);

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [marcaId, setMarcaId] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [proveedorId, setProveedorId] = useState("");

  const [kg, setKg] = useState(0);
  const [costo, setCosto] = useState(0);
  const [porcentajeCerrada, setPorcentajeCerrada] = useState(0);
  const [manualCerrada, setManualCerrada] = useState(false);
  const [precioManualCerrada, setPrecioManualCerrada] = useState(0);
  const [porcentajeAbierta, setPorcentajeAbierta] = useState(0);
  const [manualAbierta, setManualAbierta] = useState(false);
  const [precioManualAbierta, setPrecioManualAbierta] = useState(0);
  const [porcentajePorMayor, setPorcentajePorMayor] = useState(0);
  const [manualPorMayor, setManualPorMayor] = useState(false);
  const [precioManualPorMayor, setPrecioManualPorMayor] = useState(0);

  function resetForm() {
    setNombre("");
    setDescripcion("");
    setMarcaId("");
    setCategoriaId("");
    setProveedorId("");
    setKg(0);
    setCosto(0);
    setPorcentajeCerrada(0);
    setManualCerrada(false);
    setPrecioManualCerrada(0);
    setPorcentajeAbierta(0);
    setManualAbierta(false);
    setPrecioManualAbierta(0);
    setPorcentajePorMayor(0);
    setManualPorMayor(false);
    setPrecioManualPorMayor(0);
    setError(null);
  }

  function handleOpenChange(next: boolean) {
    if (next) resetForm();
    onOpenChange(next);
  }

  async function handleSubmit() {
    setIsSubmitting(true);
    setError(null);

    const payload = {
      nombre,
      marcaId,
      categoriaId,
      proveedorId,
      descripcion,
      kg,
      costo,
      porcentajeCerrada,
      manualCerrada,
      precioManualCerrada,
      porcentajeAbierta,
      manualAbierta,
      precioManualAbierta,
      porcentajePorMayor,
      manualPorMayor,
      precioManualPorMayor,
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
    resetForm();
    onOpenChange(false);
    showSuccessToast("Producto creado con éxito");
    router.refresh();
  }

  return (
    <>
      <PendingOverlay pending={isSubmitting} />
      <Sheet open={open} onOpenChange={handleOpenChange}>
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
                value={nombre}
                onChange={(e) => setNombre(e.target.value.toUpperCase())}
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
                maxLength={500}
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value.toUpperCase())}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="kg">Kg de la bolsa</Label>
              <Input
                id="kg"
                type="number"
                step="0.01"
                min="0.01"
                required
                value={kg || ""}
                onChange={(e) => setKg(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="costo">Precio de costo</Label>
              <MoneyInput id="costo" required value={costo} onChange={setCosto} />
            </div>

            <PriceTrackFields
              label="Bolsa cerrada"
              namePrefix="cerrada"
              costo={costo}
              porcentaje={porcentajeCerrada}
              onPorcentajeChange={setPorcentajeCerrada}
              manual={manualCerrada}
              onManualChange={setManualCerrada}
              precioManual={precioManualCerrada}
              onPrecioManualChange={setPrecioManualCerrada}
            />
            <PriceTrackFields
              label="Bolsa abierta (por kg)"
              namePrefix="abierta"
              costo={costo}
              porcentaje={porcentajeAbierta}
              onPorcentajeChange={setPorcentajeAbierta}
              manual={manualAbierta}
              onManualChange={setManualAbierta}
              precioManual={precioManualAbierta}
              onPrecioManualChange={setPrecioManualAbierta}
            />
            <PriceTrackFields
              label="Por mayor"
              namePrefix="por-mayor"
              costo={costo}
              porcentaje={porcentajePorMayor}
              onPorcentajeChange={setPorcentajePorMayor}
              manual={manualPorMayor}
              onManualChange={setManualPorMayor}
              precioManual={precioManualPorMayor}
              onPrecioManualChange={setPrecioManualPorMayor}
            />

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
