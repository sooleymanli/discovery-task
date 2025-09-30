-- Add author tracking columns to application_messages table
ALTER TABLE application_messages 
ADD COLUMN IF NOT EXISTS author_user_id uuid REFERENCES auth.users(id);

ALTER TABLE application_messages 
ADD COLUMN IF NOT EXISTS author_role text CHECK (author_role IN ('superadmin','agent'));
