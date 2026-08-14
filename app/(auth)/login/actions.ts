"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { loginSchema } from "@/lib/validations/auth";

export type LoginState = { error: string | null };

export async function signIn(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "Ingresá un email y una contraseña válidos." };
  }

  console.error(
    "[signIn] URL:",
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    "ANON len/prefix:",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.slice(0, 12),
  );

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    console.error("[signIn] Supabase auth error:", error.status, error.message);
    return { error: "Email o contraseña incorrectos." };
  }

  redirect("/");
}
