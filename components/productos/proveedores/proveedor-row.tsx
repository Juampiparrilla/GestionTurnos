"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Ban, ChevronDown, ChevronUp, Pencil, Percent, RotateCcw, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PendingOverlay } from "@/components/pending-overlay";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { ProductosDeEntidad } from "@/components/productos/productos-de-entidad";
import { showSuccessToast, showErrorToast } from "@/lib/toast";
import type { Proveedor } from "@/types/proveedor";
import { EditProveedorSheet } from "./edit-proveedor-sheet";
import { AjustarPorcentajeSheet } from "./ajustar-porcentaje-sheet";

export function ProveedorRow({
  proveedor,
  numero,
  proveedores,
}: {
  proveedor: Proveedor;
  numero: number;
  proveedores: Proveedor[];
}) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [ajustarOpen, setAjustarOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [confirmToggleOpen, setConfirmToggleOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function toggleActive() {
    startTransition(async () => {
      const res = await fetch(`/api/proveedores/${proveedor.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !proveedor.active }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        showErrorToast(data?.error ?? "No se pudo guardar el cambio.");
        return;
      }
      showSuccessToast(proveedor.active ? "Proveedor desactivado" : "Proveedor reactivado");
      router.refresh();
    });
  }

  function deleteForever() {
    startTransition(async () => {
      const res = await fetch(`/api/proveedores/${proveedor.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        showErrorToast(data?.error ?? "No se pudo borrar el proveedor.");
        return;
      }
      showSuccessToast("Proveedor borrado");
      router.refresh();
    });
  }

  return (
    <>
      <PendingOverlay pending={isPending} />
      <div className="min-w-0 rounded-lg border bg-background shadow-sm">
        <div className="flex flex-col gap-2 p-4">
          <p className="truncate font-medium">
            {numero}. {proveedor.nombre}
          </p>
          <div className="flex items-center justify-end gap-1">
            {!proveedor.active && <Badge variant="outline" className="mr-auto">Inactivo</Badge>}
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setExpanded((v) => !v)}
              aria-label={expanded ? "Ocultar productos" : "Ver productos"}
            >
              {expanded ? (
                <ChevronUp className="size-4" aria-hidden="true" />
              ) : (
                <ChevronDown className="size-4" aria-hidden="true" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setAjustarOpen(true)}
              aria-label="Ajustar % de ganancia"
            >
              <Percent className="size-4" aria-hidden="true" />
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={() => setEditOpen(true)} aria-label="Editar">
              <Pencil className="size-4" aria-hidden="true" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setConfirmToggleOpen(true)}
              disabled={isPending}
              aria-label={proveedor.active ? "Desactivar" : "Reactivar"}
            >
              {proveedor.active ? (
                <Ban className="size-4" aria-hidden="true" />
              ) : (
                <RotateCcw className="size-4" aria-hidden="true" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setConfirmDeleteOpen(true)}
              disabled={isPending}
              aria-label="Borrar definitivamente"
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="size-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
        {expanded && (
          <ProductosDeEntidad
            endpoint={`/api/proveedores/${proveedor.id}/productos`}
            campo="proveedorId"
            placeholder="Cambiar proveedor"
            opciones={proveedores
              .filter((p) => p.id !== proveedor.id && p.active)
              .map((p) => ({ value: p.id, label: p.nombre }))}
          />
        )}
      </div>
      <EditProveedorSheet proveedor={proveedor} open={editOpen} onOpenChange={setEditOpen} />
      <AjustarPorcentajeSheet proveedor={proveedor} open={ajustarOpen} onOpenChange={setAjustarOpen} />
      <ConfirmDialog
        open={confirmToggleOpen}
        onOpenChange={setConfirmToggleOpen}
        title={proveedor.active ? "¿Desactivar este proveedor?" : "¿Reactivar este proveedor?"}
        description={
          proveedor.active
            ? `"${proveedor.nombre}" podés reactivarlo después.`
            : `"${proveedor.nombre}" vuelve a estar disponible.`
        }
        confirmLabel={proveedor.active ? "Desactivar" : "Reactivar"}
        onConfirm={() => {
          setConfirmToggleOpen(false);
          toggleActive();
        }}
      />
      <ConfirmDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        title="¿Borrar este proveedor?"
        description={`Esto borra "${proveedor.nombre}" para siempre y no se puede deshacer.`}
        confirmLabel="Borrar"
        destructive
        onConfirm={() => {
          setConfirmDeleteOpen(false);
          deleteForever();
        }}
      />
    </>
  );
}
