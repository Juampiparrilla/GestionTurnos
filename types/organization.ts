export type Organization = {
  id: string;
  name: string;
  slug: string;
  phone: string | null;
  active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type PlatformOrganizationSummary = {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  created_at: string;
  super_admin_name: string | null;
  user_count: number;
};

export type PlatformOrganizationDetail = {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  created_at: string;
  super_admin_id: string | null;
  super_admin_name: string | null;
  super_admin_email: string | null;
  admin_count: number;
  employee_count: number;
  invitation_used_at: string | null;
  invitation_revoked_at: string | null;
  invitation_expires_at: string | null;
};
