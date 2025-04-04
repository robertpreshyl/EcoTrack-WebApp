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
    // Get the request body (email, password)
    const { email, password, name } = await request.json();
    
    // Validate the input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    // Create a Supabase client
    const supabase = createRouteHandlerClient({ cookies });
    
    // Register the user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });
    
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    // Return success response
    return NextResponse.json({
      message: 'Registration successful',
      user: data.user,
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    return NextResponse.json(
      { error: 'An unexpected error occurred during registration' },
      { status: 500 }
    );
  }
} 