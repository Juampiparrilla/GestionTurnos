import type { ReactNode } from "react";
import { getCurrentProfile } from "@/lib/auth/session";
import { SectionTabs } from "@/components/section-tabs";

export default async function BoardLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  const isAdmin = profile?.role === "ADMIN" || profile?.role === "SUPER_ADMIN";

  return (
    <div className="space-y-4">
      <SectionTabs
        label="Secciones de este horario"
        tabs={[
          { href: `/tableros/${id}`, label: "Calendario", exact: true },
          ...(isAdmin ? [{ href: `/tableros/${id}/configuracion`, label: "Configuración" }] : []),
          { href: `/tableros/${id}/domingos`, label: "Domingos" },
          { href: `/tableros/${id}/feriados`, label: "Feriados" },
        ]}
      />
      {children}
    </div>
  );
}
