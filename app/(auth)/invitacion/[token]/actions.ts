"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { hashInvitationToken } from "@/lib/invitations/token";
import { setPasswordSchema } from "@/lib/validations/auth";

export type ActivateAccountState = { error: string | null };

export async function activateAccount(
  token: string,
  _prevState: ActivateAccountState,
  formData: FormData,
): Promise<ActivateAccountState> {
  const parsed = setPasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const tokenHash = hashInvitationToken(token);
  const admin = createAdminClient();

  // Reclama la invitación de forma atómica: el WHERE con las mismas
  // condiciones que la validación garantiza que, si dos requests llegan
  // a la vez con el mismo token, solo una gana esta UPDATE.
  const { data: claimed, error: claimError } = await admin
    .from("invitations")
    .update({ used_at: new Date().toISOString() })
    .eq("token_hash", tokenHash)
    .is("used_at", null)
    .is("revoked_at", null)
    .gt("expires_at", new Date().toISOString())
    .select("id, user_id")
    .maybeSingle();

  if (claimError || !claimed) {
    return {
      error: "Esta invitación ya no es válida. Pedile una nueva al administrador.",
    };
  }

  const { error: passwordError } = await admin.auth.admin.updateUserById(claimed.user_id, {
    password: parsed.data.password,
  });

  if (passwordError) {
    // No dejar a la persona trabada: si no se pudo fijar la contraseña,
    // se libera la invitación para que pueda reintentar.
    await admin.from("invitations").update({ used_at: null }).eq("id", claimed.id);
    return { error: "No se pudo activar la cuenta. Probá de nuevo." };
  }

  const { data: activatedProfile } = await admin
    .from("profiles")
    .select("email")
    .eq("id", claimed.user_id)
    .single();

  const supabase = await createClient();
  await supabase.auth.signInWithPassword({
    email: activatedProfile!.email,
    password: parsed.data.password,
  });

  redirect("/");
}
