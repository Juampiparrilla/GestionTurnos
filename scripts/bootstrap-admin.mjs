// Crea la primera organización y el primer SUPER_ADMIN.
// Uso: npm run bootstrap
//
// Requiere NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env.local.
// Se ejecuta una sola vez por organización nueva; usa la service role key,
// por lo que se salta RLS a propósito (es el único punto de entrada
// "fuera del sistema" para crear la organización inicial).

import { createClient } from "@supabase/supabase-js";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "Faltan NEXT_PUBLIC_SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY.\n" +
      "Corré: npm run bootstrap (ya carga .env.local automáticamente)",
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
  console.log("== Bootstrap: primera organización + primer SUPER_ADMIN ==\n");

  const orgName = await ask("Nombre de la organización (ej. Forrajería Lavanda): ");
  const orgSlug = await ask("Slug único, sin espacios (ej. forrajeria-lavanda): ");

  console.log("\nDatos del primer SUPER_ADMIN:");
  const fullName = await ask("Nombre completo: ");
  const username = await ask("Usuario: ");
  const dni = await ask("DNI: ");
  const email = await ask("Email: ");
  const password = await ask("Contraseña inicial (mínimo 8 caracteres): ");

  rl.close();

  if (password.length < 8) {
    console.error("La contraseña debe tener al menos 8 caracteres.");
    process.exit(1);
  }

  console.log("\nCreando organización...");
  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .insert({ name: orgName, slug: orgSlug })
    .select()
    .single();

  if (orgError) {
    console.error("Error creando la organización:", orgError.message);
    process.exit(1);
  }

  console.log("Creando usuario en Supabase Auth...");
  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError) {
    console.error("Error creando el usuario:", authError.message);
    await supabase.from("organizations").delete().eq("id", org.id);
    process.exit(1);
  }

  console.log("Creando perfil SUPER_ADMIN...");
  const { error: profileError } = await supabase.from("profiles").insert({
    id: authUser.user.id,
    organization_id: org.id,
    username,
    full_name: fullName,
    dni,
    email,
    role: "SUPER_ADMIN",
  });

  if (profileError) {
    console.error("Error creando el perfil:", profileError.message);
    console.error(
      `Revertí manualmente si hace falta: borrar el usuario ${authUser.user.id} en Supabase Auth y la organización ${org.id}.`,
    );
    process.exit(1);
  }

  console.log("\n✔ Listo. Ya podés iniciar sesión con:");
  console.log(`  Email: ${email}`);
  console.log(`  Contraseña: la que ingresaste recién`);
}

main();
