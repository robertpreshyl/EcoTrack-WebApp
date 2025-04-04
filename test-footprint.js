require('dotenv').config({ path: '.env.local' });

// We can't use the Next.js path aliases (@/lib/...) in Node scripts
// so we need to use direct relative paths
const footprintService = require('./lib/services/footprint-service');

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

async function testFootprintCalculation() {
  console.log('Testing footprint calculation service...');
  
  try {
    console.log('\nCalculating footprint for sample data:');
    console.log(JSON.stringify(sampleFootprintData, null, 2));
    
    // Use the simulation function from the imported service
    const result = await footprintService.simulateFootprintCalculation(sampleFootprintData);
    
    console.log('\nFootprint calculation result:');
    console.log(JSON.stringify(result, null, 2));
    
    console.log('\nFootprint test completed successfully');
  } catch (error) {
    console.error('Error during footprint calculation test:', error.message);
  }
}

testFootprintCalculation(); 