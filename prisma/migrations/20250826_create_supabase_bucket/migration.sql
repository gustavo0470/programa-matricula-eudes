-- CreateBucket: student-documents
-- This migration creates the Supabase storage bucket for student documents

-- Insert the bucket into storage.buckets table
INSERT INTO storage.buckets (id, name, owner, public, avif_autodetection, file_size_limit, allowed_mime_types, created_at, updated_at)
VALUES (
  'student-documents',
  'student-documents', 
  null,
  true,
  false,
  10485760, -- 10MB limit
  ARRAY['image/*', 'application/pdf', 'text/*'],
  now(),
  now()
) ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for the bucket
-- Policy to allow authenticated users to upload files
CREATE POLICY IF NOT EXISTS "Allow authenticated users to upload" ON storage.objects
FOR INSERT 
TO authenticated
WITH CHECK (bucket_id = 'student-documents');

-- Policy to allow authenticated users to view files
CREATE POLICY IF NOT EXISTS "Allow authenticated users to view" ON storage.objects
FOR SELECT 
TO authenticated
USING (bucket_id = 'student-documents');

-- Policy to allow public access to files (since bucket is public)
CREATE POLICY IF NOT EXISTS "Allow public access to view files" ON storage.objects
FOR SELECT 
TO public
USING (bucket_id = 'student-documents');

-- Policy to allow authenticated users to update files
CREATE POLICY IF NOT EXISTS "Allow authenticated users to update" ON storage.objects
FOR UPDATE 
TO authenticated
USING (bucket_id = 'student-documents');

-- Policy to allow authenticated users to delete files
CREATE POLICY IF NOT EXISTS "Allow authenticated users to delete" ON storage.objects
FOR DELETE 
TO authenticated
USING (bucket_id = 'student-documents');