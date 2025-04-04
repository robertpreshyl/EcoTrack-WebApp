import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { 
  simulateFootprintCalculation,
  calculateRealFootprint
} from '@/lib/services/footprint-service';
import { FootprintData } from '@/lib/types';

// POST /api/footprint - Calculate and save a footprint
export async function POST(request: NextRequest) {
  const cookieStore = cookies();
  
  // Create a Supabase client using the recommended pattern
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          const cookie = cookieStore.get(name);
          return cookie?.value;
        },
        set(name, value, options) {
          // We don't need to set cookies in a server-side API route
        },
        remove(name, options) {
          // We don't need to remove cookies in a server-side API route
        },
      },
    }
  );
  
  try {
    // Check authentication using getUser
    const { data, error: authError } = await supabase.auth.getUser();
    
    if (authError || !data.user) {
      console.error('Authentication error:', authError);
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Get user ID
    const userId = data.user.id;
    
    // Parse request body
    const inputData: FootprintData = await request.json();
    
    // Validate input data (basic validation for now)
    if (!inputData || !inputData.country) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Calculate footprint using real API (with fallback to simulation)
    console.log('Starting real footprint calculation...');
    const calculationResult = await calculateRealFootprint(inputData);
    
    console.log('Calculation complete, saving to database...');
    console.log('User ID:', userId);
    
    // Save to the footprints table
    const { data: footprintData, error: insertError } = await supabase
      .from('footprints')
      .insert({
        user_id: userId,
        total_co2e_kg: calculationResult.total_co2e_kg,
        country_code: inputData.country
      })
      .select()
      .single();
    
    if (insertError) {
      console.error('Error saving footprint:', insertError);
      return NextResponse.json(
        { error: 'Failed to save footprint: ' + insertError.message },
        { status: 500 }
      );
    }
    
    console.log('Footprint saved successfully, ID:', footprintData.id);
    
    // Save the breakdown details
    if (calculationResult.breakdown) {
      const breakdownEntries = Object.entries(calculationResult.breakdown).map(([category, value]) => ({
        footprint_id: footprintData.id,
        category,
        subcategory: 'total',
        value
      }));
      
      const { error: detailsError } = await supabase
        .from('footprint_details')
        .insert(breakdownEntries);
      
      if (detailsError) {
        console.error('Error saving footprint details:', detailsError);
      }
    }
    
    // Return the result
    return NextResponse.json({
      ...calculationResult,
      id: footprintData.id,
      created_at: footprintData.created_at
    });
  } catch (error: any) {
    console.error('Error in footprint calculation:', error);
    return NextResponse.json(
      { error: 'Failed to process request: ' + (error.message || 'Unknown error') },
      { status: 500 }
    );
  }
}

// GET /api/footprint - Get user's footprint history
export async function GET(request: NextRequest) {
  const cookieStore = cookies();
  
  // Create a Supabase client using the recommended pattern
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          const cookie = cookieStore.get(name);
          return cookie?.value;
        },
        set(name, value, options) {
          // We don't need to set cookies in a server-side API route
        },
        remove(name, options) {
          // We don't need to remove cookies in a server-side API route
        },
      },
    }
  );
  
  try {
    // Check authentication using getUser
    const { data, error: authError } = await supabase.auth.getUser();
    
    if (authError || !data.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Get user ID
    const userId = data.user.id;
    
    // Query footprints
    const { data: footprints, error } = await supabase
      .from('footprints')
      .select(`
        id,
        created_at,
        total_co2e_kg,
        country_code
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Return the data
    return NextResponse.json(footprints || []);
  } catch (error: any) {
    console.error('Error fetching footprints:', error);
    return NextResponse.json(
      { error: 'Failed to fetch footprints: ' + (error.message || 'Unknown error') },
      { status: 500 }
    );
  }
} 