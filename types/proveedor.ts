export type Proveedor = {
  id: string;
  organization_id: string;
  nombre: string;
  contacto: string | null;
  telefono: string | null;
  email: string | null;
  notas: string | null;
  active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};
