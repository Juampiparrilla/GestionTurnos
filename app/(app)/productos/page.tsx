import Link from "next/link";
import { redirect } from "next/navigation";
import { FileText, LayoutGrid, Package, Percent, Tag, Truck } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth/session";
import { LinkPendingSpinner } from "@/components/link-pending-spinner";
import { FuncionalidadesDialog } from "@/components/productos/funcionalidades-dialog";
import { ImportarExcelSheet } from "@/components/productos/importar-excel-sheet";

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
    <div className="space-y-3">
      <FuncionalidadesDialog />
      <ImportarExcelSheet />
      <div className="grid grid-cols-2 gap-3">
        {SECTIONS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center justify-center gap-2 rounded-lg bg-zinc-900 p-8 text-center text-white shadow-sm transition-colors hover:bg-zinc-800"
          >
            <Icon className="size-6" aria-hidden="true" />
            <span className="font-medium">{label}</span>
            <LinkPendingSpinner />
          </Link>
        ))}
      </div>
      <Link
        href="/productos/reportes"
        className="flex items-center justify-center gap-2 rounded-lg bg-zinc-900 p-4 text-center text-white shadow-sm transition-colors hover:bg-zinc-800"
      >
        <FileText className="size-5" aria-hidden="true" />
        <span className="font-medium">Reportes</span>
        <LinkPendingSpinner />
      </Link>
      <Link
        href="/productos/actualizar-costos"
        className="flex items-center justify-center gap-2 rounded-lg bg-zinc-900 p-4 text-center text-white shadow-sm transition-colors hover:bg-zinc-800"
      >
        <Percent className="size-5" aria-hidden="true" />
        <span className="font-medium">Actualizar costos</span>
        <LinkPendingSpinner />
      </Link>
    </div>
  );
}
