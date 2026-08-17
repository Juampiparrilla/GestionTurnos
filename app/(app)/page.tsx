import { getCurrentProfile } from "@/lib/auth/session";
import { ROLE_LABEL } from "@/types/profile";

export default async function HomePage() {
  const profile = await getCurrentProfile();

  return (
    <div className="flex flex-col items-center gap-2 py-12 text-center">
      <h1 className="text-2xl font-semibold">Hola, {profile?.full_name}</h1>
      <p className="text-muted-foreground">
        {profile ? ROLE_LABEL[profile.role] : null}
      </p>
    </div>
  );
}
