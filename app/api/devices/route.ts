import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logError } from '@/lib/utils/error-handler';
import { cookies } from 'next/headers';

// Create a Supabase client for server-side operations
const createServerSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase credentials missing');
  }
  
  return createClient(supabaseUrl, supabaseServiceKey);
};

// GET /api/devices - Get all devices for the current user
export async function GET(request: NextRequest) {
  try {
    // Get user ID from the query string
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' }, 
        { status: 400 }
      );
    }
    
    // Create Supabase client
    const supabase = createServerSupabaseClient();
    
    // Fetch devices for the user
    const { data, error } = await supabase
      .from('devices')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching devices:', error);
      return NextResponse.json(
        { error: 'Failed to fetch devices' }, 
        { status: 500 }
      );
    }
    
    return NextResponse.json({ devices: data });
  } catch (error) {
    console.error('Unexpected error in devices GET route:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' }, 
      { status: 500 }
    );
  }
}

// POST /api/devices - Create a new device
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    
    if (!body || !body.device || !body.device.user_id) {
      return NextResponse.json(
        { error: 'Invalid request body' }, 
        { status: 400 }
      );
    }
    
    // Create Supabase client
    const supabase = createServerSupabaseClient();
    
    // Insert the new device
    const { data, error } = await supabase
      .from('devices')
      .insert(body.device)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating device:', error);
      return NextResponse.json(
        { error: 'Failed to create device' }, 
        { status: 500 }
      );
    }
    
    return NextResponse.json({ device: data }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error in devices POST route:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' }, 
      { status: 500 }
    );
  }
}

// PUT /api/devices/:id - Update a device
export async function PUT(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    
    if (!body || !body.deviceId || !body.updates) {
      return NextResponse.json(
        { error: 'Invalid request body' }, 
        { status: 400 }
      );
    }
    
    const { deviceId, updates, userId } = body;
    
    // Create Supabase client
    const supabase = createServerSupabaseClient();
    
    // Verify the device belongs to the user
    const { data: deviceData, error: verifyError } = await supabase
      .from('devices')
      .select('id')
      .eq('id', deviceId)
      .eq('user_id', userId)
      .single();
    
    if (verifyError || !deviceData) {
      return NextResponse.json(
        { error: 'Device not found or you do not have permission' }, 
        { status: 403 }
      );
    }
    
    // Update the device
    const { data, error } = await supabase
      .from('devices')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', deviceId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating device:', error);
      return NextResponse.json(
        { error: 'Failed to update device' }, 
        { status: 500 }
      );
    }
    
    return NextResponse.json({ device: data });
  } catch (error) {
    console.error('Unexpected error in devices PUT route:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' }, 
      { status: 500 }
    );
  }
}

// DELETE /api/devices/:id - Delete a device
export async function DELETE(request: NextRequest) {
  try {
    // Get device ID from the query string
    const { searchParams } = new URL(request.url);
    const deviceId = searchParams.get('deviceId');
    const userId = searchParams.get('userId');
    
    if (!deviceId || !userId) {
      return NextResponse.json(
        { error: 'Device ID and User ID are required' }, 
        { status: 400 }
      );
    }
    
    // Create Supabase client
    const supabase = createServerSupabaseClient();
    
    // Verify the device belongs to the user
    const { data: deviceData, error: verifyError } = await supabase
      .from('devices')
      .select('id')
      .eq('id', deviceId)
      .eq('user_id', userId)
      .single();
    
    if (verifyError || !deviceData) {
      return NextResponse.json(
        { error: 'Device not found or you do not have permission' }, 
        { status: 403 }
      );
    }
    
    // Delete the device
    const { error } = await supabase
      .from('devices')
      .delete()
      .eq('id', deviceId);
    
    if (error) {
      console.error('Error deleting device:', error);
      return NextResponse.json(
        { error: 'Failed to delete device' }, 
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error in devices DELETE route:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' }, 
      { status: 500 }
    );
  }
} 