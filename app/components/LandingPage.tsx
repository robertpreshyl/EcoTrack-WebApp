"use client";

import React from 'react';
import Link from 'next/link';
import Auth from '@/app/components/Auth';

interface LandingPageProps {
  t: (key: string, options?: Record<string, any>) => string;
}

const LandingPage: React.FC<LandingPageProps> = ({ t }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <header className="text-center mb-16">
          <h1 className="text-5xl font-bold text-green-700 mb-4">EcoTrack</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Track, understand, and reduce your carbon footprint with personalized insights
          </p>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left column: Value proposition */}
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Take Climate Action Today</h2>
              <p className="text-gray-600 text-lg">
                Small changes in your daily habits can make a big difference. EcoTrack helps you understand your impact and make meaningful reductions.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Track Your Footprint</h3>
                  <p className="mt-1 text-gray-600">Calculate and monitor your carbon emissions over time</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Actionable Insights</h3>
                  <p className="mt-1 text-gray-600">Get personalized recommendations based on your lifestyle</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path>
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Global Community</h3>
                  <p className="mt-1 text-gray-600">Join others and compete on the leaderboard for sustainable living</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Did you know?</h3>
              <p className="text-gray-600">
                The average person in the USA produces around 16 tons of CO₂ per year, while the global average is 4.8 tons.
                With EcoTrack, you can measure your personal impact and find ways to reduce it.
              </p>
            </div>
          </div>
          
          {/* Right column: Authentication */}
          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Join EcoTrack Today</h2>
            <Auth t={t} />
          </div>
        </div>
        
        {/* Features Section */}
        <section className="mt-24">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">How EcoTrack Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 text-center">
              <div className="h-14 w-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Calculate</h3>
              <p className="text-gray-600">
                Enter your lifestyle details including transportation, home energy use, and diet to calculate your carbon footprint.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 text-center">
              <div className="h-14 w-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Track</h3>
              <p className="text-gray-600">
                Monitor changes in your footprint over time with intuitive charts and comparisons to see your progress.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 text-center">
              <div className="h-14 w-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Reduce</h3>
              <p className="text-gray-600">
                Get personalized tips and actionable steps to reduce your environmental impact and save money.
              </p>
            </div>
          </div>
        </section>
        
        {/* Footer */}
        <footer className="mt-24 text-center text-gray-500 py-8 border-t border-gray-200">
          <p>© {new Date().getFullYear()} EcoTrack. All rights reserved.</p>
          <div className="flex justify-center space-x-4 mt-4">
            <Link href="/privacy" className="hover:text-green-600 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-green-600 transition-colors">
              Terms of Service
            </Link>
            <Link href="/about" className="hover:text-green-600 transition-colors">
              About Us
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage; 