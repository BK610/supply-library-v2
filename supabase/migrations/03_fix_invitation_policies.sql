-- Fix for Community Invitations Row Level Security policies

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow community admins to manage invitations" ON public.community_invitations;
DROP POLICY IF EXISTS "Allow users to see invitations sent to their email" ON public.community_invitations;

-- Allow users to see invitations sent to their email
CREATE POLICY "Allow users to see invitations sent to their email"
  ON public.community_invitations FOR SELECT
  USING (
    email = (
      SELECT email FROM auth.users
      WHERE id = auth.uid()
    )
  );

-- Allow community admins to manage invitations
CREATE POLICY "Allow community admins to manage invitations"
  ON public.community_invitations
  USING (
    inviter_id = auth.uid() OR 
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
    email = (
      SELECT email FROM auth.users
      WHERE id = auth.uid()
    )
  ); 