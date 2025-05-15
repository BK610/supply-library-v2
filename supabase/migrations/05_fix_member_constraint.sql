-- Fix the foreign key constraint issue when accepting invitations

-- First, make sure the profile exists before trying to add the user as a member
CREATE OR REPLACE FUNCTION public.ensure_profile_exists(user_id UUID)
RETURNS VOID AS $$
DECLARE
  profile_exists BOOLEAN;
BEGIN
  -- Check if profile exists
  SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id = user_id) INTO profile_exists;
  
  -- If profile doesn't exist, create it from auth.users
  IF NOT profile_exists THEN
    INSERT INTO public.profiles (
      id, 
      username, 
      email,
      avatar_url
    )
    SELECT 
      id,
      COALESCE(raw_user_meta_data->>'username', 'user_' || substr(id::text, 1, 8)),
      email,
      raw_user_meta_data->>'avatar_url'
    FROM auth.users
    WHERE id = user_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the respondToInvitation function to use the ensure_profile_exists function
CREATE OR REPLACE FUNCTION public.accept_invitation(invitation_id UUID, user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  community_id UUID;
  invite_email TEXT;
  user_email TEXT;
BEGIN
  -- Get the invitation details
  SELECT ci.community_id, ci.email INTO community_id, invite_email
  FROM public.community_invitations ci
  WHERE ci.id = invitation_id AND ci.status = 'pending';
  
  -- If invitation not found, return false
  IF community_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Get user's email
  SELECT email INTO user_email FROM auth.users WHERE id = user_id;
  
  -- Verify email matches
  IF invite_email != user_email THEN
    RETURN FALSE;
  END IF;
  
  -- Ensure profile exists
  PERFORM public.ensure_profile_exists(user_id);
  
  -- Update invitation status
  UPDATE public.community_invitations
  SET status = 'accepted'
  WHERE id = invitation_id;
  
  -- Add user as member
  INSERT INTO public.community_members (community_id, member_id, role)
  VALUES (community_id, user_id, 'member');
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error accepting invitation: %', SQLERRM;
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 