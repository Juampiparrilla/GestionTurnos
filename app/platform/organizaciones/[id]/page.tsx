import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OrganizationDetail } from "@/components/platform/organization-detail";
import type { PlatformOrganizationDetail } from "@/types/organization";

export default async function PlatformOrganizationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .rpc("get_organization_detail_for_platform_admin", { p_organization_id: id })
    .maybeSingle();

  const org = data as PlatformOrganizationDetail | null;

  if (!org) {
    notFound();
  }

  return <OrganizationDetail organization={org} />;
}
