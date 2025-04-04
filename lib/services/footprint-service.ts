import { supabase } from '@/lib/supabase/client';
import { 
  FootprintData, 
  FootprintResult, 
  FootprintBreakdown,
  TransportData,
  EnergyData,
  DietData
} from '@/lib/types';
import { calculateElectricityFootprint, calculateTransportationFootprint, calculateFlightFootprint } from '@/lib/carbon-api/client';

// Simulate a breakdown calculation while Carbon Interface API integration is being completed
function simulateBreakdown(totalCo2e: number): FootprintBreakdown {
  // This is a placeholder - in a real implementation, we would use actual data
  return {
    transport: totalCo2e * 0.4, // 40% from transport
    energy: totalCo2e * 0.35,   // 35% from energy
    diet: totalCo2e * 0.25,     // 25% from diet
  };
}

// Simulated calculation function - to be replaced with Carbon Interface API
export async function simulateFootprintCalculation(data: FootprintData): Promise<FootprintResult> {
  // Add some randomness to the simulation
  const randomFactor = 0.8 + Math.random() * 0.4; // between 0.8 and 1.2
  
  // Base factors (very simplified)
  let baseCo2e = 800; // baseline emissions for average person per month in kg CO2e
  
  // Country adjustment
  if (data.country === 'US') {
    baseCo2e *= 1.5;  // Higher emissions in the US
  } else if (data.country === 'FI') {
    baseCo2e *= 1.1;  // Finland is slightly higher than EU average
  }
  
  // Transport factors
  if (data.transport.car && data.transport.car.distance_km_week > 200) {
    baseCo2e *= 1.2;
  }
  
  if (data.transport.flights.long_haul_annual > 2) {
    baseCo2e *= 1.3;
  }
  
  // Energy factors
  if (data.energy.electricity_kwh_month > 400) {
    baseCo2e *= 1.15;
  }
  
  // Diet factors
  if (data.diet.type === 'vegan') {
    baseCo2e *= 0.7;
  } else if (data.diet.type === 'vegetarian') {
    baseCo2e *= 0.8;
  } else if (data.diet.type === 'meat_heavy') {
    baseCo2e *= 1.3;
  }
  
  // Household size adjustment
  baseCo2e = baseCo2e / Math.sqrt(data.housing.household_size);
  
  // Apply random factor
  const total_co2e_kg = baseCo2e * randomFactor;
  
  // Generate breakdown
  const breakdown = simulateBreakdown(total_co2e_kg);
  
  return {
    total_co2e_kg,
    breakdown,
  };
}

// Real footprint calculation using Carbon Interface API
export async function calculateRealFootprint(data: FootprintData): Promise<FootprintResult> {
  try {
    let totalCo2e = 0;
    const breakdown: FootprintBreakdown = {
      transport: 0,
      energy: 0,
      diet: 0
    };
    
    // Calculate electricity footprint if data is provided
    if (data.energy.electricity_kwh_month > 0) {
      try {
        console.log('Calculating electricity footprint...');
        const response = await fetch('https://www.carboninterface.com/api/v1/estimates', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.CARBON_INTERFACE_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            type: 'electricity',
            electricity_unit: 'kwh',
            electricity_value: data.energy.electricity_kwh_month,
            country: data.country.toLowerCase()
          })
        });
        
        if (response.ok) {
          const result = await response.json();
          const electricityCo2e = result.data.attributes.carbon_kg;
          totalCo2e += electricityCo2e;
          breakdown.energy += electricityCo2e;
          console.log(`Electricity CO2e: ${electricityCo2e} kg`);
        } else {
          console.error('Electricity API error:', await response.text());
          // Fall back to simulation for this component
          const simulatedEnergy = 200 * (data.energy.electricity_kwh_month / 300);
          totalCo2e += simulatedEnergy;
          breakdown.energy += simulatedEnergy;
        }
      } catch (error) {
        console.error('Error calculating electricity footprint:', error);
        // Fall back to simulation for this component
        const simulatedEnergy = 200 * (data.energy.electricity_kwh_month / 300);
        totalCo2e += simulatedEnergy;
        breakdown.energy += simulatedEnergy;
      }
    }
    
    // Calculate flight footprints if data is provided
    if (data.transport.flights.short_haul_annual > 0) {
      try {
        console.log('Calculating short-haul flight footprint...');
        const response = await fetch('https://www.carboninterface.com/api/v1/estimates', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.CARBON_INTERFACE_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            type: 'flight',
            passengers: 1,
            legs: [
              {
                departure_airport: 'HEL', // Helsinki
                destination_airport: 'ARN'  // Stockholm (short haul example)
              }
            ]
          })
        });
        
        if (response.ok) {
          const result = await response.json();
          const flightCo2e = result.data.attributes.carbon_kg * data.transport.flights.short_haul_annual;
          totalCo2e += flightCo2e;
          breakdown.transport += flightCo2e;
          console.log(`Short-haul flights CO2e: ${flightCo2e} kg`);
        } else {
          console.error('Flight API error:', await response.text());
          // Fall back to simulation
          const simulatedFlight = 100 * data.transport.flights.short_haul_annual;
          totalCo2e += simulatedFlight;
          breakdown.transport += simulatedFlight;
        }
      } catch (error) {
        console.error('Error calculating flight footprint:', error);
        // Fall back to simulation
        const simulatedFlight = 100 * data.transport.flights.short_haul_annual;
        totalCo2e += simulatedFlight;
        breakdown.transport += simulatedFlight;
      }
    }
    
    if (data.transport.flights.long_haul_annual > 0) {
      try {
        console.log('Calculating long-haul flight footprint...');
        const response = await fetch('https://www.carboninterface.com/api/v1/estimates', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.CARBON_INTERFACE_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            type: 'flight',
            passengers: 1,
            legs: [
              {
                departure_airport: 'HEL', // Helsinki
                destination_airport: 'JFK'  // New York (long haul example)
              }
            ]
          })
        });
        
        if (response.ok) {
          const result = await response.json();
          const flightCo2e = result.data.attributes.carbon_kg * data.transport.flights.long_haul_annual;
          totalCo2e += flightCo2e;
          breakdown.transport += flightCo2e;
          console.log(`Long-haul flights CO2e: ${flightCo2e} kg`);
        } else {
          console.error('Flight API error:', await response.text());
          // Fall back to simulation
          const simulatedFlight = 500 * data.transport.flights.long_haul_annual;
          totalCo2e += simulatedFlight;
          breakdown.transport += simulatedFlight;
        }
      } catch (error) {
        console.error('Error calculating flight footprint:', error);
        // Fall back to simulation
        const simulatedFlight = 500 * data.transport.flights.long_haul_annual;
        totalCo2e += simulatedFlight;
        breakdown.transport += simulatedFlight;
      }
    }
    
    // Car footprint - we would need to look up vehicle models 
    // For now, we'll use a simplified approach with simulation
    if (data.transport.car && data.transport.car.distance_km_week > 0) {
      // This would be replaced with actual vehicle model lookup and API call
      const carUsage = data.transport.car.distance_km_week * 4; // monthly
      const carCo2e = data.transport.car.fuel === 'electric' ? carUsage * 0.1 : carUsage * 0.2;
      totalCo2e += carCo2e;
      breakdown.transport += carCo2e;
      console.log(`Car CO2e: ${carCo2e} kg`);
    }
    
    // Diet - Carbon Interface doesn't directly calculate this
    // Using simulation based on diet type
    let dietCo2e = 200; // Base value
    if (data.diet.type === 'vegan') {
      dietCo2e = 50;
    } else if (data.diet.type === 'vegetarian') {
      dietCo2e = 100;
    } else if (data.diet.type === 'pescetarian') {
      dietCo2e = 150;
    } else if (data.diet.type === 'meat_heavy') {
      dietCo2e = 300;
    }
    
    totalCo2e += dietCo2e;
    breakdown.diet = dietCo2e;
    console.log(`Diet CO2e: ${dietCo2e} kg`);
    
    console.log(`Total CO2e: ${totalCo2e} kg`);
    
    return {
      total_co2e_kg: totalCo2e,
      breakdown
    };
  } catch (error) {
    console.error('Error in real footprint calculation:', error);
    // Fall back to simulation if overall calculation fails
    console.log('Falling back to simulation due to error');
    return simulateFootprintCalculation(data);
  }
}

