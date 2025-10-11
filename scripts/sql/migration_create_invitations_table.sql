-- Migration: Create invitations table
-- Run this in your Supabase SQL Editor

-- Create invitations table for user invitations
CREATE TABLE public.invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  student_id text REFERENCES public.students(student_id),
  role public.app_role NOT NULL,
  scope_type text,
  scope_id bigint,
  invited_by uuid NOT NULL REFERENCES auth.users(id),
  token text NOT NULL UNIQUE,
  expires_at timestamp with time zone NOT NULL,
  accepted_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT invitations_unique_email_token UNIQUE (email, token)
);

-- Create indexes for better performance
CREATE INDEX idx_invitations_token ON public.invitations(token);
CREATE INDEX idx_invitations_email ON public.invitations(email);
CREATE INDEX idx_invitations_expires_at ON public.invitations(expires_at);

-- Grant necessary permissions
GRANT ALL ON public.invitations TO authenticated;
GRANT ALL ON public.invitations TO service_role;