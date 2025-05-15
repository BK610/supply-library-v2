# Fix for Invitation Acceptance Issues

This migration addresses the foreign key constraint error that occurs when accepting community invitations.

## Issue Fixed

When a user tries to accept an invitation, they encounter: "insert or update on table 'community_members' violates foreign key constraint 'community_members_member_id_fkey'".

This happens because the user's profile might not exist in the `profiles` table, even though they have an auth account. Since the `community_members` table has a foreign key constraint to the `profiles` table, the insert fails.

## Key Changes

1. **Created an `ensure_profile_exists` Function**: A secure function that checks if a user's profile exists, and if not, creates it using data from `auth.users`.

2. **Created an `accept_invitation` Function**: A comprehensive, security-definer function that:

   - Validates the invitation exists and belongs to the user
   - Ensures the user's profile exists before attempting to add them
   - Updates the invitation status and adds the user as a member in a single transaction
   - Handles errors gracefully

3. **Moved Logic to Database**: Moved the critical security and data consistency checks to the database level, making them more robust.

## Benefits

1. **Better Error Handling**: Catches and handles the foreign key error before it happens
2. **Improved Security**: All sensitive operations are handled with `SECURITY DEFINER` functions
3. **Data Consistency**: Ensures profile exists before adding a member
4. **Atomic Updates**: Either the whole acceptance process completes or nothing happens

## How to Apply

```bash
# Using Supabase CLI
supabase db reset

# Or manually through SQL Editor in Supabase Dashboard
# 1. Connect to your Supabase database
# 2. Run the SQL commands in 05_fix_member_constraint.sql
```

After applying this migration, be sure to also update the `respondToInvitation` function in `lib/communities.ts` to use the new `accept_invitation` RPC function.
