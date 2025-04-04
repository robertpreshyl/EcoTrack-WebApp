"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Session, User } from '@supabase/supabase-js';

type UserContextType = {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
};

const UserContext = createContext<UserContextType>({
  session: null,
  user: null,
  isLoading: true,
  signOut: async () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [supabase, setSupabase] = useState<any>(null);

  // Initialize the Supabase client just once to avoid multiple instances
  useEffect(() => {
    // Clear any corrupted local storage or cookies
    try {
      if (typeof window !== 'undefined') {
        if (window.localStorage.getItem('supabase.auth.token') === 'undefined') {
          window.localStorage.removeItem('supabase.auth.token');
        }
      }
    } catch (e) {
      console.error('Error cleaning up localStorage:', e);
    }

    // Create the supabase browser client
    const client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    setSupabase(client);
  }, []);

  // Get session and set up auth listener once supabase client is available
  useEffect(() => {
    if (!supabase) return;

    // Get initial session
    const getSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
        setUser(data.session?.user ?? null);
      } catch (error) {
        console.error('Error getting session:', error);
        // Reset state on error
        setSession(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    getSession();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event: string, newSession: Session | null) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        setIsLoading(false);
      }
    );

    return () => {
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [supabase]);

  const signOut = async () => {
    if (!supabase) return;
    try {
      await supabase.auth.signOut();
      // Clear any local storage data that might be persisting the session
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('supabase.auth.token');
      }
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <UserContext.Provider value={{ session, user, isLoading, signOut }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext); 