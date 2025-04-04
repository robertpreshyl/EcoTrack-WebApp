// This service links device energy usage with the Carbon Interface API
// to provide more accurate carbon emission estimates

import { DeviceEmission } from '@/lib/types/device-types';

/**
 * Calculates CO2 emissions for a device's energy consumption using Carbon Interface API
 * @param energy_kwh The energy usage in kWh
 * @param country Country code (default: 'fi' for Finland)
 * @returns The CO2 emissions in kg
 */
export async function calculateDeviceCarbonEmissions(
  energy_kwh: number,
  country: string = 'fi'
): Promise<number> {
  const apiKey = process.env.CARBON_INTERFACE_API_KEY;
  
  if (!apiKey) {
    console.warn('Carbon Interface API key not found, using fallback calculations');
    return calculateFallbackEmissions(energy_kwh);
  }
  
  try {
    console.log(`Calculating emissions for ${energy_kwh} kWh in ${country}`);
    
    const response = await fetch('https://www.carboninterface.com/api/v1/estimates', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'electricity',
        electricity_unit: 'kwh',
        electricity_value: energy_kwh,
        country: country.toLowerCase()
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API error (${response.status}): ${errorText}`);
      return calculateFallbackEmissions(energy_kwh);
    }
    
    const result = await response.json();
    const carbonKg = result.data.attributes.carbon_kg;
    console.log(`API returned ${carbonKg} kg CO2 for ${energy_kwh} kWh`);
    
    return carbonKg;
  } catch (error) {
    console.error('Error calculating carbon emissions:', error);
    return calculateFallbackEmissions(energy_kwh);
  }
}

/**
 * Fallback calculation when API is not available
 * @param energy_kwh The energy usage in kWh
 * @returns Estimated CO2 emissions in kg
 */
function calculateFallbackEmissions(energy_kwh: number): number {
  // Finland's electricity emissions factor (approximately 0.067 kg CO2/kWh)
  const emissionFactor = 0.067;
  return energy_kwh * emissionFactor;
}

/**
 * Updates a device's CO2 emissions based on its energy consumption
 * @param device The device to update
 * @returns The updated device with recalculated CO2 emissions
 */
export async function updateDeviceCarbonEmissions(
  device: DeviceEmission
): Promise<DeviceEmission> {
  try {
    // If the device has energy consumption data
    if (device.energy_kwh > 0) {
      // Calculate emissions using the API
      const co2_kg = await calculateDeviceCarbonEmissions(device.energy_kwh);
      
      // Return updated device
      return {
        ...device,
        co2_kg
      };
    }
    
    // If no energy data, return the device unchanged
    return device;
  } catch (error) {
    console.error(`Error updating emissions for device ${device.id}:`, error);
    return device;
  }
}

/**
 * Batch updates emissions for multiple devices
 * @param devices Array of devices to update
 * @returns Updated devices with recalculated emissions
 */
export async function batchUpdateDeviceEmissions(
  devices: DeviceEmission[]
): Promise<DeviceEmission[]> {
  if (!devices || devices.length === 0) {
    return [];
  }
  
  try {
    // Process devices in parallel with Promise.all
    const updatedDevices = await Promise.all(
      devices.map(device => updateDeviceCarbonEmissions(device))
    );
    
    return updatedDevices;
  } catch (error) {
    console.error('Error in batch update of device emissions:', error);
    // Return original devices if update fails
    return devices;
  }
} 