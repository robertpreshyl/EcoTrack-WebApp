import { createBrowserClient } from '@supabase/ssr';

// For browser-side access to Supabase
export const createBrowserSupabaseClient = () => {
  // Get the environment variables from Next.js
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase credentials are missing. Please check your environment variables.');
    throw new Error('Supabase credentials are missing');
  }

  // Create and return the Supabase client
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
};

// Export a singleton instance for convenience in places where 
// creating a fresh client isn't needed
export const supabase = createBrowserSupabaseClient(); 