import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import type { NextRequest } from 'next/server';

/**
 * API Route to handle fetching the user profile
 */
export async function GET(request: NextRequest) {
  try {
    // Create a Supabase client
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get the current session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }
    
    // Fetch the user profile
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();
      
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    // Return the profile data
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching profile:', error);
    
    return NextResponse.json(
      { error: 'An unexpected error occurred while fetching the profile' },
      { status: 500 }
    );
  }
}

/**
 * API Route to handle updating the user profile
 */
export async function PUT(request: NextRequest) {
  try {
    // Get the request body
    const profileData = await request.json();
    
    // Create a Supabase client
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get the current session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }
    
    // Update the user profile
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...profileData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', session.user.id)
      .select()
      .single();
      
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    // Return the updated profile data
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating profile:', error);
    
    return NextResponse.json(
      { error: 'An unexpected error occurred while updating the profile' },
      { status: 500 }
    );
  }
} 