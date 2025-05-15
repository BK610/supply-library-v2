# Database Migrations

This directory contains migrations for the Supabase database schema.

## Migrations

- `01_community_invitations.sql`: Adds the community invitations feature to enable admins to invite users to communities

## How to Apply Migrations

### Option 1: Using Supabase CLI (Recommended)

If you have the Supabase CLI installed, you can run:

```bash
supabase db reset
```

This will apply the base schema and all migrations.

### Option 2: Manual Application

If you're manually managing your Supabase instance:

1. Connect to your Supabase database using the SQL Editor or psql
2. Run each migration file in order (based on the number prefix)

### Verifying Migrations

After applying migrations, you can verify that the tables were created correctly:

```sql
SELECT * FROM information_schema.tables WHERE table_schema = 'public';
```

You should see the `community_invitations` table in the results.

## Schema Changes

The `community_invitations` table has the following structure:

- `id`: UUID (primary key)
- `community_id`: UUID (foreign key to communities)
- `inviter_id`: UUID (foreign key to profiles)
- `email`: TEXT (email address of the invitee)
- `status`: TEXT ('pending', 'accepted', 'declined')
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

Row Level Security (RLS) policies are applied to ensure proper access control:

1. Community admins can manage all invitations for their communities
2. Users can view invitations sent to their email address
