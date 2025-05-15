-- Fix for Community Invitations Row Level Security policies

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow community admins to manage invitations" ON public.community_invitations;
DROP POLICY IF EXISTS "Allow users to see invitations sent to their email" ON public.community_invitations;
DROP POLICY IF EXISTS "Allow community admins to create invitations" ON public.community_invitations;
DROP POLICY IF EXISTS "Allow users to update invitations sent to them" ON public.community_invitations;

-- First, create a proper function to safely get the current user's email
CREATE OR REPLACE FUNCTION public.get_auth_email()
RETURNS TEXT AS $$
  SELECT email FROM auth.users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Allow users to see invitations sent to their email (simplified)
CREATE POLICY "Allow users to see invitations sent to their email"
  ON public.community_invitations FOR SELECT
  USING (
    email = public.get_auth_email()
  );

-- Allow community admins to view invitations for their communities
CREATE POLICY "Allow community admins to view invitations" 
  ON public.community_invitations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.community_members
      WHERE community_members.community_id = community_invitations.community_id
      AND community_members.member_id = auth.uid()
      AND community_members.role = 'admin'
    )
  );

-- Create policy for inserting invitations
CREATE POLICY "Allow community admins to create invitations" 
  ON public.community_invitations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.community_members
      WHERE community_members.community_id = community_invitations.community_id
      AND community_members.member_id = auth.uid()
      AND community_members.role = 'admin'
    )
  );

-- Create policy for updating invitations
CREATE POLICY "Allow users to update invitations sent to them" 
  ON public.community_invitations FOR UPDATE
  USING (
    email = public.get_auth_email()
  ); 