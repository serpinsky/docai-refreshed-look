export interface Group {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentGroup {
  id: string;
  group_id: string;
  document_id: string;
  added_at: string;
}
