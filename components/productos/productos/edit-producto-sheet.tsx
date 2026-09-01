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
import { uppercaseOnChange } from "@/lib/productos/uppercase-input";
import { showSuccessToast } from "@/lib/toast";
import type { Marca } from "@/types/marca";
import type { Categoria } from "@/types/categoria";
import type { Proveedor } from "@/types/proveedor";
import type { Producto } from "@/types/producto";
import { NombreProductoField } from "./nombre-producto-field";
import { CantidadInput } from "./cantidad-input";
import { MarcaSelectField } from "./marca-select-field";
import { CategoriaSelectField } from "./categoria-select-field";
import { ProveedorSelectField } from "./proveedor-select-field";
import { PriceTrackFields } from "./price-track-fields";
import { CostoUnitarioField } from "./costo-unitario-field";

export function EditProductoSheet({
  producto,
  open,
  onOpenChange,
  marcas,
  categorias,
  proveedores,
  nombresExistentes,
  onUpdated,
}: {
  producto: Producto;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  marcas: Marca[];
  categorias: Categoria[];
  proveedores: Proveedor[];
  nombresExistentes: string[];
  onUpdated: (producto: Producto) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState(producto.active);
  const [nombre, setNombre] = useState(producto.nombre);

  const [marcaOptions, setMarcaOptions] = useState(marcas);
  const [categoriaOptions, setCategoriaOptions] = useState(categorias);
  const [proveedorOptions, setProveedorOptions] = useState(proveedores);
  const [marcaId, setMarcaId] = useState(producto.marca_id ?? "");
  const [categoriaId, setCategoriaId] = useState(producto.categoria_id ?? "");
  const [proveedorId, setProveedorId] = useState(producto.proveedor_id ?? "");

  const [kg, setKg] = useState(producto.kg);
  const [unidadMedida, setUnidadMedida] = useState(producto.unidad_medida);
  const [costo, setCosto] = useState(producto.costo);
  const [porcentajeCerrada, setPorcentajeCerrada] = useState(producto.porcentaje_ganancia_cerrada);
  const [manualCerrada, setManualCerrada] = useState(producto.precio_manual_cerrada);
  const [precioManualCerrada, setPrecioManualCerrada] = useState(producto.precio_venta_cerrada);
  const [porcentajeAbierta, setPorcentajeAbierta] = useState(producto.porcentaje_ganancia_abierta);
  const [manualAbierta, setManualAbierta] = useState(producto.precio_manual_abierta);
  const [precioManualAbierta, setPrecioManualAbierta] = useState(producto.precio_venta_abierta);
  const [porcentajePorMayor, setPorcentajePorMayor] = useState(producto.porcentaje_ganancia_por_mayor);
  const [manualPorMayor, setManualPorMayor] = useState(producto.precio_manual_por_mayor);
  const [precioManualPorMayor, setPrecioManualPorMayor] = useState(producto.precio_venta_por_mayor);
  const [oferta, setOferta] = useState(producto.oferta);

  function handleSubmit(formData: FormData) {
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
      descripcion: formData.get("descripcion"),
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
      active,
    };

    startTransition(async () => {
      const res = await fetch(`/api/productos/${producto.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "No se pudo guardar el cambio.");
        return;
      }

      onOpenChange(false);
      showSuccessToast("Producto actualizado con éxito");
      onUpdated(data.producto);
    });
  }

  return (
    <>
      <PendingOverlay pending={isPending} />
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Editar producto</SheetTitle>
          </SheetHeader>
          <form action={handleSubmit} className="flex flex-col gap-4 px-4">
            <NombreProductoField
              value={nombre}
              onChange={setNombre}
              nombresExistentes={nombresExistentes}
              excluir={producto.nombre}
            />
            <div className="space-y-2">
              <Label htmlFor="unidad-medida">Se vende por</Label>
              <Select
                name="unidad-medida"
                value={unidadMedida}
                onValueChange={(v) => {
                  const nueva = (v as "kg" | "unidad") ?? "kg";
                  setUnidadMedida(nueva);
                  if (nueva === "unidad" && kg === 0) setKg(1);
                }}
              >
                <SelectTrigger id="unidad-medida" className="w-full">
                  <SelectValue>{(v: "kg" | "unidad") => (v === "kg" ? "KG" : "UNIDAD")}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">KG</SelectItem>
                  <SelectItem value="unidad">UNIDAD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="kg">{unidadMedida === "kg" ? "Kg de la bolsa" : "Cantidad de unidades"}</Label>
              <CantidadInput id="kg" value={kg} onChange={setKg} required />
              {unidadMedida === "unidad" && (
                <p className="text-xs text-muted-foreground">
                  Normalmente 1 (se vende de a una). Si compraste un paquete con varias adentro, esa cantidad va en
                  “Precio de lista con descuento” o “Compré varias unidades por un total”, más abajo.
                </p>
              )}
            </div>
            <div className="flex flex-col gap-4 rounded-lg bg-muted/40 p-3">
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
            </div>
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

            <CostoUnitarioField costo={costo} onCostoChange={setCosto} unidadMedida={unidadMedida} />

            <PriceTrackFields
              label={unidadMedida === "kg" ? "Bolsa cerrada" : "Precio unitario"}
              namePrefix="cerrada-edit"
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
                namePrefix="abierta-edit"
                costo={costo}
                porcentaje={porcentajeAbierta}
                onPorcentajeChange={setPorcentajeAbierta}
                manual={manualAbierta}
                onManualChange={setManualAbierta}
                precioManual={precioManualAbierta}
                onPrecioManualChange={setPrecioManualAbierta}
                kgPorBolsa={kg}
              />
            )}
            <PriceTrackFields
              label="Por mayor"
              namePrefix="por-mayor-edit"
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
              <Button type="submit" disabled={isPending}>
                {isPending ? "Guardando..." : "Guardar cambios"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}
