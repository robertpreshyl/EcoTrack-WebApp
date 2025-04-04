'use client';

import React, { useState } from 'react';
import { logError } from '@/lib/utils/error-handler';

interface DeviceStatsCardProps {
  id: string;
  name: string;
  brand?: string;
  image?: string;
  energy_kwh: number;
  co2_kg: number;
  usage_time: number;
  cost_estimate: number;
  isOn: boolean;
  onToggle: (id: string, newStatus: boolean) => void;
  onShowMenu?: (id: string) => void;
}

const DeviceStatsCard: React.FC<DeviceStatsCardProps> = ({
  id,
  name,
  brand,
  image,
  energy_kwh,
  co2_kg,
  usage_time,
  cost_estimate,
  isOn,
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
      // Call parent component's toggle handler
      await onToggle(id, newStatus);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to toggle device';
      const appError = new Error(errorMessage);
      logError(appError, 'DeviceStatsCard', 'handleToggle', { 
        deviceId: id, 
        targetStatus: newStatus 
      });
      
      // Revert to original state on error
      setLocalIsOn(!newStatus);
      setError(appError);
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <div className="relative bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md border border-gray-100">
      <div className="absolute top-3 right-3 z-10">
        <div className="relative">
          <button
            onClick={handleToggle}
            disabled={isToggling}
            className={`w-14 h-7 flex items-center rounded-full p-1 transition-colors duration-300 focus:outline-none ${
              localIsOn ? 'bg-green-500' : 'bg-gray-300'
            }`}
            aria-label={localIsOn ? 'Turn off' : 'Turn on'}
          >
            <span 
              className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${
                localIsOn ? 'translate-x-7' : 'translate-x-0'
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
      </div>
      
      <div className="p-5 flex flex-col h-full">
        <div className="flex items-center mb-4">
          <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center mr-4">
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
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            )}
          </div>
          <div>
            <h3 className="font-medium text-gray-900 text-lg">{name}</h3>
            {brand && <p className="text-sm text-gray-500">{brand}</p>}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-auto">
          <div className="flex flex-col">
            <span className="text-xs font-medium text-blue-500 mb-1">ENERGY</span>
            <div className="flex items-baseline">
              <span className="text-lg font-medium text-gray-900">{energy_kwh}</span>
              <span className="text-xs text-gray-500 ml-1">kWh</span>
            </div>
          </div>
          
          <div className="flex flex-col">
            <span className="text-xs font-medium text-red-500 mb-1">CO₂</span>
            <div className="flex items-baseline">
              <span className="text-lg font-medium text-gray-900">{co2_kg}</span>
              <span className="text-xs text-gray-500 ml-1">kg</span>
            </div>
          </div>
          
          <div className="flex flex-col">
            <span className="text-xs font-medium text-purple-500 mb-1">USAGE</span>
            <div className="flex items-baseline">
              <span className="text-lg font-medium text-gray-900">{usage_time}</span>
              <span className="text-xs text-gray-500 ml-1">h</span>
            </div>
          </div>
          
          <div className="flex flex-col">
            <span className="text-xs font-medium text-green-500 mb-1">COST</span>
            <div className="flex items-baseline">
              <span className="text-lg font-medium text-gray-900">€{cost_estimate.toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        {error && (
          <div className="mt-3 p-2 bg-red-50 text-red-700 text-sm rounded">
            Error: {error.message}
          </div>
        )}
        
        {onShowMenu && (
          <button
            onClick={() => onShowMenu(id)}
            className="absolute bottom-3 right-3 p-2 rounded-full hover:bg-gray-100"
            aria-label="Menu"
          >
            <svg className="w-5 h-5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default DeviceStatsCard; 