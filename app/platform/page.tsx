import { createClient } from "@/lib/supabase/server";
import { OrganizationsList } from "@/components/platform/organizations-list";
import type { PlatformOrganizationSummary } from "@/types/organization";

export default async function PlatformOrganizationsPage() {
  const supabase = await createClient();
  const { data } = await supabase.rpc("list_organizations_for_platform_admin");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Organizaciones</h1>
        <p className="text-sm text-muted-foreground">
          Empresas que usan Gestión de Turnos.
        </p>
      </div>
      <OrganizationsList
        organizations={(data as PlatformOrganizationSummary[] | null) ?? []}
      />
    </div>
  );
}
