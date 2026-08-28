"use client";

import { useState, useTransition } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { showSuccessToast } from "@/lib/toast";
import type { Marca } from "@/types/marca";
import type { Categoria } from "@/types/categoria";
import type { Proveedor } from "@/types/proveedor";
import { MarcaSelectField } from "./marca-select-field";
import { CategoriaSelectField } from "./categoria-select-field";
import { ProveedorSelectField } from "./proveedor-select-field";
import { PriceTrackFields } from "./price-track-fields";
import { CostoUnitarioField } from "./costo-unitario-field";
import type { Producto } from "@/types/producto";

export function CreateProductoSheet({
  open,
  onOpenChange,
  marcas,
  categorias,
  proveedores,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  marcas: Marca[];
  categorias: Categoria[];
  proveedores: Proveedor[];
  onCreated: (producto: Producto) => void;
}) {
  const [isPending, startTransition] = useTransition();
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
  const [unidadMedida, setUnidadMedida] = useState<"kg" | "unidad">("kg");
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
  const [oferta, setOferta] = useState(false);

  function resetForm() {
    setNombre("");
    setDescripcion("");
    setMarcaId("");
    setCategoriaId("");
    setProveedorId("");
    setKg(0);
    setUnidadMedida("kg");
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
    setOferta(false);
    setError(null);
  }

  function handleOpenChange(next: boolean) {
    if (next) resetForm();
    onOpenChange(next);
  }

  function handleSubmit() {
    setError(null);

    if (!marcaId || !categoriaId || !proveedorId) {
      setError("Elegí marca, categoría y proveedor.");
      return;
    }

    const payload = {
      nombre,
      marcaId,
      categoriaId,
      proveedorId,
      descripcion,
      kg,
      unidadMedida,
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
      oferta,
    };

    startTransition(async () => {
      const res = await fetch("/api/productos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "No se pudo crear el producto.");
        return;
      }

      resetForm();
      onOpenChange(false);
      showSuccessToast("Producto creado con éxito");
      onCreated(data.producto);
    });
  }

  return (
    <>
      <PendingOverlay pending={isPending} />
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
            <div className="space-y-2">
              <Label htmlFor="unidad-medida">Se vende por</Label>
              <Select
                name="unidad-medida"
                value={unidadMedida}
                onValueChange={(v) => setUnidadMedida((v as "kg" | "unidad") ?? "kg")}
              >
                <SelectTrigger id="unidad-medida" className="w-full">
                  <SelectValue>{(v: "kg" | "unidad") => (v === "kg" ? "Kg" : "Unidad")}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">Kg</SelectItem>
                  <SelectItem value="unidad">Unidad</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="kg">{unidadMedida === "kg" ? "Kg de la bolsa" : "Cantidad de unidades"}</Label>
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

            <CostoUnitarioField costo={costo} onCostoChange={setCosto} />

            <PriceTrackFields
              label={unidadMedida === "kg" ? "Bolsa cerrada" : "Precio unitario"}
              namePrefix="cerrada"
              costo={costo}
              porcentaje={porcentajeCerrada}
              onPorcentajeChange={setPorcentajeCerrada}
              manual={manualCerrada}
              onManualChange={setManualCerrada}
              precioManual={precioManualCerrada}
              onPrecioManualChange={setPrecioManualCerrada}
            />
            {unidadMedida === "kg" && (
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
            )}
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

            <div className="flex items-center justify-between rounded-lg border p-3">
              <Label htmlFor="oferta">En oferta</Label>
              <Switch id="oferta" checked={oferta} onCheckedChange={setOferta} />
            </div>

            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            <SheetFooter className="px-0">
              <Button type="submit" disabled={isPending}>
                {isPending ? "Creando..." : "Crear producto"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}
