// Crea el primer Administrador de Plataforma.
// Uso: npm run bootstrap:platform
//
// Requiere NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env.local.
// Se ejecuta una sola vez (o cada vez que haga falta dar de alta a otro
// platform admin); usa la service role key, por lo que se salta RLS a
// propósito.

import { createClient } from "@supabase/supabase-js";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "Faltan NEXT_PUBLIC_SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY.\n" +
      "Corré: npm run bootstrap:platform (ya carga .env.local automáticamente)",
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const rl = readline.createInterface({ input, output });

async function ask(question) {
  const answer = (await rl.question(question)).trim();
  if (!answer) {
    console.error("Este dato es obligatorio.");
    process.exit(1);
  }
  return answer;
}

async function main() {
  console.log("== Bootstrap: Administrador de Plataforma ==\n");

  const fullName = await ask("Nombre completo: ");
  const email = await ask("Email: ");
  const password = await ask("Contraseña inicial (mínimo 8 caracteres): ");

  rl.close();

  if (password.length < 8) {
    console.error("La contraseña debe tener al menos 8 caracteres.");
    process.exit(1);
  }

  console.log("\nCreando usuario en Supabase Auth...");
  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError) {
    console.error("Error creando el usuario:", authError.message);
    process.exit(1);
  }

  console.log("Creando registro de platform admin...");
  const { error: platformError } = await supabase.from("platform_admins").insert({
    id: authUser.user.id,
    full_name: fullName,
    email,
  });

  if (platformError) {
    console.error("Error creando el platform admin:", platformError.message);
    console.error(
      `Revertí manualmente si hace falta: borrar el usuario ${authUser.user.id} en Supabase Auth.`,
    );
    process.exit(1);
  }

  console.log("\n✔ Listo. Ya podés iniciar sesión en /login con:");
  console.log(`  Email: ${email}`);
  console.log(`  Contraseña: la que ingresaste recién`);
  console.log("  Te va a redirigir automáticamente a /platform.");
}

main();
