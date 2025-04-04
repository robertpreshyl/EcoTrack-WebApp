import { createBrowserClient } from '@supabase/ssr';
import { User } from '@supabase/supabase-js';

/**
 * Creates a Supabase client for browser usage
 * This is a helper function to simplify client creation
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

/**
 * Checks if a user is authenticated
 * @param user The user object from Supabase
 */
export function isAuthenticated(user: User | null): boolean {
  return !!user;
}

/**
 * Fetches the user profile from Supabase
 * @param userId The user ID
 */
export async function fetchUserProfile(userId: string) {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
}

/**
 * Updates the user profile in Supabase
 * @param userId The user ID
 * @param profile The profile data to update
 */
export async function updateUserProfile(userId: string, profile: any) {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('profiles')
      .update(profile)
      .eq('id', userId)
      .select()
      .single();
      
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
} 