# EcoTrack Supabase Setup Guide

This guide will walk you through setting up Supabase for the EcoTrack carbon footprint tracker.

## Prerequisites

- Supabase account (https://supabase.com)
- Node.js and npm
- EcoTrack codebase

## Step 1: Create a Supabase Project

1. Log in to your Supabase account
2. Click "New Project"
3. Enter a name for your project (e.g., "ecotrack")
4. Choose a region closest to your target users (recommended: EU region for Finland-based service)
5. Set a secure database password (and store it safely)
6. Wait for the project creation to complete (takes a few minutes)

## Step 2: Set Up Database Schema

1. In your Supabase dashboard, navigate to the "SQL Editor"
2. Create a new query
3. Copy and paste the contents of `lib/supabase/schema.sql` into the editor
4. Run the query to create all tables and security policies
5. Verify that tables were created by going to the "Table Editor" section

## Step 3: Configure Authentication

1. In your Supabase dashboard, go to "Authentication" -> "Settings"
2. Under "Site URL", enter your application URL (during development, use http://localhost:3000)
3. Configure email templates under "Email Templates" if desired
4. Optionally, enable additional authentication providers such as Google, GitHub, etc.

## Step 4: Get API Keys

1. In your Supabase dashboard, go to "Settings" -> "API"
2. You'll need two key values:
   - **URL**: The URL of your Supabase project
   - **anon key**: The anonymous API key (used for client-side operations)

## Step 5: Configure Environment Variables

1. In your EcoTrack project, ensure `.env.local` is updated with your Supabase keys:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Step 6: Testing the Integration

Once your environment variables are set, you can test the integration:

1. Start your development server: `npm run dev`
2. Try signing up for a new account through the Auth component
3. Verify in your Supabase dashboard under "Authentication" -> "Users" that a new user was created
4. Verify in the "Table Editor" that a profile was automatically created for the new user

## Common Issues and Troubleshooting

### Authentication Issues

- Ensure your Site URL is correctly set in Supabase Authentication settings
- Check browser console for CORS errors
- Verify that environment variables are correctly set

### Database Issues

- Check row-level security (RLS) policies if you can't see or insert data
- Verify relationships between tables if you encounter foreign key errors
- Check SQL syntax if schema creation fails

## Next Steps

- Set up your Carbon Interface API integration
- Implement the footprint calculation API
- Create server-side API routes for data storage

## Helpful Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Next.js with Supabase Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers/nextjs) 