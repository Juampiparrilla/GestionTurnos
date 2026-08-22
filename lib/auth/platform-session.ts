import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type PlatformAdmin = {
  id: string;
  full_name: string;
  email: string;
  active: boolean;
};

export const getCurrentPlatformAdmin = cache(async (): Promise<PlatformAdmin | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("platform_admins")
    .select("id, full_name, email, active")
    .eq("id", user.id)
    .maybeSingle();

  if (!data || !data.active) return null;

  return data as PlatformAdmin;
});
