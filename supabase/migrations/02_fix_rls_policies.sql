-- Fix for Row Level Security policies

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow community members to view community members" ON public.community_members;
DROP POLICY IF EXISTS "Allow users to join communities" ON public.community_members;
DROP POLICY IF EXISTS "Allow community creators to add members" ON public.community_members;
DROP POLICY IF EXISTS "Allow community admins to add members" ON public.community_members;
DROP POLICY IF EXISTS "Allow users to view communities they are members of" ON public.communities;
DROP POLICY IF EXISTS "Allow users to read all communities" ON public.communities;
DROP POLICY IF EXISTS "Allow community members to view community items" ON public.community_items;
DROP POLICY IF EXISTS "Allow item owners to add their items to communities" ON public.community_items;
DROP POLICY IF EXISTS "Allow community admins to manage community items" ON public.community_items;

-- Fix community access policies
-- Important: We need to drop the restrictive policy and create a general one first
CREATE POLICY "Allow users to view all communities" 
  ON public.communities FOR SELECT 
  USING (true);

-- Allow authenticated users to create communities
CREATE POLICY "Allow authenticated users to create communities" 
  ON public.communities FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

-- Allow community creators to update their communities
CREATE POLICY "Allow community creators to update communities" 
  ON public.communities FOR UPDATE 
  USING (created_by = auth.uid());

-- Allow community members to view their community's members
CREATE POLICY "Allow community members to view community members"
  ON public.community_members FOR SELECT
  USING (
    -- Changed from recursive query to direct check
    auth.uid() = member_id OR
    EXISTS (
      SELECT 1 FROM public.communities 
      WHERE id = community_members.community_id 
      AND created_by = auth.uid()
    )
  );

-- Allow users to join communities (INSERT into community_members)
CREATE POLICY "Allow users to join communities"
  ON public.community_members FOR INSERT
  WITH CHECK (
    auth.uid() = member_id
  );

-- Allow community creators to add members
CREATE POLICY "Allow community creators to add members"
  ON public.community_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.communities
      WHERE id = community_members.community_id
      AND created_by = auth.uid()
    )
  );

-- Policies for community_items

-- Allow community members to view their community's items
CREATE POLICY "Allow community members to view community items"
  ON public.community_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.community_members
      WHERE community_id = community_items.community_id
      AND member_id = auth.uid()
    )
  );

-- Allow item owners to add their items to communities they're members of
CREATE POLICY "Allow item owners to add their items to communities"
  ON public.community_items FOR INSERT
  WITH CHECK (
    -- User must be a member of the community
    EXISTS (
      SELECT 1 FROM public.community_members
      WHERE community_id = community_items.community_id
      AND member_id = auth.uid()
    ) AND
    -- User must own the item
    EXISTS (
      SELECT 1 FROM public.items
      WHERE id = community_items.item_id
      AND owner_id = auth.uid()
    )
  );

-- Allow community admins to manage community items
CREATE POLICY "Allow community admins to manage community items"
  ON public.community_items 
  USING (
    EXISTS (
      SELECT 1 FROM public.communities
      WHERE id = community_items.community_id
      AND created_by = auth.uid()
    )
  ); 