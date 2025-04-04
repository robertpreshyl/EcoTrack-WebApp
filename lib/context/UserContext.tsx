"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Session, User } from '@supabase/supabase-js';
import React from 'react';

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
    let isMounted = true;
    
    const cleanupLocalStorage = () => {
      try {
        if (typeof window !== 'undefined') {
          // Cleanup for old token format
          if (window.localStorage.getItem('supabase.auth.token') === 'undefined') {
            window.localStorage.removeItem('supabase.auth.token');
          }
          
          // Additional cleanup for potentially corrupted items
          const localStorageKeys = Object.keys(window.localStorage);
          for (const key of localStorageKeys) {
            if (key.startsWith('supabase.auth.')) {
              try {
                const value = window.localStorage.getItem(key);
                if (value && (value === 'undefined' || value === 'null' || value.startsWith('b'))) {
                  console.log('Removing corrupted localStorage item:', key);
                  window.localStorage.removeItem(key);
                }
              } catch (err) {
                console.error('Error parsing localStorage item:', key, err);
                window.localStorage.removeItem(key);
              }
            }
          }
          
          // Also clear any corrupted cookies by setting them to expire
          document.cookie.split(';').forEach(cookie => {
            const [name] = cookie.trim().split('=');
            if (name && name.includes('supabase')) {
              document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
            }
          });
        }
      } catch (e) {
        console.error('Error cleaning up storage:', e);
      }
    };
    
    // Clean storage before initialization
    cleanupLocalStorage();

    // Create the supabase browser client
    try {
      if (isMounted) {
        const client = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        setSupabase(client);
      }
    } catch (error) {
      console.error('Error creating Supabase client:', error);
    }
    
    return () => {
      isMounted = false;
    };
  }, []);

  // Get session and set up auth listener once supabase client is available
  useEffect(() => {
    let isMounted = true;
    
    if (!supabase) return;

    // Get initial session
    const getSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (isMounted) {
          setSession(data.session);
          setUser(data.session?.user ?? null);
        }
      } catch (error) {
        console.error('Error getting session:', error);
        // Reset state on error
        if (isMounted) {
          setSession(null);
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    getSession();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event: string, newSession: Session | null) => {
        if (isMounted) {
          setSession(newSession);
          setUser(newSession?.user ?? null);
          setIsLoading(false);
        }
      }
    );

    return () => {
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
      isMounted = false;
    };
  }, [supabase]);

  const signOut = async () => {
    if (!supabase) return;
    try {
      await supabase.auth.signOut();
      // Clear any local storage data that might be persisting the session
      if (typeof window !== 'undefined') {
        // Remove all supabase auth related items to ensure clean state
        const localStorageKeys = Object.keys(window.localStorage);
        for (const key of localStorageKeys) {
          if (key.startsWith('supabase.auth.')) {
            window.localStorage.removeItem(key);
          }
        }
        
        // Also clear any auth cookies
        document.cookie.split(';').forEach(cookie => {
          const [name] = cookie.trim().split('=');
          if (name && name.includes('supabase')) {
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
          }
        });
      }
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Use a simple React element to prevent any list rendering issues
  return (
    <UserContext.Provider value={{ session, user, isLoading, signOut }}>
      {React.Children.map(children, (child, index) => {
        // Add a key if it's a valid React element
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { key: `user-context-child-${index}` });
        }
        return child;
      })}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext); 