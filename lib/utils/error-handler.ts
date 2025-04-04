/**
 * Centralized error handling utility
 * This logs errors to the console and could be extended to send to a monitoring service
 */

interface ErrorContext {
  [key: string]: any;
}

type ErrorDetails = {
  message: string;
  component?: string;
  method?: string;
  context?: ErrorContext;
  stack?: string;
  timestamp: string;
};

/**
 * Log an error with component, method, and context information
 * @param error The error that occurred
 * @param component The component where the error occurred
 * @param method The method where the error occurred
 * @param context Additional context information
 * @returns The original error for chaining
 */
export function logError(
  error: Error | unknown,
  component?: string,
  method?: string,
  context?: ErrorContext
): Error {
  const errorObj = error instanceof Error ? error : new Error(String(error));
  
  const details: ErrorDetails = {
    message: errorObj.message,
    component,
    method,
    context,
    stack: errorObj.stack,
    timestamp: new Date().toISOString()
  };

  // Log to console for development
  console.error('Application Error:', details);

  // In production, you could send this to a monitoring service like Sentry
  if (process.env.NODE_ENV === 'production') {
    // TODO: Send to error monitoring service
    // sendToErrorMonitoring(details);
  }

  return errorObj;
}

/**
 * Format an error for display to the user
 * @param error The error to format
 * @returns A user-friendly error message
 */
export function formatErrorForUser(error: Error | unknown): string {
  if (error instanceof Error) {
    // Handle specific error types with custom messages
    if (error.message.includes('network')) {
      return 'Network error. Please check your connection and try again.';
    }
    
    if (error.message.includes('auth') || error.message.includes('Authentication')) {
      return 'Authentication error. Please sign in again.';
    }
    
    if (error.message.includes('permission') || error.message.includes('not authorized')) {
      return 'You do not have permission to perform this action.';
    }
    
    // Return a cleaned up version of the error message
    return error.message.replace(/Error:/gi, '').trim();
  }
  
  // Fallback for non-Error objects
  return 'An unexpected error occurred. Please try again later.';
}

/**
 * Utility for handling errors in the EcoTrack application
 * Provides detailed error logging and helps with debugging
 */

// Custom error type with additional context
export interface AppError extends Error {
  context?: Record<string, any>;
  timestamp?: string;
  component?: string;
  action?: string;
}

// Flag to track if we're already inside an error handler to prevent circular calls
let isHandlingError = false;

/**
 * Display a user-friendly error message
 * @param error The error object
 * @returns A user-friendly error message
 */
export function getUserFriendlyError(error: any): string {
  if (!error) return 'An unknown error occurred. Please try again later.';

  try {
    // Supabase specific errors
    if (error?.code) {
      switch (error.code) {
        case '42501':
          return 'Permission denied: You don\'t have access to this resource. Please check your login status.';
        case '23505':
          return 'This record already exists. Please try again with different information.';
        case '23503':
          return 'This operation would violate database constraints. Please check your data.';
        default:
          if (error.message) return error.message;
      }
    }
    
    // Network errors
    if (error?.name === 'NetworkError' || error?.message?.includes('network')) {
      return 'Network error: Please check your internet connection and try again.';
    }
    
    // Authentication errors
    if (error?.name === 'AuthError' || error?.message?.includes('auth')) {
      return 'Authentication error: Please log in again.';
    }
    
    // Default error message
    return error?.message || 'An unexpected error occurred. Please try again later.';
  } catch (innerError) {
    // If our error handler has an error, return a generic message
    return 'An unexpected error occurred. Please try again later.';
  }
}

/**
 * Check if the error is a specific type
 * @param error The error object
 * @param type The error type to check for
 * @returns True if the error is of the specified type
 */
export function isErrorType(error: any, type: string): boolean {
  try {
    return error?.name === type || 
           error?.code === type || 
           error?.message?.includes(type);
  } catch (innerError) {
    return false;
  }
}

/**
 * Global error handler for unhandled errors
 */
export function setupGlobalErrorHandling() {
  if (typeof window === 'undefined') return;

  try {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      if (!isHandlingError) {
        logError(event.reason, 'global', 'unhandledRejection');
      }
    });
    
    // Handle uncaught exceptions
    window.addEventListener('error', (event) => {
      if (!isHandlingError) {
        logError(event.error || event.message, 'global', 'uncaughtException');
      }
    });
    
    console.info('Global error handling has been set up');
  } catch (error) {
    console.error('Failed to set up global error handling:', error);
  }
} 