import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/session";

export default async function ProductosHomePage() {
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect("/login");
  }

  const isAdmin = profile.role === "ADMIN" || profile.role === "SUPER_ADMIN";

  if (!isAdmin) {
    return (
      <div className="space-y-2">
        <h1 className="text-xl font-semibold">Productos</h1>
        <p className="text-sm text-muted-foreground">
          El buscador de productos todavía se está armando. Volvé pronto.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Productos</h1>
        <p className="text-sm text-muted-foreground">Catálogo, precios y proveedores de la forrajería.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/productos/productos"
          className="rounded-lg border bg-background p-4 shadow-sm transition-colors hover:bg-muted/50"
        >
          <p className="font-medium">Productos</p>
          <p className="text-sm text-muted-foreground">Alta, edición y presentaciones con precios.</p>
        </Link>
        <Link
          href="/productos/marcas"
          className="rounded-lg border bg-background p-4 shadow-sm transition-colors hover:bg-muted/50"
        >
          <p className="font-medium">Marcas</p>
          <p className="text-sm text-muted-foreground">Belcan, Agility, Agrocan, etc.</p>
        </Link>
        <Link
          href="/productos/categorias"
          className="rounded-lg border bg-background p-4 shadow-sm transition-colors hover:bg-muted/50"
        >
          <p className="font-medium">Categorías</p>
          <p className="text-sm text-muted-foreground">Alimento perro adulto/cachorro, gato/gatito, etc.</p>
        </Link>
        <Link
          href="/productos/proveedores"
          className="rounded-lg border bg-background p-4 shadow-sm transition-colors hover:bg-muted/50"
        >
          <p className="font-medium">Proveedores</p>
          <p className="text-sm text-muted-foreground">Distribuidores y ajuste masivo de % de ganancia.</p>
        </Link>
      </div>
    </div>
  );
}
