require('dotenv').config({ path: '.env.local' });

// Direct API test without module imports
async function testCarbonAPI() {
  console.log('Testing Carbon Interface API directly...');
  const apiKey = process.env.CARBON_INTERFACE_API_KEY;
  console.log('API Key:', apiKey ? 'Found (length: ' + apiKey.length + ')' : 'Missing');
  
  if (!apiKey) {
    console.error('Carbon Interface API key not found in .env.local file');
    return;
  }
  
  try {
    // First, check available vehicle makes
    console.log('\nFetching available vehicle makes...');
    const makesResponse = await fetch('https://www.carboninterface.com/api/v1/vehicle_makes', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!makesResponse.ok) {
      const errorText = await makesResponse.text();
      throw new Error(`API error (${makesResponse.status}): ${errorText}`);
    }
    
    const makesResult = await makesResponse.json();
    console.log(`Found ${makesResult.length} vehicle makes`);
    
    // Test electricity calculation
    console.log('\nTesting electricity footprint calculation...');
    const electricityResponse = await fetch('https://www.carboninterface.com/api/v1/estimates', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'electricity',
        electricity_unit: 'kwh',
        electricity_value: 300,
        country: 'fi'
      })
    });
    
    if (!electricityResponse.ok) {
      const errorText = await electricityResponse.text();
      throw new Error(`API error (${electricityResponse.status}): ${errorText}`);
    }
    
    const electricityResult = await electricityResponse.json();
    console.log('Electricity result:', JSON.stringify(electricityResult, null, 2));
    
    // Test flight calculation
    console.log('\nTesting flight footprint calculation...');
    const flightResponse = await fetch('https://www.carboninterface.com/api/v1/estimates', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'flight',
        passengers: 1,
        legs: [
          {
            departure_airport: 'HEL',
            destination_airport: 'CDG'
          }
        ]
      })
    });
    
    if (!flightResponse.ok) {
      const errorText = await flightResponse.text();
      throw new Error(`API error (${flightResponse.status}): ${errorText}`);
    }
    
    const flightResult = await flightResponse.json();
    console.log('Flight result:', JSON.stringify(flightResult, null, 2));
    
    console.log('\nAPI tests completed successfully!');
  } catch (error) {
    console.error('Error during API test:', error.message);
  }
}

testCarbonAPI(); 