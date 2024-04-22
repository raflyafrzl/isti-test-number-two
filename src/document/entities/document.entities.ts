export class DocumentEntity {
  id: string;
  filename: string;
  resource_type: string;
  url?: string;
  access?: DocumentAccessEntity[];
  original_filename: string;
  created_at: Date;
  updated_at: Date;
}
export class DocumentAccessEntity {
  target_id: string;
  permission: string[];
  document_id: string;
  id: string;
}
