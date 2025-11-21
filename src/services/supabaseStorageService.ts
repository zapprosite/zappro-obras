import { supabase } from "@/integrations/supabase/client";
import { Document, DocumentUpload } from "@/types/documents";

const BUCKET_NAME = "obra-documents";

export const supabaseStorageService = {
  async uploadDocument(upload: DocumentUpload): Promise<Document | null> {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error("User not authenticated");

      // Create unique file path
      const fileExt = upload.file.name.split('.').pop();
      const fileName = `${upload.obra_id}/${Date.now()}.${fileExt}`;

      // Upload file to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, upload.file);

      if (uploadError) throw uploadError;

      // Create document record
      const { data: document, error: docError } = await supabase
        .from('documents')
        .insert({
          obra_id: upload.obra_id,
          file_name: upload.file.name,
          file_path: uploadData.path,
          file_size: upload.file.size,
          document_type: upload.document_type,
          user_id: user.id,
        })
        .select()
        .single();

      if (docError) throw docError;

      return document as Document;
    } catch (error) {
      console.error("Error uploading document:", error);
      return null;
    }
  },

  async getDocuments(obra_id: string): Promise<Document[]> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('obra_id', obra_id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching documents:", error);
      return [];
    }

    return (data || []) as Document[];
  },

  async getDocumentUrl(filePath: string): Promise<string | null> {
    const { data } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return data.publicUrl;
  },

  async deleteDocument(id: string, filePath: string): Promise<boolean> {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([filePath]);

      if (storageError) throw storageError;

      // Delete record
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);

      if (dbError) throw dbError;

      return true;
    } catch (error) {
      console.error("Error deleting document:", error);
      return false;
    }
  },
};
