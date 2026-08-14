export type UserRole = "SUPER_ADMIN" | "ADMIN" | "EMPLEADO";

export type Profile = {
  id: string;
  organization_id: string;
  username: string;
  full_name: string;
  dni: string;
  email: string;
  role: UserRole;
  active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
};
