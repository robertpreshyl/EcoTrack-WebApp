import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

import type { NextRequest } from 'next/server';

/**
 * Middleware to handle authentication and protected routes
 * This runs on every request to the application
 */
export async function middleware(request: NextRequest) {
  try {
    // Create a Supabase client for the middleware
    const response = NextResponse.next();
    const supabase = createMiddlewareClient({ req: request, res: response });
    
    // Refresh the session if needed
    await supabase.auth.getSession();
    
    return response;
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.next();
  }
}

// Specify which paths the middleware should run on
export const config = {
  matcher: [
    // Skip these paths
    '/(api/auth.*)', // Skip auth API routes
    '/api/webhooks(.*)', // Skip webhook routes if you have any
    '/_next/static/(.*)', // Skip Next.js static files
    '/_next/image(.*)', // Skip Next.js image optimization files
    '/favicon.ico', // Skip favicon requests
    '/images/(.*)', // Skip static image files
    
    // Include everything else
    '/(.*)',
  ],
}; 