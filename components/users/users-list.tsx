"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
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
}: {
  users: Profile[];
  actorRole: UserRole;
  actorId: string;
  boardsByUser: Record<string, string[]>;
  invitationByUser: Record<string, Invitation>;
}) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Profile | null>(null);
  const assignableRoles = assignableRolesFor(actorRole);

  return (
    <div className="space-y-4">
      <Button onClick={() => setCreateOpen(true)}>+ Crear usuario</Button>

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
