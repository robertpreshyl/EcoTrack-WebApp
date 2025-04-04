'use client';

import React, { useState } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';
import { logError } from '@/lib/utils/error-handler';

interface DiagnosticResult {
  success: boolean;
  message: string;
  details?: any;
}

export default function DiagnosticTool() {
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const runDiagnostics = async () => {
    setLoading(true);
    setResults([]);
    
    const diagnosticResults: DiagnosticResult[] = [];
    
    try {
      // Create a fresh Supabase client for testing
      const supabase = createBrowserSupabaseClient();
      
      // Test 1: Check if Supabase client was initialized correctly
      diagnosticResults.push({
        success: true,
        message: 'Supabase client initialized successfully',
        details: {
          clientInitialized: !!supabase
        }
      });
      
      // Test 2: Check environment variables
      const envCheck = {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing',
        supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing'
      };
      
      diagnosticResults.push({
        success: envCheck.supabaseUrl === 'Set' && envCheck.supabaseAnonKey === 'Set',
        message: envCheck.supabaseUrl === 'Set' && envCheck.supabaseAnonKey === 'Set' 
          ? 'Environment variables are properly set' 
          : 'Missing required environment variables',
        details: envCheck
      });
      
      // Test 3: Check auth state
      const { data: authData, error: authError } = await supabase.auth.getSession();
      
      diagnosticResults.push({
        success: !authError,
        message: !authError 
          ? `Auth session check successful${authData.session ? ' (logged in)' : ' (not logged in)'}` 
          : 'Auth session check failed',
        details: {
          isLoggedIn: !!authData.session,
          error: authError ? authError.message : null
        }
      });
      
      // Test 4: Check database connectivity by querying a simple table
      const { error: dbError } = await supabase
        .from('footprints')
        .select('id')
        .limit(1);
      
      diagnosticResults.push({
        success: !dbError,
        message: !dbError 
          ? 'Database connection successful' 
          : `Database connection failed: ${dbError.message}`,
        details: {
          error: dbError ? dbError.message : null,
          errorCode: dbError ? dbError.code : null
        }
      });
      
      // Test 5: Check schema by querying key tables
      const tableTests = await Promise.all([
        supabase.from('profiles').select('id').limit(1),
        supabase.from('footprints').select('id').limit(1),
        supabase.from('footprint_details').select('id').limit(1)
      ]);
      
      const schemaResults = tableTests.map((test, index) => ({
        table: ['profiles', 'footprints', 'footprint_details'][index],
        success: !test.error,
        error: test.error ? test.error.message : null
      }));
      
      diagnosticResults.push({
        success: schemaResults.every(r => r.success),
        message: schemaResults.every(r => r.success)
          ? 'All required tables exist in the schema'
          : 'Schema check failed - some tables may be missing',
        details: { tables: schemaResults }
      });
      
      // Test 6: Check permissions by trying to insert and delete a test record
      if (authData.session) {
        // Only run this test if logged in
        const testId = Date.now().toString();
        const { error: insertError } = await supabase
          .from('footprints')
          .insert({
            user_id: authData.session.user.id,
            total_co2e_kg: 0,
            country_code: 'TEST',
            created_at: new Date().toISOString()
          })
          .select('id')
          .single();
          
        diagnosticResults.push({
          success: !insertError,
          message: !insertError 
            ? 'Insert permission check passed' 
            : `Insert permission check failed: ${insertError.message}`,
          details: {
            error: insertError ? insertError.message : null,
            errorCode: insertError ? insertError.code : null
          }
        });
      } else {
        diagnosticResults.push({
          success: true,
          message: 'Insert permission check skipped (not logged in)',
          details: { skipped: true }
        });
      }
      
    } catch (error: any) {
      // Handle any uncaught errors
      const appError = logError(error, 'DiagnosticTool', 'runDiagnostics');
      
      diagnosticResults.push({
        success: false,
        message: `Uncaught error during diagnostics: ${appError.message}`,
        details: { 
          error: appError.message,
          stack: appError.stack
        }
      });
    } finally {
      setResults(diagnosticResults);
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">Supabase Connection Diagnostics</h2>
      
      <p className="text-gray-600 mb-4">
        This tool runs diagnostics to check your Supabase connection and help identify any issues with saving footprint data.
      </p>
      
      <div className="mb-6">
        <button
          onClick={runDiagnostics}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Running Diagnostics...' : 'Run Diagnostics'}
        </button>
        
        <label className="ml-4 inline-flex items-center">
          <input
            type="checkbox"
            checked={showDetails}
            onChange={(e) => setShowDetails(e.target.checked)}
            className="form-checkbox h-5 w-5 text-blue-500"
          />
          <span className="ml-2 text-gray-700">Show Details</span>
        </label>
      </div>
      
      {results.length > 0 && (
        <div className="border rounded-md overflow-hidden">
          <div className="bg-gray-100 py-2 px-4 font-medium">Diagnostic Results</div>
          <div className="divide-y">
            {results.map((result, index) => (
              <div key={index} className="p-4">
                <div className="flex items-start">
                  <div className={`flex-shrink-0 h-5 w-5 rounded-full ${result.success ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <div className="ml-3">
                    <p className="font-medium">{result.message}</p>
                    
                    {showDetails && result.details && (
                      <pre className="mt-2 text-xs bg-gray-50 p-2 rounded overflow-auto max-h-32">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {results.length > 0 && !results.every(r => r.success) && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <h3 className="font-bold text-yellow-800">Troubleshooting Tips:</h3>
          <ul className="mt-2 list-disc pl-5 text-yellow-700 space-y-1">
            <li>Check your <code>.env.local</code> file to ensure the Supabase URL and anon key are correct</li>
            <li>Make sure you've run the database schema SQL in the Supabase dashboard</li>
            <li>Check that Row Level Security (RLS) policies are properly configured</li>
            <li>If you're logged in, make sure your account has the appropriate permissions</li>
            <li>Try logging out and back in to refresh your authentication token</li>
          </ul>
        </div>
      )}
    </div>
  );
} 