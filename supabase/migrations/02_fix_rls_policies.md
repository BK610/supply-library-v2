# RLS Policy Fix Migration

This migration addresses Row-Level Security (RLS) policies that were causing issues with community access and item management.

## Issues Fixed

1. **Community Access**: The most critical issue was that users couldn't see communities or create new ones due to overly restrictive community policies.

2. **Infinite Recursion in Community Members Policy**: The original policy caused infinite recursion by self-referencing the community_members table in a way that created a loop.

3. **Visibility of Community Items**: Items in communities were not visible to community members because there was no SELECT policy on the `community_items` table.

4. **Adding Items to Communities**: Users could not add items to communities because there was no INSERT policy on the `community_items` table.

## Key Changes

1. **Restored Public Community Visibility**: Set community table SELECT policy to allow all users to view all communities, matching the original schema intent.

2. **Fixed Recursive Query**: Changed the community members policy to use direct checks instead of a recursive query that caused infinite recursion.

3. **Simplified Admin Checks**: Used community creator status directly instead of checking admin role recursively.

4. **Added Missing Community Policies**: Restored the original policy for creating communities and added a policy for community creators to update their communities.

## Policies Added/Modified

### For `communities` table:

- Allow all users to view all communities (public read access)
- Allow authenticated users to create communities
- Allow community creators to update their communities

### For `community_members` table:

- Allow members to view other members (fixed recursive query)
- Allow users to join communities (self-registration)
- Allow community creators to add members

### For `community_items` table:

- Allow community members to view items in their communities
- Allow item owners to add their items to communities they're members of
- Allow community creators to manage community items

## How to Apply

```bash
# Using Supabase CLI
supabase db reset

# Or manually through SQL Editor in Supabase Dashboard
# 1. Connect to your Supabase database
# 2. Run the SQL commands in 02_fix_rls_policies.sql
```
