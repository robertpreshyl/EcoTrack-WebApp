// Script to test Supabase connection and functions
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function testSupabase() {
  // Get credentials from environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Supabase credentials not found in .env.local');
    console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set');
    process.exit(1);
  }

  console.log('SUPABASE URL:', supabaseUrl);
  console.log('Testing connection...');

  // Create Supabase client
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Test 1: Basic query to check connection
    console.log('\n--- Test 1: Check connection ---');
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      throw new Error(`Connection failed: ${error.message}`);
    }
    
    console.log('Successfully connected to Supabase! ✓');
    
    // Test 2: Check if profiles table exists
    console.log('\n--- Test 2: Check profiles table ---');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (profilesError) {
      console.error(`Error accessing profiles table: ${profilesError.message}`);
    } else {
      console.log('Profiles table exists ✓');
      console.log('Sample profile:', profiles[0] || 'No profiles found');
    }
    
    // Test 3: Check footprints table
    console.log('\n--- Test 3: Check footprints table ---');
    const { data: footprints, error: footprintsError } = await supabase
      .from('footprints')
      .select('*')
      .limit(1);
    
    if (footprintsError) {
      console.error(`Error accessing footprints table: ${footprintsError.message}`);
    } else {
      console.log('Footprints table exists ✓');
      console.log('Sample footprint:', footprints[0] || 'No footprints found');
    }
    
    // Test 4: Test get_carbon_leaderboard function
    console.log('\n--- Test 4: Test get_carbon_leaderboard function ---');
    const { data: leaderboard, error: leaderboardError } = await supabase
      .rpc('get_carbon_leaderboard', { limit_count: 5 });
    
    if (leaderboardError) {
      console.error(`Error calling get_carbon_leaderboard: ${leaderboardError.message}`);
    } else {
      console.log('get_carbon_leaderboard function works ✓');
      console.log('Results:', leaderboard);
    }
    
    // Test 5: Test update_profile function (only if you have a user ID from the session)
    if (data?.session?.user?.id) {
      const userId = data.session.user.id;
      console.log('\n--- Test 5: Test update_profile function ---');
      console.log('Using current user ID:', userId);
      
      const { data: updateResult, error: updateError } = await supabase
        .rpc('update_profile', {
          user_id: userId,
          user_name: 'Test User',
          user_username: 'testuser',
          user_avatar_url: 'https://example.com/avatar.jpg'
        });
      
      if (updateError) {
        console.error(`Error calling update_profile: ${updateError.message}`);
      } else {
        console.log('update_profile function works ✓');
        console.log('Updated profile:', updateResult);
      }
    } else {
      console.log('\n--- Test 5: Skipped update_profile test (no authenticated user) ---');
    }
    
    console.log('\n✅ All tests completed!');
    
  } catch (error) {
    console.error('Error testing Supabase:', error.message);
  }
}

testSupabase(); 