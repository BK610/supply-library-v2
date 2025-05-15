# Fix for Invitation Response Issues

This migration addresses issues with responding to community invitations due to permission problems and data consistency between `auth.users` and `profiles` tables.

## Issues Fixed

1. **Error Fetching User Profile**: Users were getting "JSON object requested, multiple (or no) rows returned" errors when trying to respond to invitations.

2. **Profile Access Permission**: The original code was directly querying the profiles table, which could lead to permission issues.

3. **Email Consistency**: Ensures email addresses are kept in sync between the `auth.users` and the `profiles` tables.

## Key Changes

1. **Added Secure Helper Function**: Created `get_user_profile_email()` to securely access profile emails.

2. **Added Missing Profile Policies**: Created explicit policies allowing users to read their own profiles.

3. **Fixed Invitation Update Policy**: Corrected the policy for updating invitations to use the secure email function.

4. **Email Synchronization**: Added a trigger to keep email addresses synchronized between `auth.users` and `profiles` tables when users update their email.

5. **Optimized Email Lookups**: Added an index on the profiles email column for faster lookups.

## How to Apply

```bash
# Using Supabase CLI
supabase db reset

# Or manually through SQL Editor in Supabase Dashboard
# 1. Connect to your Supabase database
# 2. Run the SQL commands in 04_fix_invitation_response.sql
```

After applying this migration, be sure to also update the `respondToInvitation` function in `lib/communities.ts` to use the new secure function for fetching user emails.
