'use client';

import React, { useState } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';
import { logError } from '@/lib/utils/error-handler';
import { v4 as uuidv4 } from 'uuid';

interface AddDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeviceAdded: () => void;
  userId: string;
}

const deviceCategories = [
  { 
    name: 'Kitchen', 
    subcategories: [
      { name: 'Refrigerator', avgKwh: 2.0, avgCo2: 1.0 },
      { name: 'Microwave', avgKwh: 1.2, avgCo2: 0.6 },
      { name: 'Oven', avgKwh: 2.4, avgCo2: 1.2 },
      { name: 'Dishwasher', avgKwh: 1.5, avgCo2: 0.75 },
      { name: 'Coffee Maker', avgKwh: 0.8, avgCo2: 0.4 },
    ]
  },
  { 
    name: 'Living Room', 
    subcategories: [
      { name: 'Television', avgKwh: 0.1, avgCo2: 0.05 },
      { name: 'Game Console', avgKwh: 0.15, avgCo2: 0.075 },
      { name: 'Sound System', avgKwh: 0.05, avgCo2: 0.025 },
    ]
  },
  { 
    name: 'Bedroom', 
    subcategories: [
      { name: 'Air Conditioner', avgKwh: 1.5, avgCo2: 0.75 },
      { name: 'Fan', avgKwh: 0.07, avgCo2: 0.035 },
      { name: 'Lamp', avgKwh: 0.06, avgCo2: 0.03 },
    ]
  },
  { 
    name: 'Bathroom', 
    subcategories: [
      { name: 'Hair Dryer', avgKwh: 1, avgCo2: 0.5 },
      { name: 'Electric Toothbrush', avgKwh: 0.001, avgCo2: 0.0005 },
      { name: 'Water Heater', avgKwh: 2.5, avgCo2: 1.25 },
    ]
  },
  { 
    name: 'Office', 
    subcategories: [
      { name: 'Computer', avgKwh: 0.2, avgCo2: 0.1 },
      { name: 'Monitor', avgKwh: 0.1, avgCo2: 0.05 },
      { name: 'Printer', avgKwh: 0.05, avgCo2: 0.025 },
      { name: 'Router', avgKwh: 0.01, avgCo2: 0.005 },
    ]
  },
];

const rooms = [
  'Kitchen',
  'Living Room',
  'Master Bedroom',
  'Bedroom',
  'Bathroom',
  'Office',
  'Garage',
  'Other'
];

