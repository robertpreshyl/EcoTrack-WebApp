'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/lib/context/UserContext';
import DashboardRedesign from '@/app/components/DashboardRedesign';

export default function Dashboard() {
  const router = useRouter();
  const { user, isLoading, signOut } = useUser();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isLoading && !user && isClient) {
      // Redirect to login if not authenticated
      router.push('/login');
    }
  }, [user, isLoading, router, isClient]);

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Show loading state while checking authentication
  if (isLoading || !isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50 text-slate-800 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-teal-500 to-blue-500 mb-4"></div>
          <p className="text-slate-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // If not authenticated and finished loading, the redirect should have happened
  if (!user) {
    return null;
  }

  // If authenticated, show the dashboard
  return <DashboardRedesign user={user} onLogout={handleLogout} />;
} 