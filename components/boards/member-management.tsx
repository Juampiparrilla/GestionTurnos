"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PendingOverlay } from "@/components/pending-overlay";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ROLE_LABEL } from "@/types/profile";
import type { BoardMember, OrgDirectoryEntry } from "@/types/board";

export function MemberManagement({
  boardId,
  members,
  directory,
  isAdmin,
}: {
  boardId: string;
  members: BoardMember[];
  directory: OrgDirectoryEntry[];
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [isAdding, setIsAdding] = useState(false);
  const [removingUserId, setRemovingUserId] = useState<string | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const directoryById = new Map(directory.map((d) => [d.id, d]));
  const memberUserIds = new Set(members.map((m) => m.user_id));
  const availableToAdd = directory.filter((d) => d.active && !memberUserIds.has(d.id));

  async function handleAdd() {
    if (!selectedUserId) return;
    setIsAdding(true);
    setError(null);

    const res = await fetch(`/api/boards/${boardId}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: selectedUserId }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "No se pudo agregar al usuario.");
      setIsAdding(false);
      return;
    }

    setSelectedUserId("");
    setIsAdding(false);
    router.refresh();
  }

  async function handleRemove(userId: string) {
    setError(null);
    setIsRemoving(true);
    const res = await fetch(`/api/boards/${boardId}/members/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: false }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "No se pudo quitar al usuario.");
    }

    setIsRemoving(false);
    setRemovingUserId(null);
    router.refresh();
  }

  return (
    <div className="space-y-3">
      <PendingOverlay pending={isAdding || isRemoving} />
      <h2 className="font-medium">Personas asignadas</h2>

      {members.length === 0 ? (
        <p className="text-sm text-muted-foreground">Todavía no hay nadie asignado.</p>
      ) : (
        <ul className="space-y-2">
          {members.map((member) => {
            const person = directoryById.get(member.user_id);
            return (
              <li
                key={member.id}
                className="flex items-center justify-between rounded-lg border bg-background p-3"
              >
                <div>
                  <p className="font-medium">{person?.full_name ?? "Usuario"}</p>
                  <p className="text-xs text-muted-foreground">
                    {person ? ROLE_LABEL[person.role] : ""}
                  </p>
                </div>
                {isAdmin && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setRemovingUserId(member.user_id)}
                    aria-label={`Quitar a ${person?.full_name ?? "usuario"} del horario`}
                  >
                    <X className="size-4" />
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {isAdmin && (
        <div className="flex gap-2">
          <Select
            value={selectedUserId}
            onValueChange={(value) => setSelectedUserId(value ?? "")}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Elegir persona...">
                {(value: string) =>
                  directory.find((d) => d.id === value)?.full_name ?? "Elegir persona..."
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {availableToAdd.length === 0 ? (
                <div className="px-2 py-1.5 text-sm text-muted-foreground">
                  No hay más personas para agregar.
                </div>
              ) : (
                availableToAdd.map((person) => (
                  <SelectItem key={person.id} value={person.id}>
                    {person.full_name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          <Button type="button" onClick={handleAdd} disabled={!selectedUserId || isAdding}>
            Agregar
          </Button>
        </div>
      )}

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <AlertDialog open={removingUserId !== null} onOpenChange={(open) => !open && setRemovingUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Quitar del horario?</AlertDialogTitle>
            <AlertDialogDescription>
              {directoryById.get(removingUserId ?? "")?.full_name ?? "Esta persona"} va a dejar
              de tener acceso a este horario. Podés volver a agregarla cuando quieras.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemoving}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => removingUserId && handleRemove(removingUserId)}
              disabled={isRemoving}
            >
              Quitar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
