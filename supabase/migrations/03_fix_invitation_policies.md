# Community Invitation Policies Fix

This migration fixes the Row-Level Security (RLS) policies for community invitations to ensure that users can see invitations sent to their email address.

## Issues Fixed

1. **Permission Denied for Table Users**: Users couldn't access the auth.users table directly, causing "permission denied" errors when trying to fetch invitations.

2. **Invitation Visibility Issues**: The original policy structure didn't properly allow both users to see their own invitations and admins to see community invitations.

## Key Changes

1. **Created a Security Definer Function**: Added a `get_auth_email()` function with SECURITY DEFINER that safely retrieves the user's email without direct access to auth.users.

2. **Separated Admin Policies**: Created distinct policies for different operations:

   - SELECT policy for users viewing their own invitations
   - SELECT policy for community admins viewing invitations for their communities
   - INSERT policy for admins creating invitations
   - UPDATE policy for users responding to invitations

3. **Simplified Email Matching**: Used the new function to simplify and securely match user emails.

## Policies Added/Modified

- **get_auth_email()**: A secure function that accesses auth.users on behalf of the user
- **Allow users to see invitations sent to their email**: Simplified to use the secure email function
- **Allow community admins to view invitations**: Specific SELECT policy for community admins
- **Allow community admins to create invitations**: Policy for creating new invitations
- **Allow users to update invitations sent to them**: Policy for accepting/declining invitations

## How to Apply

```bash
# Using Supabase CLI
supabase db reset

# Or manually through SQL Editor in Supabase Dashboard
# 1. Connect to your Supabase database
# 2. Run the SQL commands in 03_fix_invitation_policies.sql
```
