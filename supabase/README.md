# Supabase Setup for Community Item Sharing App

This guide explains how to set up Supabase for the community item sharing application.

## Prerequisites

1. Create a Supabase account at [supabase.com](https://supabase.com)
2. Create a new Supabase project

## Environment Variables

Add the following environment variables to your `.env.local` file:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

You can find these values in your Supabase project settings under "API" section.

## Database Setup

1. In your Supabase project, navigate to the SQL Editor
2. Copy the contents of `schema.sql` file and run it in the SQL Editor
3. This will create all necessary tables with proper relationships and security policies

## Authentication Setup

The application uses Supabase Auth for user authentication. The default setup includes:

1. Email/password authentication
2. Automatic profile creation upon user signup (via database trigger)

### Enabling Email Confirmation

1. Go to Authentication > Settings in your Supabase dashboard
2. Under "Email Auth", make sure "Enable Email Confirmations" is turned on
3. Configure your email templates as needed

## Testing the Setup

1. Create a test user account through the application's signup form
2. Check your Supabase dashboard > Authentication > Users to see if the user was created
3. Check the `profiles` table to ensure a corresponding profile was created

## Security Considerations

The schema includes Row Level Security (RLS) policies that:

1. Allow users to view public data
2. Restrict modification of resources to their owners
3. Implement appropriate access control for community resources

Review and customize these policies as needed for your specific requirements.

## Next Steps

After setting up Supabase:

1. Test user registration and login flows
2. Implement additional authentication features as needed (social logins, password reset, etc.)
3. Add additional RLS policies as your application features expand