const AddDeviceModal: React.FC<AddDeviceModalProps> = ({ 
  isOpen, 
  onClose,
  onDeviceAdded,
  userId
}) => {
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [room, setRoom] = useState('');
  const [usageTime, setUsageTime] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [estimatedEnergy, setEstimatedEnergy] = useState(0);
  const [estimatedCo2, setEstimatedCo2] = useState(0);
  const [estimatedCost, setEstimatedCost] = useState(0);

  // Get available subcategories based on selected category
  const availableSubcategories = deviceCategories.find(
    cat => cat.name === selectedCategory
  )?.subcategories || [];

  // Update estimated values when subcategory or usage time changes
  React.useEffect(() => {
    const selectedSubcategoryInfo = availableSubcategories.find(
      sub => sub.name === selectedSubcategory
    );
    
    if (selectedSubcategoryInfo && usageTime > 0) {
      const energyKwh = selectedSubcategoryInfo.avgKwh * usageTime * 30; // Monthly estimate
      const co2Kg = selectedSubcategoryInfo.avgCo2 * usageTime * 30; // Monthly estimate
      const costEstimate = energyKwh * 0.25; // Estimated cost at €0.25 per kWh
      
      setEstimatedEnergy(parseFloat(energyKwh.toFixed(2)));
      setEstimatedCo2(parseFloat(co2Kg.toFixed(2)));
      setEstimatedCost(parseFloat(costEstimate.toFixed(2)));
    }
  }, [selectedSubcategory, usageTime, availableSubcategories]);

  // Reset form
  const resetForm = () => {
    setName('');
    setBrand('');
    setSelectedCategory('');
    setSelectedSubcategory('');
    setRoom('');
    setUsageTime(1);
    setEstimatedEnergy(0);
    setEstimatedCo2(0);
    setEstimatedCost(0);
    setError(null);
  };

  // Handle category change
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setSelectedSubcategory('');
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !selectedCategory || !selectedSubcategory) {
      setError('Please fill in all required fields');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const supabase = createBrowserSupabaseClient();
      
      // Generate a UUID for the device
      const deviceId = uuidv4();
      
      // Create the device in Supabase
      const { error: insertError } = await supabase
        .from('devices')
        .insert({
          id: deviceId,
          user_id: userId,
          name,
          brand: brand || null,
          category: selectedCategory,
          subcategory: selectedSubcategory,
          room: room || null,
          energy_kwh: estimatedEnergy,
          co2_kg: estimatedCo2,
          usage_time: usageTime,
          cost_estimate: estimatedCost,
          is_on: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          // Simple placeholder image path based on the device type - switched to SVG for better quality
          image_path: `/images/devices/${selectedSubcategory.toLowerCase().replace(/\s+/g, '_')}.svg`
        });
      
      if (insertError) {
        throw new Error(`Failed to add device: ${insertError.message}`);
      }
      
      // Call the onDeviceAdded callback
      onDeviceAdded();
      
      // Reset the form and close the modal
      resetForm();
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add device';
      logError(new Error(errorMessage), 'AddDeviceModal', 'handleSubmit', { 
        userId, 
        deviceName: name 
      });
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />
        
        <div className="relative transform overflow-hidden rounded-lg bg-white shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
          <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                <h3 className="text-xl font-semibold leading-6 text-gray-900">
                  Add New Device
                </h3>
                
                <div className="mt-4">
                  <form onSubmit={handleSubmit}>
                    {/* Device Name */}
                    <div className="mb-4">
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Device Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                        required
                      />
                    </div>
                    
                    {/* Brand */}
                    <div className="mb-4">
                      <label htmlFor="brand" className="block text-sm font-medium text-gray-700">
                        Brand
                      </label>
                      <input
                        type="text"
                        id="brand"
                        value={brand}
                        onChange={(e) => setBrand(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                      />
                    </div>
                    
                    {/* Category */}
                    <div className="mb-4">
                      <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                        Category <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="category"
                        value={selectedCategory}
                        onChange={(e) => handleCategoryChange(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                        required
                      >
                        <option value="">Select a category</option>
                        {deviceCategories.map((category) => (
                          <option key={category.name} value={category.name}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    {/* Subcategory - shown only if category is selected */}
                    {selectedCategory && (
                      <div className="mb-4">
                        <label htmlFor="subcategory" className="block text-sm font-medium text-gray-700">
                          Device Type <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="subcategory"
                          value={selectedSubcategory}
                          onChange={(e) => setSelectedSubcategory(e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                          required
                        >
                          <option value="">Select a device type</option>
                          {availableSubcategories.map((subcategory) => (
                            <option key={subcategory.name} value={subcategory.name}>
                              {subcategory.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    
                    {/* Room */}
                    <div className="mb-4">
                      <label htmlFor="room" className="block text-sm font-medium text-gray-700">
                        Room
                      </label>
                      <select
                        id="room"
                        value={room}
                        onChange={(e) => setRoom(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                      >
                        <option value="">Select a room</option>
                        {rooms.map((roomName) => (
                          <option key={roomName} value={roomName}>
                            {roomName}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    {/* Usage Time */}
                    <div className="mb-4">
                      <label htmlFor="usageTime" className="block text-sm font-medium text-gray-700">
                        Daily Usage Time (hours) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        id="usageTime"
                        min="0.1"
                        max="24"
                        step="0.1"
                        value={usageTime}
                        onChange={(e) => setUsageTime(parseFloat(e.target.value))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                        required
                      />
                    </div>
                    
                    {/* Estimates Section - shown only if subcategory is selected */}
                    {selectedSubcategory && (
                      <div className="mt-4 mb-4 p-4 bg-gray-50 rounded-md">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Monthly Estimates</h4>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <p className="text-xs text-blue-500">Energy</p>
                            <p className="text-sm font-medium">{estimatedEnergy} kWh</p>
                          </div>
                          <div>
                            <p className="text-xs text-red-500">CO<sub>2</sub></p>
                            <p className="text-sm font-medium">{estimatedCo2} kg</p>
                          </div>
                          <div>
                            <p className="text-xs text-green-500">Cost</p>
                            <p className="text-sm font-medium">€{estimatedCost.toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Error message */}
                    {error && (
                      <div className="mb-4 p-2 text-sm text-red-600 bg-red-50 rounded-md">
                        {error}
                      </div>
                    )}
                  </form>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`inline-flex w-full justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 sm:ml-3 sm:w-auto ${
                isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? 'Adding...' : 'Add Device'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddDeviceModal; 