-- Fix for responding to invitations

-- Create a secure function to get a user's profile email
CREATE OR REPLACE FUNCTION public.get_user_profile_email(user_id UUID)
RETURNS TEXT AS $$
  SELECT email FROM public.profiles WHERE id = user_id;
$$ LANGUAGE sql SECURITY DEFINER;

-- Add a policy to allow users to read their own profiles
DROP POLICY IF EXISTS "Allow users to read their own profiles" ON public.profiles;
CREATE POLICY "Allow users to read their own profiles" 
  ON public.profiles FOR SELECT 
  USING (id = auth.uid());

-- Fix the policy for updating invitations to prevent conflicts
DROP POLICY IF EXISTS "Allow users to update invitations sent to them" ON public.community_invitations;
CREATE POLICY "Allow users to update invitations sent to them" 
  ON public.community_invitations FOR UPDATE
  USING (
    email = public.get_auth_email()
  );

-- Create policy for users to view their profiles
DROP POLICY IF EXISTS "Allow users to view their own profile" ON public.profiles;
CREATE POLICY "Allow users to view their own profile" 
  ON public.profiles FOR SELECT 
  USING (id = auth.uid());

-- Ensure the proper index exists on profile email for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Ensure that email is properly maintained in both auth.users and profiles
CREATE OR REPLACE FUNCTION public.handle_email_update() 
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET email = NEW.email
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add trigger to maintain email consistency
DROP TRIGGER IF EXISTS on_auth_user_email_update ON auth.users;
CREATE TRIGGER on_auth_user_email_update
  AFTER UPDATE OF email ON auth.users
  FOR EACH ROW
  WHEN (OLD.email IS DISTINCT FROM NEW.email)
  EXECUTE FUNCTION public.handle_email_update(); 