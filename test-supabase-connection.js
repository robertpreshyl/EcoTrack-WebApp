// Simple script to test Supabase connection
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Check for credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Supabase credentials missing in .env.local file');
  process.exit(1);
}

console.log('Testing Supabase connection...');
console.log(`URL: ${supabaseUrl}`);
console.log(`Anon Key: ${supabaseKey.substring(0, 5)}...`);

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    // Test basic query
    console.log('\nAttempting to connect...');
    const { data, error } = await supabase.from('devices').select('*').limit(5);
    
    if (error) {
      console.error('Error connecting to Supabase or querying devices table:', error);
      
      // Try to check if the table exists
      console.log('\nTrying to check if the devices table exists...');
      const { data: tableInfo, error: tableError } = await supabase
        .rpc('get_schema_info');
        
      if (tableError) {
        console.error('Error checking schema info:', tableError);
      } else {
        console.log('Schema info:', tableInfo);
      }
      
      // Try querying a different table (profiles should exist if you've set up auth)
      console.log('\nTrying to query profiles table instead:');
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);
        
      if (profilesError) {
        console.error('Error querying profiles table:', profilesError);
      } else {
        console.log('Profiles data:', profiles);
        console.log('✅ Successfully connected to Supabase, but devices table may not exist.');
      }
      
      return;
    }
    
    console.log('✅ Successfully connected to Supabase!');
    console.log('Devices data:', data);
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

testConnection(); 