-- Create community_invitations table
CREATE TABLE public.community_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE,
  inviter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'accepted', 'declined'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on the new table
ALTER TABLE public.community_invitations ENABLE ROW LEVEL SECURITY;

-- Add policies for the community_invitations table

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

-- Allow users to see invitations sent to their email
CREATE POLICY "Allow users to see invitations sent to their email"
  ON public.community_invitations FOR SELECT
  USING (
    email = (
      SELECT email FROM public.profiles
      WHERE id = auth.uid()
    )
  );

-- Add an index for quicker lookups by email
CREATE INDEX idx_community_invitations_email ON public.community_invitations(email);

-- Add an index for community lookups
CREATE INDEX idx_community_invitations_community ON public.community_invitations(community_id); 