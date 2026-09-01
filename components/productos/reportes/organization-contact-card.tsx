"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { showSuccessToast } from "@/lib/toast";
import type { Organization } from "@/types/organization";

export function OrganizationContactCard({
  organization,
  onUpdated,
}: {
  organization: Organization;
  onUpdated: (organization: Organization) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(organization.name);
  const [phone, setPhone] = useState(organization.phone ?? "");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSave() {
    setError(null);
    startTransition(async () => {
      const res = await fetch("/api/organizations/current", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "No se pudo guardar el cambio.");
        return;
      }

      onUpdated(data.organization);
      setEditing(false);
      showSuccessToast("Datos de contacto guardados");
    });
  }

  return (
    <div className="space-y-2 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-900 dark:bg-blue-950/40">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Datos para reportes</p>
        {!editing && (
          <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(true)}>
            Editar
          </Button>
        )}
      </div>

      {editing ? (
        <div className="flex flex-col gap-2">
          <div className="space-y-1">
            <Label htmlFor="org-name">Nombre del negocio</Label>
            <Input id="org-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="org-phone">Teléfono de contacto</Label>
            <Input
              id="org-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Ej. 11 5555-5555"
            />
          </div>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <div className="flex gap-2">
            <Button type="button" onClick={handleSave} disabled={isPending}>
              {isPending ? "Guardando..." : "Guardar"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setName(organization.name);
                setPhone(organization.phone ?? "");
                setEditing(false);
              }}
            >
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          {organization.name}
          {organization.phone ? ` · ${organization.phone}` : " · Sin teléfono cargado (no aparece en el encabezado del PDF)"}
        </p>
      )}
    </div>
  );
}
