-- Add file sharing capabilities to project messages
-- This migration adds file_url and file_name columns to the messages table

-- Add columns for file attachments
ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS file_url text,
ADD COLUMN IF NOT EXISTS file_name text;

-- Create storage bucket for chat files if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-files', 'chat-files', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for chat-files bucket
CREATE POLICY "Anyone can view chat files"
ON storage.objects FOR SELECT
USING (bucket_id = 'chat-files');

CREATE POLICY "Authenticated users can upload chat files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'chat-files'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can delete their own chat files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'chat-files'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Add comment to explain the columns
COMMENT ON COLUMN public.messages.file_url IS 'URL to uploaded file attachment';
COMMENT ON COLUMN public.messages.file_name IS 'Original filename of the uploaded file';
