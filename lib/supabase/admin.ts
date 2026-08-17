import { createClient } from "@supabase/supabase-js";

// Cliente con la service role key: se salta RLS por completo.
// Uso exclusivo en Route Handlers server-only, y solo para operaciones que
// la Admin API de Supabase Auth exige (invitar/borrar usuarios). Nunca
// importar este archivo desde código que corra en el cliente.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
