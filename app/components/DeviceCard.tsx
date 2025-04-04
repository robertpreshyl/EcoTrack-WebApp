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
    <div 
      className={`p-4 bg-white border ${isOn ? 'border-teal-200' : 'border-slate-200'} rounded-lg shadow-sm transition-all ${
        isOn ? 'shadow-teal-100' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
            isOn ? 'bg-teal-100 text-teal-600' : 'bg-slate-100 text-slate-400'
          }`}>
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
          <div className="ml-3">
            <h3 className="text-sm font-medium leading-tight text-slate-800 truncate max-w-[120px]">
              {name}
            </h3>
            <p className="text-xs text-slate-500 truncate max-w-[120px]">
              {brand || subcategory}
            </p>
          </div>
        </div>
        
        <button 
          className={`flex items-center justify-center p-1 rounded-full focus:outline-none focus:ring-2 ${
            isOn 
              ? 'text-teal-500 focus:ring-teal-500' 
              : 'text-slate-400 focus:ring-slate-400'
          }`}
          onClick={() => onShowMenu?.(id)}
          aria-label="Device menu"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
      </div>
      
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium text-slate-500">
            {isOn ? 'Active' : 'Inactive'}
          </span>
          <div 
            className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              isOn ? 'bg-teal-500' : 'bg-slate-200'
            }`}
            onClick={handleToggle}
          >
            <span 
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                isOn ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </div>
        </div>
      </div>
      
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500">Energy/mo</span>
          <span className="text-xs font-medium text-slate-700">{energy_kwh.toFixed(1)} kWh</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500">CO₂/mo</span>
          <span className="text-xs font-medium text-slate-700">{co2_kg.toFixed(1)} kg</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500">Est. cost</span>
          <span className="text-xs font-medium text-slate-700">€{cost_estimate.toFixed(1)}</span>
        </div>
      </div>
      
      {error && (
        <div className="mt-3">
          <ErrorMessage error={error} onRetry={() => setError(null)} />
        </div>
      )}
    </div>
  );
};

export default DeviceCard; 