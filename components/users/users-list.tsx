"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { UserCard } from "./user-card";
import { CreateUserSheet } from "./create-user-sheet";
import { EditUserSheet } from "./edit-user-sheet";
import type { Profile, UserRole } from "@/types/profile";
import type { Invitation } from "@/types/invitation";

function assignableRolesFor(actorRole: UserRole): UserRole[] {
  return actorRole === "SUPER_ADMIN"
    ? ["SUPER_ADMIN", "ADMIN", "EMPLEADO"]
    : ["ADMIN", "EMPLEADO"];
}

export function UsersList({
  users,
  actorRole,
  actorId,
  boardsByUser,
  invitationByUser,
  mode = "active",
}: {
  users: Profile[];
  actorRole: UserRole;
  actorId: string;
  boardsByUser: Record<string, string[]>;
  invitationByUser: Record<string, Invitation>;
  mode?: "active" | "inactive";
}) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Profile | null>(null);
  const assignableRoles = assignableRolesFor(actorRole);

  return (
    <div className="space-y-4">
      {mode === "active" ? (
        <div className="flex items-center gap-2">
          <Button onClick={() => setCreateOpen(true)}>+ Crear usuario</Button>
          <Link href="/usuarios/inactivos" className={buttonVariants({ variant: "outline" })}>
            Inactivos
          </Link>
        </div>
      ) : (
        <Link
          href="/usuarios"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Volver a Usuarios
        </Link>
      )}

      {users.length === 0 && mode === "inactive" && (
        <p className="text-sm text-muted-foreground">No hay usuarios inactivos.</p>
      )}

      <div className="grid gap-3">
        {users.map((user) => (
          <UserCard
            key={user.id}
            user={user}
            invitation={invitationByUser[user.id] ?? null}
            onClick={() => setEditingUser(user)}
          />
        ))}
      </div>

      <CreateUserSheet
        open={createOpen}
        onOpenChange={setCreateOpen}
        assignableRoles={assignableRoles}
      />

      {editingUser && (
        <EditUserSheet
          user={editingUser}
          onOpenChange={(open) => {
            if (!open) setEditingUser(null);
          }}
          assignableRoles={assignableRoles}
          isSelf={editingUser.id === actorId}
          assignedBoards={boardsByUser[editingUser.id] ?? []}
          invitation={invitationByUser[editingUser.id] ?? null}
        />
      )}
    </div>
  );
}
