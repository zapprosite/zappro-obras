export interface Document {
  id: string;
  obra_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  document_type: 'contract' | 'budget' | 'rdo' | 'other';
  upload_date: string;
  created_at: string;
  user_id: string;
}

export interface DocumentUpload {
  obra_id: string;
  file: File;
  document_type: 'contract' | 'budget' | 'rdo' | 'other';
}

export interface DocumentVersion {
  id: string;
  document_id: string;
  version_number: number;
  file_path: string;
  created_at: string;
}
