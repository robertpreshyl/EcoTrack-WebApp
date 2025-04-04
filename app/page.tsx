// IMPORTANT: This code is designed to run within a Next.js (or similar React framework) environment.
// It requires Node.js, npm/yarn, and the Next.js framework to be installed and running.
// A simple preview might not render this correctly without that environment.
// Ensure Tailwind CSS is also properly configured in your Next.js project.

"use client";

import React, { useState, useEffect } from 'react';
import { useUser } from '@/lib/context/UserContext';
import Dashboard from '@/app/components/Dashboard';
import DashboardRedesign from '@/app/components/DashboardRedesign';
import Calculator from '@/app/components/Calculator';
import Auth from '@/app/components/Auth';
import { supabase } from '@/lib/supabase/client';
import ErrorBoundary from '@/app/components/ErrorBoundary';
import ErrorMessage from '@/app/components/ErrorMessage';
import { logError } from '@/lib/utils/error-handler';
import DiagnosticTool from '@/app/components/DiagnosticTool';

// Simple translation function placeholder (to be replaced with proper i18n implementation)
const useTranslation = (language: string) => {
  // Basic translations dictionary
  const translations: Record<string, Record<string, string>> = {
    en: {
      dashboard: 'Dashboard',
      calculateFootprint: 'Calculate Footprint',
    },
    es: {
      dashboard: 'Panel de control',
      calculateFootprint: 'Calcular huella',
    },
    fr: {
      dashboard: 'Tableau de bord',
      calculateFootprint: 'Calculer l\'empreinte',
    },
  };

  return (key: string, options?: Record<string, any>): string => {
    // Return the translation if it exists, or fallback to the key
    return translations[language]?.[key] || translations['en']?.[key] || key;
  };
};

export default function Home() {
  const { user, isLoading: userLoading, signOut } = useUser();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'calculator'>('dashboard');
  const [userData, setUserData] = useState<any>(null);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [useNewDesign, setUseNewDesign] = useState(true); // Toggle to switch between designs
  const [error, setError] = useState<Error | null>(null);
  const [showDiagnosticTool, setShowDiagnosticTool] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Add local loading state
  
  // Get translation function
  const t = useTranslation(selectedLanguage);

  // Force a timeout to exit loading state after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // If user is loaded (either logged in or not), stop loading
    if (!userLoading) {
      // Wait a little to ensure any other resources are loaded
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [userLoading]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
            
          if (error) throw error;
          setUserData(data);
          
          // Set language if user has a preference
          if (data?.language) {
            setSelectedLanguage(data.language);
          }
        } catch (err) {
          const appError = logError(err, 'HomePage', 'fetchUserData', { userId: user?.id });
          setError(appError);
        } finally {
          // Ensure loading is set to false after data fetch
          setIsLoading(false);
        }
      }
    };
    
    fetchUserData();
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (err) {
      const appError = logError(err, 'HomePage', 'handleLogout');
      setError(appError);
    }
  };
  
  const handleCalculatorComplete = () => {
    setActiveTab('dashboard');
  };

  // Clear error handler
  const clearError = () => setError(null);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500 mb-4"></div>
          <p className="text-gray-600">Loading your eco data...</p>
        </div>
      </div>
    );
  }

  // If not logged in, show landing page with Auth component
  if (!user) {
    return (
      <ErrorBoundary component="Home-Auth">
        <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex flex-col items-center justify-center p-4">
          {error && (
            <div className="max-w-md w-full mx-auto mb-4">
              <ErrorMessage error={error} onRetry={clearError} />
            </div>
          )}
          
          <div className="max-w-md w-full mx-auto bg-white rounded-xl shadow-lg overflow-hidden md:max-w-2xl p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-green-600 mb-2">EcoTrack</h1>
              <p className="text-gray-600">Track and reduce your carbon footprint</p>
            </div>
            
            <Auth />
            
            <div className="text-center text-sm text-gray-500 mt-8">
              <p>Version 1.0.0 - © 2025 EcoTrack</p>
            </div>
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  // If we're using the new design, show the redesigned dashboard
  if (useNewDesign) {
    return (
      <ErrorBoundary component="Home-Dashboard">
        <div className="min-h-screen bg-gray-50">
          {error && (
            <div className="container mx-auto px-4 pt-4">
              <ErrorMessage error={error} onRetry={clearError} />
            </div>
          )}
          
          {activeTab === 'dashboard' ? (
            <DashboardRedesign user={user} onLogout={handleLogout} />
          ) : (
            <div className="container mx-auto px-4 py-8">
              <Calculator 
                user={user} 
                onComplete={handleCalculatorComplete} 
                t={t} 
              />
            </div>
          )}
          
          {/* Floating action button for calculator */}
          <div className="fixed bottom-8 right-8">
            <button
              onClick={() => setActiveTab(activeTab === 'dashboard' ? 'calculator' : 'dashboard')}
              className="h-14 w-14 rounded-full bg-green-600 text-white shadow-lg flex items-center justify-center hover:bg-green-700 transition-colors"
            >
              {activeTab === 'dashboard' ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              )}
            </button>
          </div>
          
          {/* Design switcher - for development only */}
          <div className="fixed bottom-8 left-8">
            <button
              onClick={() => setUseNewDesign(false)}
              className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md text-sm hover:bg-gray-300"
            >
              Switch to Old Design
            </button>
          </div>

          {/* Add this inside the dashboard section when user is logged in */}
          {user && (
            <div className="mt-5 flex justify-end">
              <button 
                onClick={() => setShowDiagnosticTool(!showDiagnosticTool)}
                className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded-md"
              >
                {showDiagnosticTool ? 'Hide Diagnostics' : 'Database Diagnostics'}
              </button>
            </div>
          )}

          {showDiagnosticTool && user && (
            <div className="mt-4">
              <DiagnosticTool />
            </div>
          )}
        </div>
      </ErrorBoundary>
    );
  }

  // Original design
  return (
    <ErrorBoundary component="Home-OldDesign">
      <div className="min-h-screen bg-gray-50">
        {error && (
          <div className="max-w-6xl mx-auto px-4 pt-4">
            <ErrorMessage error={error} onRetry={clearError} />
          </div>
        )}
        
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Navigation Tabs */}
          <div className="mb-6 flex space-x-4">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-5 py-2.5 rounded-lg font-medium transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-green-600 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {t('dashboard')}
            </button>
            <button
              onClick={() => setActiveTab('calculator')}
              className={`px-5 py-2.5 rounded-lg font-medium transition-colors ${
                activeTab === 'calculator'
                  ? 'bg-green-600 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {t('calculateFootprint')}
            </button>
            <div className="ml-auto">
              <button
                onClick={() => setUseNewDesign(true)}
                className="px-3 py-2 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600"
              >
                Try New Design
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="transition-opacity duration-300">
            {activeTab === 'dashboard' && (
              <Dashboard 
                userData={userData} 
                user={user} 
                onLogout={handleLogout} 
                t={t} 
              />
            )}

            {activeTab === 'calculator' && (
              <Calculator
                user={user}
                onComplete={handleCalculatorComplete}
                t={t}
              />
            )}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
