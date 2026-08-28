export type Categoria = {
  id: string;
  organization_id: string;
  nombre: string;
  descripcion: string | null;
  active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};
