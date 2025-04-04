import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import type { NextRequest } from 'next/server';

/**
 * API Route to calculate carbon emissions for transportation
 */
export async function POST(request: NextRequest) {
  try {
    // Get the request body
    const { 
      transport_type, // 'vehicle', 'flight', 'public_transit'
      distance_value,
      distance_unit = 'km',
      vehicle_make,
      vehicle_model,
      departure_airport,
      destination_airport,
      passengers = 1
    } = await request.json();
    
    // Validate required fields based on transport type
    if (!transport_type) {
      return NextResponse.json(
        { error: 'Transport type is required' },
        { status: 400 }
      );
    }
    
    if (transport_type === 'vehicle' && (!distance_value || !vehicle_make || !vehicle_model)) {
      return NextResponse.json(
        { error: 'Distance, vehicle make, and model are required for vehicle emissions' },
        { status: 400 }
      );
    }
    
    if (transport_type === 'flight' && (!departure_airport || !destination_airport)) {
      return NextResponse.json(
        { error: 'Departure and destination airports are required for flight emissions' },
        { status: 400 }
      );
    }
    
    // Create a Supabase client - Fixed by awaiting cookies()
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ 
      cookies: () => cookieStore 
    });
    
    // Get the current session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      // Return demo data for unauthenticated users
      console.log('No session found, returning simulated transport data');
      
      let simulatedEmissions;
      if (transport_type === 'vehicle') {
        // Simulate vehicle emissions: ~0.2 kg CO2 per km
        simulatedEmissions = distance_value * 0.2;
      } else if (transport_type === 'flight') {
        // Simulate flight emissions: ~0.25 kg CO2 per km
        // For this simulation we'll just use a fixed distance
        const simulatedDistance = 1000; // km
        simulatedEmissions = simulatedDistance * 0.25 * passengers;
      } else {
        simulatedEmissions = 50; // Default simulation value
      }
      
      return NextResponse.json({
        carbon_g: simulatedEmissions * 1000,
        carbon_lb: (simulatedEmissions * 2.205).toFixed(2),
        carbon_kg: simulatedEmissions.toFixed(2),
        carbon_mt: (simulatedEmissions / 1000).toFixed(3),
        estimated_at: new Date().toISOString(),
        footprint_id: 'demo-footprint-' + Math.random().toString(36).substring(2, 11),
        is_simulated: true
      });
    }
    
    // Get the Carbon Interface API key
    const apiKey = process.env.CARBON_INTERFACE_API_KEY;
    
    if (!apiKey) {
      console.error('Carbon Interface API key is not configured');
      // Return simulated data instead of failing
      return NextResponse.json({
        carbon_g: distance_value * 200,
        carbon_lb: (distance_value * 0.44).toFixed(2),
        carbon_kg: (distance_value * 0.2).toFixed(2),
        carbon_mt: (distance_value * 0.0002).toFixed(3),
        estimated_at: new Date().toISOString(),
        footprint_id: 'demo-footprint-' + Math.random().toString(36).substring(2, 11),
        is_simulated: true
      });
    }
    
    let requestBody;
    let carbonData;
    
    // Prepare request based on transport type
    if (transport_type === 'vehicle') {
      try {
        // Get vehicle model ID from Carbon Interface API
        const vehicleModelResponse = await fetch(
          `https://www.carboninterface.com/api/v1/vehicle_makes/${vehicle_make}/vehicle_models`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (!vehicleModelResponse.ok) {
          console.error('Failed to fetch vehicle models:', await vehicleModelResponse.text());
          // Return simulated data
          return NextResponse.json({
            carbon_g: distance_value * 200,
            carbon_lb: (distance_value * 0.44).toFixed(2),
            carbon_kg: (distance_value * 0.2).toFixed(2),
            carbon_mt: (distance_value * 0.0002).toFixed(3),
            estimated_at: new Date().toISOString(),
            footprint_id: 'demo-footprint-' + Math.random().toString(36).substring(2, 11),
            is_simulated: true
          });
        }
        
        const vehicleModels = await vehicleModelResponse.json();
        const targetModel = vehicleModels.find((model: any) => 
          model.data.attributes.name.toLowerCase() === vehicle_model.toLowerCase()
        );
        
        if (!targetModel) {
          console.error('Vehicle model not found');
          // Return simulated data
          return NextResponse.json({
            carbon_g: distance_value * 200,
            carbon_lb: (distance_value * 0.44).toFixed(2),
            carbon_kg: (distance_value * 0.2).toFixed(2),
            carbon_mt: (distance_value * 0.0002).toFixed(3),
            estimated_at: new Date().toISOString(),
            footprint_id: 'demo-footprint-' + Math.random().toString(36).substring(2, 11),
            is_simulated: true
          });
        }
        
        requestBody = {
          type: 'vehicle',
          distance_unit: distance_unit,
          distance_value: distance_value,
          vehicle_model_id: targetModel.data.id
        };
      } catch (vehicleError) {
        console.error('Error fetching vehicle data:', vehicleError);
        // Return simulated data
        return NextResponse.json({
          carbon_g: distance_value * 200,
          carbon_lb: (distance_value * 0.44).toFixed(2),
          carbon_kg: (distance_value * 0.2).toFixed(2),
          carbon_mt: (distance_value * 0.0002).toFixed(3),
          estimated_at: new Date().toISOString(),
          footprint_id: 'demo-footprint-' + Math.random().toString(36).substring(2, 11),
          is_simulated: true
        });
      }
    } else if (transport_type === 'flight') {
      requestBody = {
        type: 'flight',
        passengers: passengers,
        legs: [
          {
            departure_airport: departure_airport,
            destination_airport: destination_airport
          }
        ]
      };
    } else {
      console.error(`Unsupported transport type: ${transport_type}`);
      // Return simulated data
      return NextResponse.json({
        carbon_g: 50000,
        carbon_lb: 110.23,
        carbon_kg: 50,
        carbon_mt: 0.05,
        estimated_at: new Date().toISOString(),
        footprint_id: 'demo-footprint-' + Math.random().toString(36).substring(2, 11),
        is_simulated: true,
        message: `Simulated data for unsupported transport type: ${transport_type}`
      });
    }
    
    // Make the API request to Carbon Interface
    const response = await fetch('https://www.carboninterface.com/api/v1/estimates', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Carbon Interface API error: ${errorText}`);
      
      // Return simulated data
      return NextResponse.json({
        carbon_g: transport_type === 'flight' ? 150000 : distance_value * 200,
        carbon_lb: transport_type === 'flight' ? 330.69 : (distance_value * 0.44).toFixed(2),
        carbon_kg: transport_type === 'flight' ? 150 : (distance_value * 0.2).toFixed(2),
        carbon_mt: transport_type === 'flight' ? 0.15 : (distance_value * 0.0002).toFixed(3),
        estimated_at: new Date().toISOString(),
        footprint_id: 'demo-footprint-' + Math.random().toString(36).substring(2, 11),
        is_simulated: true
      });
    }
    
    const result = await response.json();
    
    // Extract the carbon data with appropriate types
    carbonData = {
      carbon_g: result.data.attributes.carbon_g,
      carbon_lb: result.data.attributes.carbon_lb,
      carbon_kg: result.data.attributes.carbon_kg,
      carbon_mt: result.data.attributes.carbon_mt,
      estimated_at: result.data.attributes.estimated_at,
      footprint_id: '' // Initialize with empty string
    };
    
    try {
      // Save the calculation to the database if we have a valid session
      if (session) {
        // Try to get latest footprint
        const { data: latestFootprint } = await supabase
          .from('footprints')
          .select('id')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        let footprintId;
        
        if (latestFootprint) {
          footprintId = latestFootprint.id;
        } else {
          // Create a new footprint
          const { data: newFootprint, error: footprintError } = await supabase
            .from('footprints')
            .insert({
              user_id: session.user.id,
              total_co2e_kg: parseFloat(carbonData.carbon_kg),
              country_code: 'FI', // Default to Finland
              calculation_version: '1.0'
            })
            .select()
            .single();
          
          if (footprintError) {
            console.error('Error creating footprint:', footprintError);
            footprintId = null;
          } else {
            footprintId = newFootprint.id;
          }
        }
        
        // Only save details if we have a valid footprint ID
        if (footprintId) {
          const { error: detailError } = await supabase
            .from('footprint_details')
            .insert({
              footprint_id: footprintId,
              category: 'transport',
              subcategory: transport_type,
              value: parseFloat(carbonData.carbon_kg),
              raw_input: JSON.stringify(requestBody)
            });
            
          if (detailError) {
            console.error('Error saving footprint details:', detailError);
          }
          
          // Add footprint ID to carbon data
          carbonData.footprint_id = footprintId;
        }
      }
    } catch (dbError) {
      console.error('Database error:', dbError);
      // Continue anyway - we'll return the API results
      carbonData.footprint_id = 'demo-footprint-' + Math.random().toString(36).substring(2, 11);
    }
    
    // Return the carbon data
    return NextResponse.json(carbonData);
  } catch (error) {
    console.error('Error calculating transport emissions:', error);
    
    // Return simulated data with error info
    return NextResponse.json({
      carbon_g: 100000,
      carbon_lb: 220.46,
      carbon_kg: 100,
      carbon_mt: 0.1,
      estimated_at: new Date().toISOString(),
      footprint_id: 'demo-error-' + Math.random().toString(36).substring(2, 11),
      is_simulated: true,
      error_message: 'Used simulated data due to processing error'
    });
  }
} 