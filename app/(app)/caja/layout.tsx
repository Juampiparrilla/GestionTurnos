import type { ReactNode } from "react";
import { getCurrentProfile } from "@/lib/auth/session";
import { SectionTabs } from "@/components/section-tabs";

export default async function CajaLayout({ children }: { children: ReactNode }) {
  const profile = await getCurrentProfile();
  const isAdmin = profile?.role === "ADMIN" || profile?.role === "SUPER_ADMIN";

  return (
    <div className="space-y-4">
      <SectionTabs
        label="Secciones de Caja"
        tabs={[
          { href: "/caja", label: "Resumen", exact: true },
          { href: "/caja/movimientos", label: "Movimientos" },
          ...(isAdmin
            ? [
                { href: "/caja/etiquetas", label: "Etiquetas" },
                { href: "/caja/deudas", label: "Deudas" },
              ]
            : []),
        ]}
      />
      {children}
    </div>
  );
}
