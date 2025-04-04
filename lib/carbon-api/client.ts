// This client interacts with the Carbon Interface API
// Documentation: https://docs.carboninterface.com/

type EstimateData = {
  type: string;
  // Additional properties based on the specific estimate type
  [key: string]: any;
};

export async function calculateFootprint(data: EstimateData): Promise<any> {
  const apiKey = process.env.CARBON_INTERFACE_API_KEY;
  
  if (!apiKey) {
    throw new Error('Carbon Interface API key not found');
  }
  
  try {
    const response = await fetch('https://www.carboninterface.com/api/v1/estimates', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        data
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error (${response.status}): ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error calculating footprint:', error);
    throw error;
  }
}

// Helper function to calculate electricity footprint
export async function calculateElectricityFootprint(
  country: string,
  kwh: number
): Promise<any> {
  return calculateFootprint({
    type: 'electricity',
    electricity_unit: 'kwh',
    electricity_value: kwh,
    country
  });
}

// Helper function to calculate transportation footprint
export async function calculateTransportationFootprint(
  distance_value: number,
  vehicle_model_id: string
): Promise<any> {
  return calculateFootprint({
    type: 'vehicle',
    distance_unit: 'km',
    distance_value,
    vehicle_model_id
  });
}

// Helper function to calculate flight footprint
export async function calculateFlightFootprint(
  departure_airport: string,
  destination_airport: string,
  passengers: number = 1
): Promise<any> {
  return calculateFootprint({
    type: 'flight',
    passengers,
    legs: [
      {
        departure_airport,
        destination_airport
      }
    ]
  });
} 