-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'obra-documents',
  'obra-documents',
  false,
  52428800, -- 50MB limit
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
);

-- RLS Policies for storage.objects in obra-documents bucket
CREATE POLICY "Users can upload documents to their obras"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'obra-documents' AND
  EXISTS (
    SELECT 1 FROM public.obras
    WHERE obras.id::text = (storage.foldername(name))[1]
    AND obras.user_id = auth.uid()
  )
);

CREATE POLICY "Users can view documents from their obras"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'obra-documents' AND
  EXISTS (
    SELECT 1 FROM public.obras
    WHERE obras.id::text = (storage.foldername(name))[1]
    AND obras.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete documents from their obras"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'obra-documents' AND
  EXISTS (
    SELECT 1 FROM public.obras
    WHERE obras.id::text = (storage.foldername(name))[1]
    AND obras.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update documents from their obras"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'obra-documents' AND
  EXISTS (
    SELECT 1 FROM public.obras
    WHERE obras.id::text = (storage.foldername(name))[1]
    AND obras.user_id = auth.uid()
  )
);