"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Chart } from 'chart.js/auto';
import { Line, Doughnut } from 'react-chartjs-2';
import { User } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  name: string;
  username?: string;
  avatar_url?: string;
  language: string;
  country: string;
  updated_at: string;
}

interface FootprintRecord {
  id: string;
  created_at: string;
  total_co2e_kg: number;
  country_code: string;
  breakdown?: {
    transport: number;
    energy: number;
    diet: number;
  };
  footprint_details?: Array<{
    category: 'transport' | 'energy' | 'diet';
    value: number;
  }>;
}

interface LeaderboardUser {
  username: string;
  name: string;
  avatar_url?: string;
  total_co2e_kg: number;
  footprint_count: number;
}

interface DashboardProps {
  userData: any;
  user: User;
  onLogout: () => void;
  t: (key: string, options?: Record<string, any>) => string;
}

const Dashboard: React.FC<DashboardProps> = ({ userData, user, onLogout, t }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'leaderboard' | 'settings'>('overview');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [footprints, setFootprints] = useState<FootprintRecord[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Fetch user profile, footprint history and leaderboard data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      try {
        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (profileError) throw profileError;
        setProfile(profileData);
        setName(profileData.name || '');
        setUsername(profileData.username || '');
        setAvatarUrl(profileData.avatar_url || '');
        
        // Fetch footprint history
        const { data: footprintData, error: footprintError } = await supabase
          .from('footprints')
          .select(`
            id,
            created_at,
            total_co2e_kg,
            country_code,
            footprint_details (
              category,
              value
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (footprintError) throw footprintError;
        
        // Process footprint data to include breakdown
        const processedFootprints = footprintData ? footprintData.map(footprint => {
          const breakdown = {
            transport: 0,
            energy: 0,
            diet: 0
          };
          
          // Process breakdown from footprint_details if available
          if (footprint.footprint_details && footprint.footprint_details.length > 0) {
            footprint.footprint_details.forEach(detail => {
              if (detail.category in breakdown) {
                breakdown[detail.category as keyof typeof breakdown] = detail.value;
              }
            });
          }
          
          return {
            id: footprint.id,
            created_at: footprint.created_at,
            total_co2e_kg: footprint.total_co2e_kg,
            country_code: footprint.country_code,
            breakdown
          };
        }) : [];
        
        setFootprints(processedFootprints);
        
        try {
          // Fetch leaderboard data
          const { data: leaderboardData, error: leaderboardError } = await supabase
            .rpc('get_carbon_leaderboard', { limit_count: 10 });
            
          if (leaderboardError) {
            console.error('Leaderboard error:', leaderboardError);
            setLeaderboard([]);
          } else {
            setLeaderboard(leaderboardData || []);
          }
        } catch (leaderboardError) {
          console.error('Leaderboard fetch failed:', leaderboardError);
          setLeaderboard([]);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Initialize with empty data on error
        setProfile(null);
        setFootprints([]);
        setLeaderboard([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [user.id]);

  const handleSaveSettings = async () => {
    try {
      console.log('Updating profile with data:', { name, username, avatar_url: avatarUrl, id: user.id });
      
      // Use the simple RPC function directly rather than trying multiple approaches
      // This function has SECURITY DEFINER so it will work regardless of RLS settings
      const { data, error } = await supabase
        .rpc('update_profile', {
          user_id: user.id,
          user_name: name || '',
          user_username: username || '',
          user_avatar_url: avatarUrl || ''
        });
        
      if (error) {
        console.error('Profile update failed:', error);
        throw error;
      }
      
      // Update local state
      console.log('Profile updated successfully:', data);
      
      // Update the profile state
      const updatedProfile = Array.isArray(data) && data.length > 0 ? data[0] : null;
      if (updatedProfile) {
        setProfile(updatedProfile);
      } else {
        // Fallback to local values if no data returned
        setProfile(prev => ({
          ...prev!,
          name: name || '',
          username: username || '',
          avatar_url: avatarUrl || '',
          updated_at: new Date().toISOString()
        }));
      }
      
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 3000);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      alert(`Failed to update profile: ${error?.message || 'Unknown error'}`);
    }
  };

  // Calculate average footprint for comparison
  const averageFootprint = footprints.length > 0
    ? footprints.reduce((sum, f) => sum + f.total_co2e_kg, 0) / footprints.length
    : 0;
  
  // Calculate user's rank on the leaderboard
  const userRank = leaderboard.findIndex(u => u.username === profile?.username) + 1;

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Chart data for footprint history
  const historyChartData = {
    labels: footprints.slice(0, 7).reverse().map(f => formatDate(f.created_at)),
    datasets: [
      {
        label: 'Carbon Footprint (kg CO₂e)',
        data: footprints.slice(0, 7).reverse().map(f => f.total_co2e_kg),
        borderColor: 'rgb(52, 211, 153)',
        backgroundColor: 'rgba(52, 211, 153, 0.5)',
        tension: 0.3,
        fill: true,
      }
    ]
  };

  // Chart data for latest footprint breakdown
  const breakdownChartData = footprints.length > 0 ? {
    labels: ['Transport', 'Energy', 'Diet'],
    datasets: [
      {
        data: [
          footprints[0].breakdown?.transport || 0,
          footprints[0].breakdown?.energy || 0,
          footprints[0].breakdown?.diet || 0
        ],
        backgroundColor: [
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 99, 132, 0.7)',
          'rgba(75, 192, 192, 0.7)'
        ],
        borderWidth: 1,
      }
    ]
  } : null;

  if (isLoading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200 animate-pulse">
        <div className="flex justify-center items-center h-40">
          <svg className="animate-spin h-8 w-8 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Header with user info and tabs */}
      <div className="p-6 bg-gradient-to-r from-green-700 to-green-500 text-white">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="mr-4 h-14 w-14 bg-white rounded-full flex items-center justify-center overflow-hidden">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt={profile?.name || 'User'} className="h-full w-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-green-500">
                  {profile?.name?.charAt(0) || user.email?.charAt(0) || '?'}
                </span>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{profile?.name || 'Welcome!'}</h2>
              <p className="text-sm opacity-80">@{profile?.username || 'user'}</p>
            </div>
          </div>
          
          <button
            onClick={onLogout}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors"
          >
            Logout
          </button>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'overview' 
                ? 'bg-white text-green-700 font-medium shadow-sm' 
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'history' 
                ? 'bg-white text-green-700 font-medium shadow-sm' 
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            History
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'leaderboard' 
                ? 'bg-white text-green-700 font-medium shadow-sm' 
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            Leaderboard
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'settings' 
                ? 'bg-white text-green-700 font-medium shadow-sm' 
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            Settings
          </button>
        </div>
      </div>
      
      {/* Tab Content */}
      <div className="p-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Latest Footprint & Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-green-50 p-6 rounded-xl shadow-sm border border-green-100">
                <h3 className="text-lg font-semibold text-gray-700 mb-1">Latest Footprint</h3>
                {footprints.length > 0 ? (
                  <div>
                    <p className="text-3xl font-bold text-green-600">{footprints[0].total_co2e_kg.toFixed(1)}</p>
                    <p className="text-sm text-gray-500">kg CO₂e • {formatDate(footprints[0].created_at)}</p>
                    
                    {breakdownChartData && (
                      <div className="mt-4 h-48">
                        <Doughnut
                          data={breakdownChartData}
                          options={{
                            plugins: {
                              legend: {
                                position: 'bottom'
                              }
                            },
                            maintainAspectRatio: false
                          }}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 mt-2">No footprint data yet. Calculate your first footprint!</p>
                )}
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Your Stats</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Total Calculations</p>
                    <p className="text-2xl font-semibold text-gray-800">{footprints.length}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Average Footprint</p>
                    <p className="text-2xl font-semibold text-gray-800">
                      {averageFootprint > 0 ? `${averageFootprint.toFixed(1)} kg` : 'N/A'}
                    </p>
                  </div>
                  
                  {userRank > 0 && (
                    <div>
                      <p className="text-sm text-gray-500">Your Leaderboard Rank</p>
                      <p className="text-2xl font-semibold text-gray-800">#{userRank}</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Tips to Improve</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-2 mt-2">
                  <li>Switch to renewable energy sources</li>
                  <li>Reduce meat consumption</li>
                  <li>Use public transportation more often</li>
                  <li>Optimize your home insulation</li>
                  <li>Consider carbon offset programs</li>
                </ul>
              </div>
            </div>
            
            {/* History Chart */}
            {footprints.length > 1 && (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Recent History</h3>
                <div className="h-64">
                  <Line
                    data={historyChartData}
                    options={{
                      scales: {
                        y: {
                          beginAtZero: true,
                          title: {
                            display: true,
                            text: 'kg CO₂e'
                          }
                        }
                      },
                      maintainAspectRatio: false
                    }}
                  />
                </div>
              </div>
            )}
            
            {/* Achievement Badges */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Achievements</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                <div className={`p-4 rounded-lg text-center border ${footprints.length >= 1 ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200 opacity-50'}`}>
                  <div className="w-14 h-14 mx-auto mb-2 rounded-full flex items-center justify-center bg-white">
                    <span className={`text-2xl ${footprints.length >= 1 ? 'text-green-500' : 'text-gray-400'}`}>🌱</span>
                  </div>
                  <p className="font-medium">First Step</p>
                  <p className="text-xs text-gray-500">Calculate your first footprint</p>
                </div>
                
                <div className={`p-4 rounded-lg text-center border ${footprints.length >= 5 ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200 opacity-50'}`}>
                  <div className="w-14 h-14 mx-auto mb-2 rounded-full flex items-center justify-center bg-white">
                    <span className={`text-2xl ${footprints.length >= 5 ? 'text-green-500' : 'text-gray-400'}`}>🌿</span>
                  </div>
                  <p className="font-medium">Regular Tracker</p>
                  <p className="text-xs text-gray-500">5+ calculations</p>
                </div>
                
                <div className={`p-4 rounded-lg text-center border ${footprints.length > 0 && footprints[0].total_co2e_kg < 600 ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200 opacity-50'}`}>
                  <div className="w-14 h-14 mx-auto mb-2 rounded-full flex items-center justify-center bg-white">
                    <span className={`text-2xl ${footprints.length > 0 && footprints[0].total_co2e_kg < 600 ? 'text-green-500' : 'text-gray-400'}`}>🏆</span>
                  </div>
                  <p className="font-medium">Low Impact</p>
                  <p className="text-xs text-gray-500">Below 600kg CO₂e</p>
                </div>
                
                <div className={`p-4 rounded-lg text-center border ${userRank <= 3 ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200 opacity-50'}`}>
                  <div className="w-14 h-14 mx-auto mb-2 rounded-full flex items-center justify-center bg-white">
                    <span className={`text-2xl ${userRank <= 3 ? 'text-green-500' : 'text-gray-400'}`}>🥇</span>
                  </div>
                  <p className="font-medium">Top Performer</p>
                  <p className="text-xs text-gray-500">Top 3 on leaderboard</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* History Tab */}
        {activeTab === 'history' && (
          <div>
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Your Footprint History</h3>
            
            {footprints.length === 0 ? (
              <p className="text-gray-500 py-8 text-center">No footprint history yet. Calculate your first footprint!</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total (kg CO₂e)</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transport</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Energy</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diet</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Country</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {footprints.map((footprint) => (
                      <tr key={footprint.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{formatDate(footprint.created_at)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{footprint.total_co2e_kg.toFixed(1)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{footprint.breakdown?.transport.toFixed(1) || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{footprint.breakdown?.energy.toFixed(1) || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{footprint.breakdown?.diet.toFixed(1) || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{footprint.country_code}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
        
        {/* Leaderboard Tab */}
        {activeTab === 'leaderboard' && (
          <div>
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Carbon Footprint Leaderboard</h3>
            <p className="text-gray-500 mb-6">Users with the lowest average carbon footprint</p>
            
            {leaderboard.length === 0 ? (
              <p className="text-gray-500 py-8 text-center">No leaderboard data available yet.</p>
            ) : (
              <div className="space-y-3">
                {leaderboard.map((leader, index) => (
                  <div 
                    key={index}
                    className={`flex items-center p-4 rounded-lg border ${
                      leader.username === profile?.username
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-white border-gray-100'
                    }`}
                  >
                    <div className="font-bold text-gray-700 w-8 text-center">{index + 1}</div>
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mx-3 overflow-hidden">
                      {leader.avatar_url ? (
                        <img src={leader.avatar_url} alt={leader.name} className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-lg font-semibold text-gray-500">
                          {leader.name?.charAt(0) || '?'}
                        </span>
                      )}
                    </div>
                    <div className="flex-grow">
                      <p className="font-medium text-gray-800">{leader.name}</p>
                      <p className="text-sm text-gray-500">@{leader.username}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {leader.total_co2e_kg !== null 
                          ? leader.total_co2e_kg.toFixed(1) 
                          : 'N/A'}
                      </p>
                      <p className="text-xs text-gray-500">kg CO₂e avg.</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div>
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Profile Settings</h3>
            
            <div className="max-w-2xl space-y-6">
              {settingsSaved && (
                <div className="bg-green-50 text-green-700 p-3 rounded-lg border border-green-200 mb-4">
                  Settings saved successfully!
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Avatar URL</label>
                <input
                  type="text"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                  placeholder="https://example.com/avatar.jpg"
                />
                {avatarUrl && (
                  <div className="mt-2">
                    <img src={avatarUrl} alt="Avatar Preview" className="w-16 h-16 rounded-full object-cover border border-gray-200" />
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={user.email || ''}
                  disabled
                  className="w-full px-3 py-2 border border-gray-200 bg-gray-50 text-gray-500 rounded-md"
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>
              
              <button
                onClick={handleSaveSettings}
                className="mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
              >
                Save Settings
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 