// Helper function to get input data based on category
function getRawInputData(inputData: FootprintData, category: string): any {
  switch(category) {
    case 'transport':
      return inputData.transport;
    case 'energy':
      return inputData.energy;
    case 'diet':
      return inputData.diet;
    default:
      return {};
  }
}

// Save a footprint calculation to the database
export async function saveFootprint(
  userId: string, 
  calculationResult: FootprintResult, 
  inputData: FootprintData
): Promise<FootprintResult | null> {
  try {
    // Insert the main footprint record
    const { data: footprintData, error: footprintError } = await supabase
      .from('footprints')
      .insert({
        user_id: userId,
        total_co2e_kg: calculationResult.total_co2e_kg,
        country_code: inputData.country
      })
      .select()
      .single();
    
    if (footprintError) throw footprintError;
    
    // Insert the detailed breakdown records
    if (calculationResult.breakdown) {
      const breakdownEntries = Object.entries(calculationResult.breakdown).map(([category, value]) => ({
        footprint_id: footprintData.id,
        category,
        subcategory: 'total', // This would be more specific in a real implementation
        value,
        raw_input: getRawInputData(inputData, category)
      }));
      
      const { error: detailsError } = await supabase
        .from('footprint_details')
        .insert(breakdownEntries);
      
      if (detailsError) throw detailsError;
    }
    
    return {
      ...calculationResult,
      id: footprintData.id,
      created_at: footprintData.created_at
    };
  } catch (error) {
    console.error('Error saving footprint:', error);
    return null;
  }
}

// Get a user's footprint history
export async function getUserFootprints(userId: string): Promise<FootprintResult[]> {
  try {
    const { data, error } = await supabase
      .from('footprints')
      .select(`
        id,
        created_at,
        total_co2e_kg,
        country_code
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching footprints:', error);
    return [];
  }
}

// Get a specific footprint with details
export async function getFootprintDetails(footprintId: string): Promise<FootprintResult | null> {
  try {
    // Get the main footprint record
    const { data: footprint, error: footprintError } = await supabase
      .from('footprints')
      .select()
      .eq('id', footprintId)
      .single();
    
    if (footprintError) throw footprintError;
    
    // Get the breakdown details
    const { data: details, error: detailsError } = await supabase
      .from('footprint_details')
      .select()
      .eq('footprint_id', footprintId);
    
    if (detailsError) throw detailsError;
    
    // Create a breakdown object from the details
    const breakdown = details?.reduce((acc, detail) => {
      acc[detail.category] = detail.value;
      return acc;
    }, {} as FootprintBreakdown);
    
    return {
      id: footprint.id,
      created_at: footprint.created_at,
      total_co2e_kg: footprint.total_co2e_kg,
      breakdown
    };
  } catch (error) {
    console.error('Error fetching footprint details:', error);
    return null;
  }
} 