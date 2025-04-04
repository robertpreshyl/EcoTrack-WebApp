"use client";

import React, { useState } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';
import { logError } from '@/lib/utils/error-handler';
import ErrorMessage from './ErrorMessage';

export interface DeviceProps {
  id: string;
  name: string;
  brand?: string;
  category: string;
  subcategory?: string;
  energy_kwh: number;
  co2_kg: number;
  usage_time: number;
  cost_estimate: number;
  isOn: boolean;
  image?: string;
  room?: string;
  onToggle: (id: string, newStatus: boolean) => void;
  onShowMenu?: (id: string) => void;
}

const DeviceCard: React.FC<DeviceProps> = ({
  id,
  name,
  brand,
  category,
  subcategory,
  energy_kwh,
  co2_kg,
  usage_time,
  cost_estimate,
  isOn,
  image,
  onToggle,
  onShowMenu
}) => {
  const [isToggling, setIsToggling] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [localIsOn, setLocalIsOn] = useState(isOn);

  // Handle toggle
  const handleToggle = async () => {
    // Optimistic UI update
    const newStatus = !localIsOn;
    setLocalIsOn(newStatus);
    setIsToggling(true);
    setError(null);
    
    try {
      // Call parent component's toggle handler which will handle the Supabase update
      await onToggle(id, newStatus);
      // No need to make a duplicate call to Supabase here
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to toggle device';
      const appError = new Error(errorMessage);
      logError(appError, 'DeviceCard', 'handleToggle', { 
        deviceId: id, 
        targetStatus: newStatus 
      });
      setError(appError);
      
      // Revert to original state on error
      setLocalIsOn(!newStatus);
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-12 h-12 mr-4 flex items-center justify-center bg-gray-50 rounded-md">
              {image ? (
                image.endsWith('.svg') ? (
                  <object 
                    data={image} 
                    type="image/svg+xml"
                    className="w-10 h-10"
                    aria-label={name}
                  />
                ) : (
                  <img src={image} alt={name} className="max-w-full max-h-full object-contain" />
                )
              ) : (
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600">
                  {subcategory === 'cooling' && (
                    <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  )}
                  {subcategory === 'entertainment' && (
                    <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  )}
                  {subcategory === 'appliance' && (
                    <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 10V6a2 2 0 012-2h10a2 2 0 012 2v4M5 10h14M5 10v8a2 2 0 002 2h10a2 2 0 002-2v-8M12 14v4" />
                    </svg>
                  )}
                  {subcategory === 'cooking' && (
                    <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 5H8a2 2 0 00-2 2v4.5A2.5 2.5 0 008.5 14h7a2.5 2.5 0 002.5-2.5V7a2 2 0 00-2-2zm-1 6a1 1 0 11-2 0 1 1 0 012 0zm-4 0a1 1 0 11-2 0 1 1 0 012 0zm8 0a1 1 0 11-2 0 1 1 0 012 0z" />
                    </svg>
                  )}
                  {!subcategory || !['cooling', 'entertainment', 'appliance', 'cooking'].includes(subcategory) && (
                    <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  )}
                </div>
              )}
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{name}</h3>
              {brand && <p className="text-sm text-gray-500">{brand}</p>}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="relative">
              <button
                onClick={handleToggle}
                disabled={isToggling}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 focus:outline-none ${
                  localIsOn ? 'bg-green-500' : 'bg-gray-300'
                }`}
                aria-label={localIsOn ? 'Turn off' : 'Turn on'}
              >
                <span 
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                    localIsOn ? 'translate-x-6' : 'translate-x-0'
                  }`} 
                />
              </button>
              {isToggling && (
                <span className="absolute -top-1 -right-1 w-3 h-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
              )}
            </div>
            
            {onShowMenu && (
              <button
                onClick={() => onShowMenu(id)}
                className="p-1 rounded-full hover:bg-gray-100"
                aria-label="Menu"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
            )}
          </div>
        </div>
        
        {error && (
          <div className="mt-3">
            <ErrorMessage error={error} onRetry={() => setError(null)} />
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-0.5 border-t">
        <div className="bg-blue-50 p-3">
          <p className="text-xs text-blue-500 font-medium">Energy</p>
          <p className="text-blue-700 font-medium">{energy_kwh} kWh</p>
        </div>
        
        <div className="bg-red-50 p-3">
          <p className="text-xs text-red-500 font-medium">CO<sub>2</sub></p>
          <p className="text-red-700 font-medium">{co2_kg} kg</p>
        </div>
        
        <div className="bg-purple-50 p-3">
          <p className="text-xs text-purple-500 font-medium">Usage</p>
          <p className="text-purple-700 font-medium">{usage_time}h</p>
        </div>
        
        <div className="bg-green-50 p-3">
          <p className="text-xs text-green-500 font-medium">Cost</p>
          <p className="text-green-700 font-medium">€{cost_estimate.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
};

export default DeviceCard; 