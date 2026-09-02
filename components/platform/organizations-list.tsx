"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LinkPendingSpinner } from "@/components/link-pending-spinner";
import { CreateOrganizationSheet } from "./create-organization-sheet";
import type { PlatformOrganizationSummary } from "@/types/organization";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function OrganizationsList({
  organizations,
}: {
  organizations: PlatformOrganizationSummary[];
}) {
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="space-y-4">
      <Button onClick={() => setCreateOpen(true)} className="w-full">
        <Plus className="size-4" aria-hidden="true" />
        Crear organización
      </Button>

      {organizations.length === 0 ? (
        <p className="text-sm text-muted-foreground">Todavía no hay organizaciones.</p>
      ) : (
        <div className="grid gap-3">
          {organizations.map((org) => (
            <Link
              key={org.id}
              href={`/platform/organizaciones/${org.id}`}
              className="flex items-center justify-between rounded-lg border bg-background p-4 shadow-sm transition-colors hover:bg-muted/50"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{org.name}</p>
                <p className="text-sm text-muted-foreground">
                  Super Admin: {org.super_admin_name ?? "—"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {org.user_count} {org.user_count === 1 ? "usuario" : "usuarios"} · Creada el{" "}
                  {formatDate(org.created_at)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Badge variant={org.active ? "default" : "outline"}>
                  {org.active ? "Activa" : "Inactiva"}
                </Badge>
                <LinkPendingSpinner />
              </div>
            </Link>
          ))}
        </div>
      )}

      <CreateOrganizationSheet open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
