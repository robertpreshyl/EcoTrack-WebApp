// Simple test script for footprint calculation
require('dotenv').config({ path: '.env.local' });

// Create sample footprint data
const sampleFootprintData = {
  country: 'FI',
  transport: {
    car: {
      distance_km_week: 150,
      fuel_type: 'gasoline'
    },
    flights: {
      short_haul_annual: 2,
      medium_haul_annual: 1,
      long_haul_annual: 0
    }
  },
  energy: {
    electricity_kwh_month: 300,
    heating_type: 'district',
    renewable_percentage: 20
  },
  diet: {
    type: 'vegetarian'
  },
  housing: {
    household_size: 2
  }
};

// Simple simulation function (copied from the service)
async function simulateFootprintCalculation(data) {
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
  const breakdown = {
    transport: total_co2e_kg * 0.4, // 40% from transport
    energy: total_co2e_kg * 0.35,   // 35% from energy
    diet: total_co2e_kg * 0.25,     // 25% from diet
  };
  
  return {
    total_co2e_kg,
    breakdown,
  };
}

async function testFootprintCalculation() {
  console.log('Testing footprint calculation...');
  
  try {
    console.log('\nCalculating footprint for sample data:');
    console.log(JSON.stringify(sampleFootprintData, null, 2));
    
    // Use the simulation function
    const result = await simulateFootprintCalculation(sampleFootprintData);
    
    console.log('\nFootprint calculation result:');
    console.log(JSON.stringify(result, null, 2));
    
    console.log('\nFootprint test completed successfully');
  } catch (error) {
    console.error('Error during footprint calculation test:', error.message);
  }
}

testFootprintCalculation(); 