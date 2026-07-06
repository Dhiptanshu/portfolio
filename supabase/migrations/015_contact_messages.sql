-- Contact Messages System
-- Migration to create the contact_messages table and related security policies

CREATE TYPE message_status AS ENUM ('unread', 'read', 'archived', 'replied');

CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    company TEXT,
    role TEXT,
    region TEXT,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    linkedin TEXT,
    attachment_url TEXT,
    status message_status DEFAULT 'unread'::message_status NOT NULL,
    internal_notes TEXT,
    is_spam BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add indexes for fast querying in admin panel
CREATE INDEX idx_contact_messages_status ON public.contact_messages(status);
CREATE INDEX idx_contact_messages_created_at ON public.contact_messages(created_at DESC);
CREATE INDEX idx_contact_messages_email ON public.contact_messages(email);

-- Enable RLS
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to insert messages
CREATE POLICY "Enable insert for anonymous users" 
ON public.contact_messages FOR INSERT 
TO anon 
WITH CHECK (true);

-- Allow authenticated admins to do everything
CREATE POLICY "Enable ALL for authenticated users" 
ON public.contact_messages FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Create a storage bucket for contact attachments
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'contact-attachments',
    'contact-attachments',
    false, -- Private bucket, only admin can view
    5242880, -- 5MB limit
    ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO UPDATE SET 
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage policies for attachments
-- Allow anonymous uploads
CREATE POLICY "Allow public uploads to contact attachments"
ON storage.objects FOR INSERT TO public
WITH CHECK (bucket_id = 'contact-attachments');

-- Only admins can select, update, delete
CREATE POLICY "Allow admin to manage contact attachments"
ON storage.objects FOR ALL TO authenticated
USING (bucket_id = 'contact-attachments')
WITH CHECK (bucket_id = 'contact-attachments');
