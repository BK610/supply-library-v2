# Community Invitation Policies Fix

This migration fixes the Row-Level Security (RLS) policies for community invitations to ensure that users can see invitations sent to their email address.

## Issue Fixed

The main issue was that users couldn't see invitations sent to their email addresses because the policy was incorrectly referencing `public.profiles` instead of `auth.users`.

## Key Changes

1. **Fixed Email Lookup**: Changed the policy to look up the user's email directly from `auth.users` instead of `public.profiles`.

2. **Added Missing Policies**: Added explicit policies for:

   - Creating invitations (INSERT)
   - Updating invitations (UPDATE)

3. **Policy Cleanup**: Dropped existing policies before creating new ones to avoid naming conflicts.

## Policies Added/Modified

- **Allow users to see invitations sent to their email**: Fixed to correctly match the user's email from `auth.users`
- **Allow community admins to manage invitations**: General policy for admin access
- **Allow community admins to create invitations**: Specific INSERT policy for admins
- **Allow users to update invitations sent to them**: New policy to let users accept/decline invitations

## How to Apply

```bash
# Using Supabase CLI
supabase db reset

# Or manually through SQL Editor in Supabase Dashboard
# 1. Connect to your Supabase database
# 2. Run the SQL commands in 03_fix_invitation_policies.sql
```
