export type ShiftConfiguration = {
  id: string;
  organization_id: string;
  board_id: string;
  name: string | null;
  start_time: string;
  end_time: string;
  sort_order: number;
  active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};
