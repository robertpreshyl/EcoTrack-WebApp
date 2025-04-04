'use client';

import React, { useEffect, useState } from 'react';
import { logError } from './error-handler';

interface ErrorDisplayState {
  errors: Array<{
    id: string;
    message: string;
    timestamp: Date;
    details?: string;
  }>;
}

// This key is used to store errors in localStorage
const ERROR_STORAGE_KEY = 'ecotrack_errors';

// Global state for errors (singleton pattern)
let errorState: ErrorDisplayState = { errors: [] };
let listeners: Function[] = [];

// Function to notify all components that are listening for error updates
function notifyListeners() {
  listeners.forEach(listener => listener(errorState));
}

// Add a new error to the global error state
export function addGlobalError(error: any, component?: string) {
  const errorId = Date.now().toString();
  const formattedError = {
    id: errorId,
    message: error.message || 'An unknown error occurred',
    timestamp: new Date(),
    details: error.stack || JSON.stringify(error, null, 2)
  };

  // Log the error
  logError(error, component || 'global', 'unhandledError');

  // Add to global state
  errorState = {
    errors: [...errorState.errors, formattedError]
  };

  // Try to persist to localStorage (for refreshes)
  try {
    localStorage.setItem(ERROR_STORAGE_KEY, JSON.stringify(errorState));
  } catch (e) {
    // Silent fail if localStorage isn't available
  }

  // Notify all listening components
  notifyListeners();

  return errorId;
}

// Remove an error from the global error state
export function removeGlobalError(errorId: string) {
  errorState = {
    errors: errorState.errors.filter(err => err.id !== errorId)
  };

  // Update localStorage
  try {
    localStorage.setItem(ERROR_STORAGE_KEY, JSON.stringify(errorState));
  } catch (e) {
    // Silent fail
  }

  // Notify components
  notifyListeners();
}

// Clear all errors
export function clearGlobalErrors() {
  errorState = { errors: [] };
  
  // Clear from localStorage
  try {
    localStorage.removeItem(ERROR_STORAGE_KEY);
  } catch (e) {
    // Silent fail
  }
  
  // Notify components
  notifyListeners();
}

// Hook to subscribe to error updates
export function useGlobalErrors() {
  const [state, setState] = useState<ErrorDisplayState>(errorState);

  useEffect(() => {
    // Add this component as a listener
    const listenerFn = (newState: ErrorDisplayState) => setState(newState);
    listeners.push(listenerFn);

    // Try to load any persisted errors when the component mounts
    try {
      const storedErrors = localStorage.getItem(ERROR_STORAGE_KEY);
      if (storedErrors) {
        errorState = JSON.parse(storedErrors);
        setState(errorState);
      }
    } catch (e) {
      // Silent fail
    }

    // Remove listener on unmount
    return () => {
      listeners = listeners.filter(fn => fn !== listenerFn);
    };
  }, []);

  return {
    errors: state.errors,
    removeError: removeGlobalError,
    clearErrors: clearGlobalErrors
  };
}

// Global error listener that automatically catches unhandled errors
export function setupGlobalErrorListeners() {
  if (typeof window !== 'undefined') {
    // Setup window error event listener
    window.addEventListener('error', (event) => {
      addGlobalError(event.error || new Error(event.message), 'window');
    });

    // Setup window unhandledrejection event listener
    window.addEventListener('unhandledrejection', (event) => {
      addGlobalError(event.reason || new Error('Unhandled Promise rejection'), 'promise');
    });
  }
}

// The component that displays errors
export function GlobalErrorDisplay() {
  const { errors, removeError } = useGlobalErrors();

  if (errors.length === 0) return null;

  return (
    <div className="fixed bottom-0 right-0 m-4 z-50 max-w-md max-h-[80vh] overflow-y-auto">
      {errors.map(error => (
        <div key={error.id} className="bg-red-50 p-4 rounded-lg shadow-lg border border-red-200 mb-2">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-red-800 font-medium">{error.message}</h3>
              <p className="text-xs text-red-600 mt-1">
                {new Date(error.timestamp).toLocaleString()}
              </p>
            </div>
            <button 
              onClick={() => removeError(error.id)} 
              className="text-red-500 hover:text-red-700 p-1"
            >
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          {process.env.NODE_ENV !== 'production' && error.details && (
            <details className="mt-2 text-xs">
              <summary className="cursor-pointer text-red-700">View details</summary>
              <pre className="mt-2 p-2 bg-red-100 rounded overflow-auto text-xs whitespace-pre-wrap">
                {error.details}
              </pre>
            </details>
          )}
        </div>
      ))}
    </div>
  );
} 