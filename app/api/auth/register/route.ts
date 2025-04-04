import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import type { NextRequest } from 'next/server';

/**
 * API Route to handle user registration
 * This includes creating the Supabase Auth user and setting up their initial profile
 */
export async function POST(request: NextRequest) {
  try {
    // Get the request body
    const { email, password, name, username } = await request.json();
    
    // Validate the input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    // Create a Supabase client with proper cookie handling
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ 
      cookies: () => cookieStore 
    });
    
    // Register the user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name || '',
          username: username || '',
        },
      },
    });
    
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    // Create user profile if registration was successful
    if (data.user) {
      try {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: data.user.email,
            name: name || '',
            username: username || '',
            language: 'en',
            country: 'global',
          });
        
        if (profileError) {
          console.error('Error creating user profile:', profileError);
        }
      } catch (profileError) {
        console.error('Failed to create user profile:', profileError);
      }
    }
    
    // Return success response
    return NextResponse.json({
      message: 'Registration successful',
      user: data.user,
      confirmed: !data.user?.identities?.[0]?.identity_data?.email_verified,
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    return NextResponse.json(
      { error: 'An unexpected error occurred during registration' },
      { status: 500 }
    );
  }
} 