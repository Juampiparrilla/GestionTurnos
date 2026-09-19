import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/session";

export default async function ProductosHomePage() {
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect("/login");
  }

  const isAdmin = profile.role === "ADMIN" || profile.role === "SUPER_ADMIN";

  if (isAdmin) {
    redirect("/productos/productos");
  }

  return (
    <div className="space-y-2">
      <h1 className="text-xl font-semibold">Productos</h1>
      <p className="text-sm text-muted-foreground">
        El buscador de productos todavía se está armando. Volvé pronto.
      </p>
    </div>
  );
}
