import Link from "next/link";
import { redirect } from "next/navigation";
import { LayoutGrid, Package, Tag, Truck } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth/session";

const SECTIONS = [
  { href: "/productos/productos", label: "Productos", icon: Package },
  { href: "/productos/marcas", label: "Marcas", icon: Tag },
  { href: "/productos/categorias", label: "Categorías", icon: LayoutGrid },
  { href: "/productos/proveedores", label: "Proveedores", icon: Truck },
];

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
    <div className="grid grid-cols-2 gap-3">
      {SECTIONS.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className="flex flex-col items-center justify-center gap-2 rounded-lg bg-zinc-900 p-8 text-center text-white shadow-sm transition-colors hover:bg-zinc-800"
        >
          <Icon className="size-6" aria-hidden="true" />
          <span className="font-medium">{label}</span>
        </Link>
      ))}
    </div>
  );
}
