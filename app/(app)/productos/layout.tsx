import type { ReactNode } from "react";
import { getCurrentProfile } from "@/lib/auth/session";
import { SectionTabs } from "@/components/section-tabs";

export default async function ProductosLayout({ children }: { children: ReactNode }) {
  const profile = await getCurrentProfile();
  const isAdmin = profile?.role === "ADMIN" || profile?.role === "SUPER_ADMIN";

  if (!isAdmin) {
    return <>{children}</>;
  }

  return (
    <div className="space-y-4">
      <SectionTabs
        label="Secciones de Productos"
        tabs={[
          { href: "/productos/productos", label: "Productos" },
          { href: "/productos/categorias", label: "Categorías" },
          { href: "/productos/marcas", label: "Marcas" },
          { href: "/productos/proveedores", label: "Proveedores" },
          { href: "/productos/actualizar-costos", label: "Costos" },
          { href: "/productos/reportes", label: "Reportes" },
        ]}
      />
      {children}
    </div>
  );
}
