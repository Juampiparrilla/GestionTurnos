export type Board = {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type BoardMember = {
  id: string;
  organization_id: string;
  board_id: string;
  user_id: string;
  active: boolean;
  created_by: string | null;
  created_at: string;
};

export type OrgDirectoryEntry = {
  id: string;
  organization_id: string;
  username: string;
  full_name: string;
  role: "SUPER_ADMIN" | "ADMIN" | "EMPLEADO";
  active: boolean;
};
