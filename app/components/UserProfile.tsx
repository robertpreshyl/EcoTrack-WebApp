'use client';

import React from 'react';
import { User } from '@supabase/supabase-js';

interface UserProfileProps {
  user: User;
  onLogout: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, onLogout }) => {
  // Extract first name from email or use first part of email
  const displayName = user.email 
    ? user.email.split('@')[0]
    : user.id.substring(0, 6);
  
  // Generate avatar initials from display name
  const initials = displayName.substring(0, 2).toUpperCase();

  return (
    <div className="fixed bottom-4 left-4 z-10 flex items-center p-2 rounded-lg bg-white/80 backdrop-blur-sm shadow-lg border border-gray-100">
      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center text-white font-medium mr-3">
        {initials}
      </div>
      <div className="mr-3">
        <p className="text-sm font-medium text-gray-800">{displayName}</p>
        <p className="text-xs text-gray-500">{user.email}</p>
      </div>
      <button 
        onClick={onLogout}
        className="ml-2 p-2 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Sign out"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      </button>
    </div>
  );
};

export default UserProfile; 