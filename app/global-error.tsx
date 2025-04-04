'use client';

import { useEffect } from 'react';
import { Geist } from "next/font/google";
import { logError } from '@/lib/utils/error-handler';

const geistSans = Geist({
  subsets: ["latin"],
});

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error
    logError(error, 'Next.js Global Error', 'render', {
      digest: error.digest,
    });
  }, [error]);

  return (
    <html lang="en">
      <head>
        <title>Error - EcoTrack</title>
      </head>
      <body className={geistSans.className}>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Critical Error</h2>
            <p className="text-center text-gray-600 mb-6">
              Something went seriously wrong with the application.
            </p>
            
            {process.env.NODE_ENV !== 'production' && (
              <div className="mb-6 p-4 bg-red-50 rounded-md border border-red-100">
                <p className="font-medium text-red-800 mb-2">Error: {error.message}</p>
                {error.stack && (
                  <pre className="text-xs text-red-700 mt-2 whitespace-pre-wrap overflow-auto max-h-[200px]">
                    {error.stack}
                  </pre>
                )}
              </div>
            )}
            
            <div className="flex justify-center">
              <button
                onClick={reset}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
} 