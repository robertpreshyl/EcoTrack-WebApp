"use client";

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { logError } from '@/lib/utils/error-handler';
import ErrorMessage from './ErrorMessage';

// Carbon emission factors (example values in kg CO2e)
const EMISSION_FACTORS = {
  transport: {
    car: 0.17, // kg CO2e per km
    bus: 0.105, // kg CO2e per km
    train: 0.041, // kg CO2e per km
    plane: 0.255, // kg CO2e per km
  },
  energy: {
    electricity: 0.233, // kg CO2e per kWh
    naturalGas: 0.184, // kg CO2e per kWh
    heating: 0.27, // kg CO2e per kWh
  },
  diet: {
    redMeat: 27, // kg CO2e per kg
    poultry: 6.9, // kg CO2e per kg
    fish: 6.1, // kg CO2e per kg
    dairy: 21, // kg CO2e per kg
    vegetables: 2, // kg CO2e per kg
    fruits: 1.1, // kg CO2e per kg
  }
};

// Country adjustment factors (some countries are more carbon efficient than others)
const COUNTRY_FACTORS = {
  "US": 1.0,
  "UK": 0.8,
  "EU": 0.7,
  "CN": 1.2,
  "IN": 1.1,
  "JP": 0.9,
  "AU": 1.1,
  "CA": 0.9,
  "BR": 0.8,
  "ZA": 1.2,
  // Add more countries as needed
};

interface CalculatorProps {
  user: User;
  onComplete?: () => void;
  t: (key: string, options?: Record<string, any>) => string;
}

