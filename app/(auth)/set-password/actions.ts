"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { setPasswordSchema } from "@/lib/validations/auth";

export type SetPasswordState = { error: string | null };

export async function setPassword(
  _prevState: SetPasswordState,
  formData: FormData,
): Promise<SetPasswordState> {
  const parsed = setPasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });

  if (error) {
    return { error: "No se pudo guardar la contraseña. Probá de nuevo." };
  }

  redirect("/");
}
