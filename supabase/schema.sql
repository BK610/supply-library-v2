-- Create profiles table that is linked to the auth.users
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create communities table
CREATE TABLE public.communities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles(id) NOT NULL
);

-- Create items table
CREATE TABLE public.items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  condition TEXT,
  category TEXT,
  image_url TEXT,
  consumable BOOLEAN DEFAULT FALSE,
  quantity INTEGER DEFAULT 1,
  owner_id UUID REFERENCES public.profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create table for community members
CREATE TABLE public.community_members (
  community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE,
  member_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member', -- 'admin', 'member', etc.
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (community_id, member_id)
);

-- Create table for items shared with communities
CREATE TABLE public.community_items (
  community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE,
  item_id UUID REFERENCES public.items(id) ON DELETE CASCADE,
  available BOOLEAN DEFAULT TRUE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (community_id, item_id)
);

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

-- Create table for borrowing requests
CREATE TABLE public.borrowing_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID REFERENCES public.items(id) NOT NULL,
  community_id UUID REFERENCES public.communities(id) NOT NULL,
  requester_id UUID REFERENCES public.profiles(id) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'returned'
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_at TIMESTAMP WITH TIME ZONE,
  due_date TIMESTAMP WITH TIME ZONE,
  returned_at TIMESTAMP WITH TIME ZONE,
  notes TEXT
);

-- Create a trigger to automatically create a profile after a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, email, avatar_url)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)), 
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add the trigger to the auth.users table
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Set up RLS (Row Level Security) policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.borrowing_requests ENABLE ROW LEVEL SECURITY;

-- Allow public reads on profiles
CREATE POLICY "Allow public read of profiles" 
  ON public.profiles FOR SELECT 
  USING (true);

-- Allow users to update their own profiles
CREATE POLICY "Allow users to update their own profiles" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Allow users to read all communities
CREATE POLICY "Allow users to read all communities" 
  ON public.communities FOR SELECT 
  USING (true);

-- Allow users to create communities
CREATE POLICY "Allow authenticated users to create communities" 
  ON public.communities FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

-- Allow community creators to update their communities
CREATE POLICY "Allow community creators to update communities" 
  ON public.communities FOR UPDATE 
  USING (auth.uid() = created_by);

-- Policies for items
CREATE POLICY "Allow users to view all items" 
  ON public.items FOR SELECT 
  USING (true);

CREATE POLICY "Allow users to create items" 
  ON public.items FOR INSERT 
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Allow item owners to update their items" 
  ON public.items FOR UPDATE 
  USING (auth.uid() = owner_id);

-- Policies for community invitations
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