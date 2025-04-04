// Script to update Supabase schema
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function updateSchema() {
  // Create Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Error: Required environment variables are missing.');
    console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY) are set in .env.local');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  // Read schema SQL file
  const schemaPath = path.join(__dirname, 'lib', 'supabase', 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  
  console.log('Updating Supabase schema...');
  console.log('This may take a moment...');
  
  try {
    // Execute schema SQL
    const { error } = await supabase.rpc('exec_sql', { sql_string: schema });
    
    if (error) {
      console.error('Error updating schema:', error);
      console.log('\nAlternative: Copy and paste the SQL from lib/supabase/schema.sql directly into your Supabase SQL Editor');
      process.exit(1);
    }
    
    console.log('Schema updated successfully!');
    console.log('The following changes were made:');
    console.log('1. Updated profiles table RLS policies to be more permissive');
    console.log('2. Added SECURITY DEFINER to get_carbon_leaderboard function');
    console.log('3. Changed INNER JOIN to LEFT JOIN in leaderboard query');
    console.log('4. Added NULLS LAST to ordering in leaderboard query');
  } catch (error) {
    console.error('Error executing schema update:', error);
    console.log('\nPlease copy and paste the SQL from lib/supabase/schema.sql directly into your Supabase SQL Editor');
  }
}

updateSchema(); 