const Calculator: React.FC<CalculatorProps> = ({ user, onComplete, t }) => {
  // Form state
  const [step, setStep] = useState<'transport' | 'energy' | 'diet' | 'results'>('transport');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [calculationComplete, setCalculationComplete] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Transport data
  const [transportData, setTransportData] = useState({
    carDistance: 0,
    busDistance: 0,
    trainDistance: 0,
    planeDistance: 0,
    carUsage: 0,
    shortHaulFlights: 0,
    longHaulFlights: 0,
    vehicle: null as null | { make: string; model: string; },
  });
  
  // Energy data
  const [energyData, setEnergyData] = useState({
    electricityUsage: 0,
    naturalGasUsage: 0,
    heatingUsage: 0,
    householdSize: 1,
  });
  
  // Diet data
  const [dietData, setDietData] = useState({
    redMeatConsumption: 0,
    poultryConsumption: 0,
    fishConsumption: 0,
    dairyConsumption: 0,
    vegetablesConsumption: 0,
    fruitsConsumption: 0,
  });
  
  // User's country
  const [country, setCountry] = useState<keyof typeof COUNTRY_FACTORS>("US");
  
  // Results
  const [results, setResults] = useState({
    transportEmissions: 0,
    energyEmissions: 0,
    dietEmissions: 0,
    totalEmissions: 0,
  });

  // Handle input changes
  const handleTransportChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTransportData(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0,
    }));
  };

  const handleEnergyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEnergyData(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0,
    }));
  };

  const handleDietChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDietData(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0,
    }));
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCountry(e.target.value as keyof typeof COUNTRY_FACTORS);
  };

  // Calculate emissions
  const calculateEmissions = () => {
    // Transport emissions
    const transportEmissions = (
      transportData.carDistance * EMISSION_FACTORS.transport.car +
      transportData.busDistance * EMISSION_FACTORS.transport.bus +
      transportData.trainDistance * EMISSION_FACTORS.transport.train +
      transportData.planeDistance * EMISSION_FACTORS.transport.plane
    );
    
    // Energy emissions
    const energyEmissions = (
      energyData.electricityUsage * EMISSION_FACTORS.energy.electricity +
      energyData.naturalGasUsage * EMISSION_FACTORS.energy.naturalGas +
      energyData.heatingUsage * EMISSION_FACTORS.energy.heating
    );
    
    // Diet emissions
    const dietEmissions = (
      dietData.redMeatConsumption * EMISSION_FACTORS.diet.redMeat +
      dietData.poultryConsumption * EMISSION_FACTORS.diet.poultry +
      dietData.fishConsumption * EMISSION_FACTORS.diet.fish +
      dietData.dairyConsumption * EMISSION_FACTORS.diet.dairy +
      dietData.vegetablesConsumption * EMISSION_FACTORS.diet.vegetables +
      dietData.fruitsConsumption * EMISSION_FACTORS.diet.fruits
    );
    
    // Apply country adjustment factor
    const countryFactor = COUNTRY_FACTORS[country];
    
    // Calculate total with country adjustment
    const total = (transportEmissions + energyEmissions + dietEmissions) * countryFactor;
    
    return {
      transportEmissions,
      energyEmissions,
      dietEmissions,
      totalEmissions: total,
    };
  };

  // Handle step navigation
  const handleNext = () => {
    if (step === 'transport') setStep('energy');
    else if (step === 'energy') setStep('diet');
    else if (step === 'diet') {
      const emissionResults = calculateEmissions();
      setResults(emissionResults);
      setStep('results');
    }
  };

  const handleBack = () => {
    if (step === 'energy') setStep('transport');
    else if (step === 'diet') setStep('energy');
    else if (step === 'results') setStep('diet');
  };

  // Save footprint data to database
  const saveFootprint = async () => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Get the calculated data
      if (!results) {
        throw new Error('No calculation results available');
      }
      
      let footprintId;
      
      // First calculate energy emissions using the API
      if (energyData.electricityUsage > 0) {
        const energyResponse = await fetch('/api/energy', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            energy_type: 'electricity',
            electricity_value: energyData.electricityUsage,
            electricity_unit: 'kwh',
            country: country,
            household_size: energyData.householdSize
          }),
        });
        
        if (!energyResponse.ok) {
          const errorData = await energyResponse.json();
          throw new Error(`Energy calculation failed: ${errorData.error}`);
        }
        
        const energyResult = await energyResponse.json();
        console.log('Energy calculation result:', energyResult);
        
        // Store the footprint ID for additional details
        footprintId = energyResult.footprint_id;
      }
      
      // Skip transport API calls for now to avoid type errors
      /* Commented out to avoid errors until we have proper data
      // Add transport details if available
      if (transportData.carUsage > 0 && transportData.vehicle) {
        try {
          const transportResponse = await fetch('/api/transport', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              transport_type: 'vehicle',
              distance_value: transportData.carUsage * 4, // Monthly estimate
              distance_unit: 'km',
              vehicle_make: transportData.vehicle.make,
              vehicle_model: transportData.vehicle.model
            }),
          });
          
          if (!transportResponse.ok) {
            console.error('Transport calculation failed:', await transportResponse.text());
            // Continue with saving process even if transport calculation fails
          } else {
            console.log('Transport calculation result:', await transportResponse.json());
          }
        } catch (transportError) {
          console.error('Transport API error:', transportError);
          // Continue with saving process
        }
      }
      
      // If flights are included, calculate their emissions
      if (transportData.shortHaulFlights > 0 || transportData.longHaulFlights > 0) {
        // Calculate short haul flights
        if (transportData.shortHaulFlights > 0) {
          try {
            await fetch('/api/transport', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                transport_type: 'flight',
                departure_airport: 'HEL', // Helsinki as default
                destination_airport: 'ARN', // Stockholm as example short haul
                passengers: transportData.shortHaulFlights
              }),
            });
          } catch (flightError) {
            console.error('Short haul flight calculation error:', flightError);
          }
        }
        
        // Calculate long haul flights
        if (transportData.longHaulFlights > 0) {
          try {
            await fetch('/api/transport', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                transport_type: 'flight',
                departure_airport: 'HEL', // Helsinki as default
                destination_airport: 'JFK', // New York as example long haul
                passengers: transportData.longHaulFlights
              }),
            });
          } catch (flightError) {
            console.error('Long haul flight calculation error:', flightError);
          }
        }
      }
      */
      
      // On success, call the onComplete handler
      if (onComplete) {
        onComplete();
      }
      
      // Show success message and reset form
      setCalculationComplete(true);
      handleReset();
    } catch (err) {
      const appError = logError(err, 'Calculator', 'saveFootprint', { userId: user?.id });
      setError(appError);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset calculator
  const handleReset = () => {
    setTransportData({
      carDistance: 0,
      busDistance: 0,
      trainDistance: 0,
      planeDistance: 0,
      carUsage: 0,
      shortHaulFlights: 0,
      longHaulFlights: 0,
      vehicle: null,
    });
    
    setEnergyData({
      electricityUsage: 0,
      naturalGasUsage: 0,
      heatingUsage: 0,
      householdSize: 1,
    });
    
    setDietData({
      redMeatConsumption: 0,
      poultryConsumption: 0,
      fishConsumption: 0,
      dairyConsumption: 0,
      vegetablesConsumption: 0,
      fruitsConsumption: 0,
    });
    
    setStep('transport');
    setCalculationComplete(false);
  };

  // Helper function to format number with 1 decimal place
  const formatNumber = (num: number) => {
    return num.toFixed(1);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-800 to-green-600 text-white py-5 px-6">
        <h2 className="text-xl font-bold">Carbon Footprint Calculator</h2>
        <p className="text-sm opacity-90">
          Step {step === 'transport' ? '1' : step === 'energy' ? '2' : step === 'diet' ? '3' : '4'} of 4
        </p>
      </div>
      
      {/* Progress bar */}
      <div className="bg-gray-100 h-2">
        <div 
          className="bg-green-500 h-full transition-all duration-300" 
          style={{ 
            width: step === 'transport' 
              ? '25%' 
              : step === 'energy' 
              ? '50%' 
              : step === 'diet' 
              ? '75%' 
              : '100%' 
          }}
        ></div>
      </div>
      
      {/* Content */}
      <div className="p-6">
        {/* Show error message if there is an error */}
        {error && (
          <div className="mb-4">
            <ErrorMessage 
              error={error} 
              onRetry={() => setError(null)} 
            />
          </div>
        )}
        
        {/* Transport Section */}
        {step === 'transport' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-700">Transportation</h3>
            <p className="text-gray-600 text-sm">
              Enter your average weekly transportation usage in kilometers.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Car travel (km/week)</label>
                <input
                  type="number"
                  name="carDistance"
                  value={transportData.carDistance}
                  onChange={handleTransportChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                  placeholder="0"
                  min="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bus travel (km/week)</label>
                <input
                  type="number"
                  name="busDistance"
                  value={transportData.busDistance}
                  onChange={handleTransportChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                  placeholder="0"
                  min="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Train travel (km/week)</label>
                <input
                  type="number"
                  name="trainDistance"
                  value={transportData.trainDistance}
                  onChange={handleTransportChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                  placeholder="0"
                  min="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Flights (km/month)
                </label>
                <input
                  type="number"
                  name="planeDistance"
                  value={transportData.planeDistance}
                  onChange={handleTransportChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                  placeholder="0"
                  min="0"
                />
                <p className="text-xs text-gray-500 mt-1">Average flight distance per month</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Energy Section */}
        {step === 'energy' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-700">Home Energy</h3>
            <p className="text-gray-600 text-sm">
              Enter your average monthly energy consumption.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Electricity (kWh/month)</label>
                <input
                  type="number"
                  name="electricityUsage"
                  value={energyData.electricityUsage}
                  onChange={handleEnergyChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                  placeholder="0"
                  min="0"
                />
                <p className="text-xs text-gray-500 mt-1">Check your electricity bill for this information</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Natural Gas (kWh/month)</label>
                <input
                  type="number"
                  name="naturalGasUsage"
                  value={energyData.naturalGasUsage}
                  onChange={handleEnergyChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                  placeholder="0"
                  min="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Heating Oil (kWh/month)</label>
                <input
                  type="number"
                  name="heatingUsage"
                  value={energyData.heatingUsage}
                  onChange={handleEnergyChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>
          </div>
        )}
        
        {/* Diet Section */}
        {step === 'diet' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-700">Diet</h3>
            <p className="text-gray-600 text-sm">
              Enter your average weekly food consumption in kilograms.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Red Meat (kg/week)</label>
                <input
                  type="number"
                  name="redMeatConsumption"
                  value={dietData.redMeatConsumption}
                  onChange={handleDietChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                  placeholder="0"
                  min="0"
                  step="0.1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Poultry (kg/week)</label>
                <input
                  type="number"
                  name="poultryConsumption"
                  value={dietData.poultryConsumption}
                  onChange={handleDietChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                  placeholder="0"
                  min="0"
                  step="0.1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fish (kg/week)</label>
                <input
                  type="number"
                  name="fishConsumption"
                  value={dietData.fishConsumption}
                  onChange={handleDietChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                  placeholder="0"
                  min="0"
                  step="0.1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dairy (kg/week)</label>
                <input
                  type="number"
                  name="dairyConsumption"
                  value={dietData.dairyConsumption}
                  onChange={handleDietChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                  placeholder="0"
                  min="0"
                  step="0.1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vegetables (kg/week)</label>
                <input
                  type="number"
                  name="vegetablesConsumption"
                  value={dietData.vegetablesConsumption}
                  onChange={handleDietChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                  placeholder="0"
                  min="0"
                  step="0.1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fruits (kg/week)</label>
                <input
                  type="number"
                  name="fruitsConsumption"
                  value={dietData.fruitsConsumption}
                  onChange={handleDietChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                  placeholder="0"
                  min="0"
                  step="0.1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <select
                  value={country}
                  onChange={handleCountryChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                >
                  {Object.keys(COUNTRY_FACTORS).map((countryCode) => (
                    <option key={countryCode} value={countryCode}>
                      {countryCode === "US" ? "United States" :
                       countryCode === "UK" ? "United Kingdom" :
                       countryCode === "EU" ? "European Union" :
                       countryCode === "CN" ? "China" :
                       countryCode === "IN" ? "India" :
                       countryCode === "JP" ? "Japan" :
                       countryCode === "AU" ? "Australia" :
                       countryCode === "CA" ? "Canada" :
                       countryCode === "BR" ? "Brazil" :
                       countryCode === "ZA" ? "South Africa" : countryCode}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Select the country where you primarily live</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Results Section */}
        {step === 'results' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-700">Your Carbon Footprint Results</h3>
            
            {calculationComplete ? (
              <div className="bg-green-50 p-5 rounded-lg text-center border border-green-100">
                <svg className="w-12 h-12 text-green-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <h4 className="text-lg font-medium text-green-800">Calculation Complete!</h4>
                <p className="text-sm text-green-700 mt-2">
                  Your carbon footprint has been saved. View more details in your dashboard.
                </p>
                <button
                  onClick={handleReset}
                  className="mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                >
                  Calculate Again
                </button>
              </div>
            ) : (
              <>
                <div className="bg-green-50 p-5 rounded-lg border border-green-100">
                  <div className="text-center mb-4">
                    <p className="text-gray-500 text-sm">Your Total Carbon Footprint</p>
                    <p className="text-3xl font-bold text-green-700">
                      {formatNumber(results.totalEmissions)} kg CO₂e
                    </p>
                    <p className="text-xs text-gray-500 mt-1">per month</p>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3 mt-4">
                    <div className="text-center p-3 bg-white rounded-lg">
                      <p className="text-gray-500 text-xs">Transport</p>
                      <p className="text-lg font-semibold text-gray-800">{formatNumber(results.transportEmissions)}</p>
                      <p className="text-xs text-gray-500">kg CO₂e</p>
                    </div>
                    
                    <div className="text-center p-3 bg-white rounded-lg">
                      <p className="text-gray-500 text-xs">Energy</p>
                      <p className="text-lg font-semibold text-gray-800">{formatNumber(results.energyEmissions)}</p>
                      <p className="text-xs text-gray-500">kg CO₂e</p>
                    </div>
                    
                    <div className="text-center p-3 bg-white rounded-lg">
                      <p className="text-gray-500 text-xs">Diet</p>
                      <p className="text-lg font-semibold text-gray-800">{formatNumber(results.dietEmissions)}</p>
                      <p className="text-xs text-gray-500">kg CO₂e</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-600 text-sm">
                      Save this calculation to track your carbon footprint over time.
                    </p>
                  </div>
                  <button
                    onClick={saveFootprint}
                    disabled={isSubmitting}
                    className={`px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isSubmitting ? 'Saving...' : 'Save Results'}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
        
        {/* Navigation Buttons */}
        {!calculationComplete && (
          <div className="flex justify-between mt-8">
            {step !== 'transport' ? (
              <button
                onClick={handleBack}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
              >
                Back
              </button>
            ) : (
              <div></div>
            )}
            
            {step !== 'results' && (
              <button
                onClick={handleNext}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
              >
                Next
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Calculator; 