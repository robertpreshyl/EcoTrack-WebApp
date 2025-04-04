"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { Line, Doughnut } from 'react-chartjs-2';
import DeviceCard from './DeviceCard';
import DeviceStatsCard from './DeviceStatsCard';
import RoomSelector from './RoomSelector';
import Calculator from './Calculator';
import ErrorMessage from './ErrorMessage';
import ErrorBoundary from './ErrorBoundary';
import { logError } from '@/lib/utils/error-handler';
import { AirconditionerIcon, TelevisionIcon, RefrigeratorIcon, MicrowaveIcon, OvenIcon } from '@/public/images/icons';
import AddDeviceModal from './AddDeviceModal';
import TipsCarousel from './TipsCarousel';
import UserProfile from './UserProfile';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';
import { DeviceEmission } from '@/lib/types/device-types';
import { batchUpdateDeviceEmissions } from '@/lib/services/device-carbon-service';

interface FootprintDetail {
  category: 'transport' | 'energy' | 'diet';
  subcategory: string;
  value: number;
  raw_input?: any;
}

interface FootprintRecord {
  id: string;
  created_at: string;
  total_co2e_kg: number;
  country_code: string;
  footprint_details?: FootprintDetail[];
}

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

interface Room {
  id: string;
  name: string;
  icon: string;
  selected: boolean;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  progress?: number;
}

export default function DashboardRedesign({ user, onLogout }: DashboardProps) {
  // State for UI
  const [activeTab, setActiveTab] = useState('stats');
  const [isLoading, setIsLoading] = useState(true);
  const [showCalculator, setShowCalculator] = useState(false);
  const [footprints, setFootprints] = useState<FootprintRecord[]>([]);
  const [devices, setDevices] = useState<DeviceEmission[]>([]);
  const [deviceError, setDeviceError] = useState<Error | null>(null);
  const [footprintError, setFootprintError] = useState<Error | null>(null);
  const [activeRoom, setActiveRoom] = useState<string>("All Rooms");
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });
  
  // State for charts and statistics
  const [emissionStats, setEmissionStats] = useState({
    current: 0,
    average: 0,
    total: 0
  });
  const [breakdownData, setBreakdownData] = useState<any>(null);
  const [historyData, setHistoryData] = useState<any>(null);
  
  // Function to fetch recent summary data
  const fetchRecentSummary = async () => {
    // For now, this is a placeholder function
    // It would typically fetch additional summary data for the dashboard
    console.log("Fetching recent summary data");
  };
  
  // State for data
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([
    { id: 'living-room', name: 'Living Room', icon: '🏠', selected: false },
    { id: 'kitchen', name: 'Kitchen', icon: '🍳', selected: false },
    { id: 'bedroom', name: 'Bedroom', icon: '🛏️', selected: false },
    { id: 'bathroom', name: 'Bathroom', icon: '🚿', selected: false },
    { id: 'demo-room', name: 'Demo Room', icon: '🔍', selected: false },
  ]);
  
  // New state for achievements
  const [achievements, setAchievements] = useState<Achievement[]>([
    { 
      id: 'first-step', 
      name: 'First Step', 
      description: 'Calculate your first footprint',
      icon: '🌱',
      earned: false
    },
    { 
      id: 'regular-tracker', 
      name: 'Regular Tracker', 
      description: '5+ calculations',
      icon: '🌿',
      earned: false,
      progress: 0
    },
    { 
      id: 'low-impact', 
      name: 'Low Impact', 
      description: 'Below 600kg CO₂e',
      icon: '🏆',
      earned: false
    },
    { 
      id: 'top-performer', 
      name: 'Top Performer', 
      description: 'Top 3 on leaderboard',
      icon: '🥇',
      earned: false
    },
  ]);
  
  // State for tips
  const [tips] = useState([
    'Switch to renewable energy sources',
    'Reduce meat consumption',
    'Use public transportation more often',
    'Optimize your home insulation',
    'Consider carbon offset programs'
  ]);

  // Add state for the Add Device modal
  const [showAddDeviceModal, setShowAddDeviceModal] = useState(false);

  // Add state for device context menu
  const [showDeviceMenu, setShowDeviceMenu] = useState(false);
  const [activeDeviceId, setActiveDeviceId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // IMPORTANT: All useEffect hooks must be called unconditionally
  // Use this useEffect for data fetching, before any conditional returns
  useEffect(() => {
    // Load data when component mounts
    const loadData = async () => {
      try {
        setIsLoading(true);
        await fetchDevices();
        await fetchFootprints();
      } catch (error) {
        console.error("Error loading initial data:", error);
      } finally {
        // Ensure loading state is always set to false
        setIsLoading(false);
      }
    };

    loadData();

    // Failsafe timeout to exit loading state
    const timer = setTimeout(() => {
      if (isLoading) {
        console.log("Forcing exit of loading state after timeout");
        setIsLoading(false);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [user.id]); // Added fetchDevices to ensure it's called on mount

  // Component mount effect
  useEffect(() => {
    // Fetch devices and footprints
    fetchDevices();
    fetchFootprints();
    
    // Fetch other data in the background
    fetchRecentSummary();
  }, [user.id]);

  // Fetch footprints
  const fetchFootprints = async () => {
    setFootprintError(null);
    try {
      const { data, error } = await supabase
        .from('footprints')
        .select(`
          id,
          created_at,
          total_co2e_kg,
          country_code,
          footprint_details (
            category,
            subcategory,
            value,
            raw_input
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      } else if (data && data.length > 0) {
        console.log("Loaded footprints from Supabase:", data.length);
        setFootprints(data);
        
        // Process footprint data for charts
        processFootprintData(data);
        
        // Update achievements based on footprints
        let updatedAchievements = [...achievements];
        
        // First Step achievement
        updatedAchievements = updatedAchievements.map(a => 
          a.id === 'first-step' ? {...a, earned: true} : a
        );
        
        // Regular Tracker achievement
        const calculations = data.length;
        updatedAchievements = updatedAchievements.map(a => 
          a.id === 'regular-tracker' ? {
            ...a, 
            progress: Math.min(calculations, 5),
            earned: calculations >= 5
          } : a
        );
        
        // Low Impact achievement
        const hasLowImpact = data.some(f => f.total_co2e_kg < 600);
        updatedAchievements = updatedAchievements.map(a => 
          a.id === 'low-impact' ? {...a, earned: hasLowImpact} : a
        );
        
        setAchievements(updatedAchievements);
      } else {
        console.log("No footprints found in database, initializing sample data");
        await initializeSampleFootprint();
        // Fetch again after initialization
        fetchFootprints();
      }
    } catch (err) {
      const appError = logError(err, 'DashboardRedesign', 'fetchFootprints', { userId: user.id });
      setFootprintError(appError);
    }
  };
  
  // Process footprint data for charts and statistics
  const processFootprintData = (data: FootprintRecord[]) => {
    if (!data || data.length === 0) return;
    
    try {
      // Calculate total emissions and average
      const totalEmissions = data.reduce((sum, record) => sum + record.total_co2e_kg, 0);
      const averageEmission = totalEmissions / data.length;
      
      // Update emission statistics
      setEmissionStats({
        current: data[0].total_co2e_kg,
        average: averageEmission,
        total: totalEmissions
      });
      
      // Generate data for charts
      // Process category breakdown for the most recent footprint
      const latestFootprint = data[0];
      if (latestFootprint.footprint_details && latestFootprint.footprint_details.length > 0) {
        // Group by category
        const categoryTotals: Record<string, number> = {};
        latestFootprint.footprint_details.forEach(detail => {
          if (!categoryTotals[detail.category]) {
            categoryTotals[detail.category] = 0;
          }
          categoryTotals[detail.category] += detail.value;
        });
        
        // Update chart data
        const chartLabels = Object.keys(categoryTotals).map(cat => 
          cat.charAt(0).toUpperCase() + cat.slice(1)
        );
        const chartValues = Object.values(categoryTotals);
        
        // Make sure we have entries in the order: Transport, Energy, Diet
        const standardCategories = ['transport', 'energy', 'diet'];
        const sortedLabels: string[] = [];
        const sortedValues: number[] = [];
        
        standardCategories.forEach(cat => {
          const index = chartLabels.findIndex(
            label => label.toLowerCase() === cat
          );
          
          if (index >= 0) {
            sortedLabels.push(chartLabels[index]);
            sortedValues.push(chartValues[index]);
          } else {
            // If category doesn't exist, add it with zero value
            sortedLabels.push(cat.charAt(0).toUpperCase() + cat.slice(1));
            sortedValues.push(0);
          }
        });
        
        // Set the breakdown chart data
        setBreakdownData({
          labels: sortedLabels,
          datasets: [
            {
              data: sortedValues,
              backgroundColor: [
                'rgba(54, 162, 235, 0.8)',
                'rgba(255, 99, 132, 0.8)',
                'rgba(75, 192, 192, 0.8)',
              ],
              borderWidth: 1,
            },
          ],
        });
      }
      
      // If we have multiple entries, create history chart
      if (data.length > 1) {
        // Take up to 10 most recent entries and reverse for chronological order
        const recentEntries = data.slice(0, 10).reverse();
        
        setHistoryData({
          labels: recentEntries.map(entry => {
            // Format the date
            const date = new Date(entry.created_at);
            return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
          }),
          datasets: [
            {
              label: 'CO₂e (kg)',
              data: recentEntries.map(entry => entry.total_co2e_kg),
              borderColor: 'rgba(75, 192, 192, 1)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              tension: 0.3,
              fill: true,
            },
          ],
        });
      }
      
    } catch (error) {
      console.error("Error processing footprint data:", error);
    }
  };

  // Handle Calculator Complete
  const handleCalculationComplete = () => {
    setShowCalculator(false);
    // Refresh footprints data after calculation
    fetchFootprints();
  };
  
  // Fetch devices
  const fetchDevices = async () => {
    setDeviceError(null);
    try {
      // Create a fresh Supabase client for data fetching
      const supabase = createBrowserSupabaseClient();
      
      // Fetch real devices from Supabase
      const { data, error } = await supabase
        .from('devices')
        .select('*')
        .eq('user_id', user.id);
        
      if (error) {
        throw error;
      } 
      
      // Get simulated devices to use as fallback
      const simulatedDevices = getSimulatedDevices();
      
      // Check if we have real devices from Supabase
      if (data && data.length > 0) {
        console.log("Loaded devices from Supabase:", data.length);
        // Map the Supabase data to our DeviceEmission interface
        const mappedDevices: DeviceEmission[] = data.map(device => ({
          id: device.id,
          name: device.name,
          brand: device.brand,
          category: device.category,
          subcategory: device.subcategory,
          energy_kwh: device.energy_kwh,
          co2_kg: device.co2_kg,
          usage_time: device.usage_time,
          cost_estimate: device.cost_estimate,
          isOn: device.is_on,
          image: device.image_path,
          room: device.room
        }));
        
        // Always include demo room with simulated devices for consistency
        const modifiedSimulatedDevices = simulatedDevices.map(device => ({
          ...device,
          room: 'Demo Room', // Put simulated devices in a separate demo room
          id: `sim-${device.id}` // Add prefix to avoid ID collision
        }));
        
        // Combine both sets of devices, with real devices appearing first
        setDevices([...mappedDevices, ...modifiedSimulatedDevices]);
      } else {
        // If no devices found, initialize the user with default devices
        console.log("No devices found in Supabase, initializing with default devices");
        await initializeUserDevices(simulatedDevices);
      }
    } catch (error) {
      console.error("Error fetching devices:", error);
      setDeviceError(error instanceof Error ? error : new Error('Failed to fetch devices'));
      // Use simulated devices as fallback
      setDevices(getSimulatedDevices());
    }
  };

  // Initialize new user with default devices and sample footprint
  const initializeUserDevices = async (simulatedDevices: DeviceEmission[]) => {
    try {
      const supabase = createBrowserSupabaseClient();
      
      // Filter out a subset of devices to save as real devices (not all)
      const defaultDevices = simulatedDevices
        .filter((_, index) => index < 3) // Take first 3 devices
        .map(device => ({
          user_id: user.id,
          name: device.name,
          brand: device.brand || 'Generic',
          category: device.category,
          subcategory: device.subcategory,
          energy_kwh: device.energy_kwh,
          co2_kg: device.co2_kg,
          usage_time: device.usage_time,
          cost_estimate: device.cost_estimate,
          is_on: device.isOn,
          image_path: device.image,
          room: 'Living Room' // Default room for initial devices
        }));
      
      // Insert the default devices
      const { data, error } = await supabase
        .from('devices')
        .insert(defaultDevices)
        .select();
      
      if (error) {
        throw error;
      }
      
      // Map inserted devices to our interface
      const insertedDevices: DeviceEmission[] = data?.map(device => ({
        id: device.id,
        name: device.name,
        brand: device.brand,
        category: device.category,
        subcategory: device.subcategory,
        energy_kwh: device.energy_kwh,
        co2_kg: device.co2_kg,
        usage_time: device.usage_time,
        cost_estimate: device.cost_estimate,
        isOn: device.is_on,
        image: device.image_path,
        room: device.room
      })) || [];
      
      // Create demo devices in a separate room
      const demoDevices = simulatedDevices.map(device => ({
        ...device,
        room: 'Demo Room',
        id: `sim-${device.id}`
      }));
      
      // Initialize sample footprint data for new users
      await initializeSampleFootprint();
      
      // Set devices in state with both real and demo
      setDevices([...insertedDevices, ...demoDevices]);
      
    } catch (error) {
      console.error("Error initializing user devices:", error);
      // Fallback to simulated devices only
      setDevices(getSimulatedDevices());
    }
  };
  
  // Initialize sample footprint for new users
  const initializeSampleFootprint = async () => {
    try {
      const supabase = createBrowserSupabaseClient();
      
      // Check if user already has footprints
      const { data: existingFootprints, error: checkError } = await supabase
        .from('footprints')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);
      
      if (checkError) {
        throw checkError;
      }
      
      // Only create sample footprint if user has none
      if (!existingFootprints || existingFootprints.length === 0) {
        // Create a sample footprint
        const { data: footprint, error: footprintError } = await supabase
          .from('footprints')
          .insert({
            user_id: user.id,
            total_co2e_kg: 325.5,
            country_code: 'FI',
            calculation_version: '1.0'
          })
          .select()
          .single();
        
        if (footprintError) {
          throw footprintError;
        }
        
        // Add footprint details
        const { error: detailsError } = await supabase
          .from('footprint_details')
          .insert([
            {
              footprint_id: footprint.id,
              category: 'energy',
              subcategory: 'electricity',
              value: 150.2,
              raw_input: JSON.stringify({ electricity_value: 300, electricity_unit: 'kwh' })
            },
            {
              footprint_id: footprint.id,
              category: 'transport',
              subcategory: 'vehicle',
              value: 125.3,
              raw_input: JSON.stringify({ distance_value: 500, distance_unit: 'km' })
            },
            {
              footprint_id: footprint.id,
              category: 'diet',
              subcategory: 'omnivore',
              value: 50.0,
              raw_input: JSON.stringify({ diet_type: 'omnivore' })
            }
          ]);
        
        if (detailsError) {
          throw detailsError;
        }
        
        // Initialize achievements for new user
        const { error: achievementsError } = await supabase
          .from('user_achievements')
          .insert({
            user_id: user.id,
            achievement_id: 'first-step',
            earned_at: new Date().toISOString()
          });
          
        if (achievementsError) {
          console.error("Error initializing achievements:", achievementsError);
        }
      }
    } catch (error) {
      console.error("Error initializing sample footprint:", error);
    }
  };

  // Add a helper function to get simulated devices to avoid code duplication
  const getSimulatedDevices = (): DeviceEmission[] => {
    return [
      {
        id: '1',
        name: 'Air Conditioner',
        brand: 'LG',
        category: 'energy',
        subcategory: 'cooling',
        energy_kwh: 50,
        co2_kg: 20,
        usage_time: 720,
        cost_estimate: 12.50,
        isOn: true,
        image: '/images/devices/air_conditioner.svg',
        room: 'living-room'
      },
      {
        id: '2',
        name: 'Television',
        brand: 'Samsung',
        category: 'energy',
        subcategory: 'entertainment',
        energy_kwh: 8,
        co2_kg: 3.2,
        usage_time: 120,
        cost_estimate: 2.00,
        isOn: false,
        image: '/images/devices/television.svg',
        room: 'living-room'
      },
      {
        id: '3',
        name: 'Refrigerator',
        brand: 'Samsung',
        category: 'energy',
        subcategory: 'appliance',
        energy_kwh: 30,
        co2_kg: 12,
        usage_time: 720,
        cost_estimate: 9.00,
        isOn: true,
        image: '/images/devices/refrigerator.svg',
        room: 'kitchen'
      },
      {
        id: '4',
        name: 'Microwave',
        brand: 'AEG',
        category: 'energy',
        subcategory: 'cooking',
        energy_kwh: 12,
        co2_kg: 4.8,
        usage_time: 15,
        cost_estimate: 3.00,
        isOn: false,
        image: '/images/devices/microwave.svg',
        room: 'kitchen'
      },
      {
        id: '5',
        name: 'Oven',
        brand: 'AEG',
        category: 'energy',
        subcategory: 'cooking',
        energy_kwh: 45,
        co2_kg: 18,
        usage_time: 30,
        cost_estimate: 11.50,
        isOn: true,
        image: '/images/devices/oven.svg',
        room: 'kitchen'
      },
      {
        id: '6',
        name: 'Speaker',
        brand: 'Sonos',
        category: 'energy',
        subcategory: 'entertainment',
        energy_kwh: 8,
        co2_kg: 3.2,
        usage_time: 120,
        cost_estimate: 2.00,
        isOn: true,
        image: '/images/devices/speaker.svg',
        room: 'living-room'
      },
      {
        id: '7',
        name: 'Speaker',
        brand: 'Sonos',
        category: 'energy',
        subcategory: 'entertainment',
        energy_kwh: 8,
        co2_kg: 3.2,
        usage_time: 120,
        cost_estimate: 2.00,
        isOn: false,
        image: '/images/devices/speaker.svg',
        room: 'living-room'
      },
      {
        id: '8',
        name: 'Baking Oven',
        brand: 'AEG',
        category: 'energy',
        subcategory: 'cooking',
        energy_kwh: 45,
        co2_kg: 18,
        usage_time: 30,
        cost_estimate: 11.50,
        isOn: true,
        image: '/images/devices/baking_oven.svg',
        room: 'kitchen'
      },
      {
        id: '9',
        name: 'Mixer',
        brand: 'Samsung',
        category: 'energy',
        subcategory: 'appliance',
        energy_kwh: 3,
        co2_kg: 1.2,
        usage_time: 10,
        cost_estimate: 0.80,
        isOn: false,
        image: '/images/devices/mixer.svg',
        room: 'kitchen'
      },
      {
        id: '10',
        name: 'Coffee Maker',
        brand: 'Samsung',
        category: 'energy',
        subcategory: 'appliance',
        energy_kwh: 3,
        co2_kg: 1.2,
        usage_time: 10,
        cost_estimate: 0.80,
        isOn: false,
        image: '/images/devices/coffee_maker.svg',
        room: 'kitchen'
      },
      {
        id: '11',
        name: 'Electric Toothbrush',
        brand: 'Philips',
        category: 'energy',
        subcategory: 'appliance',
        energy_kwh: 0.2,
        co2_kg: 0.1,
        usage_time: 10,
        cost_estimate: 0.08,
        isOn: false,
        image: '/images/devices/electric_toothbrush.svg',
        room: 'bathroom'
      }
    ];
  };

  // Toggle room selection
  const handleRoomSelect = (roomId: string) => {
    if (selectedRooms.includes(roomId)) {
      setSelectedRooms(selectedRooms.filter(r => r !== roomId));
    } else {
      setSelectedRooms([...selectedRooms, roomId]);
    }
  };

  // Toggle device on/off status
  const toggleDeviceStatus = async (deviceId: string, newStatus: boolean) => {
    try {
      // Create a fresh Supabase client for data updating
      const supabase = createBrowserSupabaseClient();
      
      // Update the device status in Supabase
      const { error } = await supabase
        .from('devices')
        .update({ 
          is_on: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', deviceId);
        
      if (error) {
        console.error("Supabase error updating device status:", error);
        throw new Error(`Failed to update device status: ${error.message}`);
      }
      
      // Update local state to reflect the change only if Supabase update succeeded
      setDevices(prevDevices => 
        prevDevices.map(device => 
          device.id === deviceId ? { ...device, isOn: newStatus } : device
        )
      );
      
      // Clear any previous errors
      setDeviceError(null);
      
      return true;
    } catch (err) {
      // Log the error with detailed context
      const appError = logError(
        err, 
        'DashboardRedesign', 
        'toggleDeviceStatus', 
        { deviceId, newStatus, userId: user.id }
      );
      
      // Set the error for UI display
      setDeviceError(appError);
      
      // Auto-clear error after 5 seconds
      setTimeout(() => {
        setDeviceError(null);
      }, 5000);
      
      // Rethrow so the DeviceCard can handle UI reversal
      throw appError;
    }
  };

  // Handle device menu
  const handleShowDeviceMenu = async (deviceId: string) => {
    setActiveDeviceId(deviceId);
    setShowDeviceMenu(true);
  };

  // Delete device
  const deleteDevice = async (deviceId: string) => {
    try {
      setIsDeleting(true);
      // Create a fresh Supabase client for data deletion
      const supabase = createBrowserSupabaseClient();
      
      // Delete the device from Supabase if it's a real device (not a simulated one)
      if (!deviceId.startsWith('sim-')) {
        const { error } = await supabase
          .from('devices')
          .delete()
          .eq('id', deviceId);
          
        if (error) {
          console.error("Supabase error deleting device:", error);
          throw new Error(`Failed to delete device: ${error.message}`);
        }
      }
      
      // Update local state to remove the device
      setDevices(prevDevices => prevDevices.filter(device => device.id !== deviceId));
      
      // Close the menu
      setShowDeviceMenu(false);
      setActiveDeviceId(null);
      
      // Clear any previous errors
      setDeviceError(null);
      
      return true;
    } catch (err) {
      // Log the error with detailed context
      const appError = logError(
        err, 
        'DashboardRedesign', 
        'deleteDevice', 
        { deviceId, userId: user.id }
      );
      
      // Set the error for UI display
      setDeviceError(appError);
      
      // Auto-clear error after 5 seconds
      setTimeout(() => {
        setDeviceError(null);
      }, 5000);
      
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter devices by selected rooms
  const filteredDevices = selectedRooms.length > 0
    ? devices.filter(device => selectedRooms.includes(device.room))
    : devices;

  // Group devices by room
  const devicesByRoom = useMemo(() => {
    console.log("Running devicesByRoom calculation with", filteredDevices.length, "devices");
    
    // Convert room names to match our room IDs if needed
    const normalizedDevices = filteredDevices.map(device => ({
      ...device,
      // Make sure room has a value and convert to kebab-case if it's not already
      room: device.room ? 
        (device.room.includes('-') ? device.room : device.room.toLowerCase().replace(/\s+/g, '-')) 
        : 'other'
    }));
    
    // Since we're already filtering above with filteredDevices, all rooms should be shown
    const roomsToShow = [...new Set(normalizedDevices.map(device => device.room))];
    
    // Create the grouped object
    const result: Record<string, DeviceEmission[]> = {};
    
    // First ensure all rooms have an entry, even if empty
    roomsToShow.forEach(roomId => {
      result[roomId] = [];
    });
    
    // Then add devices to their rooms
    normalizedDevices.forEach(device => {
      result[device.room].push(device);
    });
    
    console.log("Final devicesByRoom result:", 
      Object.entries(result).map(([room, devices]) => `${room}: ${devices.length} devices`));
    
    return result;
  }, [filteredDevices]);

  // Calculate totals
  const totalEnergy = filteredDevices.reduce((sum, device) => sum + device.energy_kwh, 0);
  const totalCO2 = filteredDevices.reduce((sum, device) => sum + device.co2_kg, 0);
  const totalCost = filteredDevices.reduce((sum, device) => sum + device.cost_estimate, 0);

  // Get room name from ID
  const getRoomName = (roomId: string) => {
    const room = availableRooms.find(r => r.id === roomId);
    return room ? room.name : roomId;
  };
  
  // Calculate user stats
  const userStats = {
    totalCalculations: footprints.length,
    averageFootprint: footprints.length > 0 
      ? (footprints.reduce((sum, f) => sum + f.total_co2e_kg, 0) / footprints.length).toFixed(2)
      : 'N/A'
  };

  // Handle device added event
  const handleDeviceAdded = () => {
    // Refresh the devices list
    fetchDevices();
  };

  // Add this after the deviceError state
  useEffect(() => {
    console.log("Devices state updated:", devices.length, "devices found");
    
    if (devices.length > 0) {
      // Group devices by room for easier access and checking
      const grouped = groupDevicesByRoom(devices);
      console.log("Grouped devices by room:", Object.keys(grouped));
      
      // Check if any room has devices
      const hasDevicesInRooms = Object.values(grouped).some(roomDevices => roomDevices.length > 0);
      console.log("Has devices in rooms:", hasDevicesInRooms);
    }
  }, [devices]);

  // Also check the groupDevicesByRoom function
  const groupDevicesByRoom = (deviceList: DeviceEmission[]) => {
    // Debug what devices are being grouped
    console.log("Grouping devices:", deviceList.map(d => ({id: d.id, name: d.name, room: d.room})));
    
    // First identify which rooms have devices
    const roomIds = new Set(deviceList.map(device => device.room || 'other'));
    
    // Initialize an object to store devices by room
    const grouped: Record<string, DeviceEmission[]> = {};
    
    // Add each room as a key
    roomIds.forEach(roomId => {
      grouped[roomId] = deviceList.filter(device => (device.room || 'other') === roomId);
    });
    
    // Log the result for debugging
    console.log("Result of grouping:", Object.keys(grouped).map(room => `${room}: ${grouped[room].length} devices`));
    
    return grouped;
  };

  // Handle upgrade click
  const handleUpgradeClick = () => {
    // Show a modal or navigate to subscription page
    alert("Subscription feature is coming soon! This would typically redirect to a payment page.");
    // In a real app, you would redirect to a subscription page or show a modal
    // window.location.href = '/subscription';
  };

  // Add a function to update device emissions
  const updateAllDeviceEmissions = async () => {
    try {
      console.log("Updating device emissions with Carbon API...");
      const updatedDevices = await batchUpdateDeviceEmissions(devices);
      setDevices(updatedDevices);
      console.log("Device emissions updated successfully");
    } catch (error) {
      console.error("Error updating device emissions:", error);
    }
  };

  // Call this from fetchDevices after setting devices
  useEffect(() => {
    if (devices.length > 0) {
      updateAllDeviceEmissions();
    }
  }, [devices.length]);

  // Make sure the loading screen doesn't contain any hooks or components that use hooks
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }
  
  // Get the latest footprint if available
  const latestFootprint = footprints.length > 0 ? footprints[0] : null;

  return (
    <ErrorBoundary component="DashboardRedesign">
      <div className="bg-gray-50 min-h-screen pb-16">
        {/* Calculator Modal */}
        {showCalculator && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-1">
                <button 
                  onClick={() => setShowCalculator(false)}
                  className="ml-auto block p-2 text-gray-500 hover:text-gray-700"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <Calculator 
                user={user} 
                onComplete={handleCalculationComplete} 
                t={(key) => key} // Simple translation function
              />
            </div>
          </div>
        )}

        {/* Top Navigation */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="container mx-auto py-3 px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="text-2xl font-bold flex items-center text-gray-800">
                  <span className="text-green-500 mr-1">E</span>coTrack
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => setShowCalculator(true)}
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Calculate Footprint
                </button>
                <button
                  onClick={() => setShowAddDeviceModal(true)}
                  className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md shadow-sm transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add device
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto p-4 sm:p-6 lg:p-8">
          {/* Show footprint errors if any */}
          {footprintError && (
            <div className="mb-6">
              <ErrorMessage 
                error={footprintError} 
                onRetry={fetchFootprints} 
              />
            </div>
          )}

          {/* Dashboard Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Latest Footprint Card */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 -mt-8 -mr-8 bg-green-100 rounded-full"></div>
              <div className="relative">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Latest Footprint</h2>
                {latestFootprint ? (
                  <div>
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {latestFootprint.total_co2e_kg} kg CO₂e
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(latestFootprint.created_at).toLocaleDateString()}
                    </div>
                    <button 
                      onClick={() => setShowCalculator(true)}
                      className="mt-4 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition"
                    >
                      Calculate Again
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-4">
                    <p className="text-gray-500 mb-4">No footprint data yet. Calculate your first footprint!</p>
                    <button 
                      onClick={() => setShowCalculator(true)}
                      className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition"
                    >
                      Calculate Now
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Your Stats Card */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 -mt-8 -mr-8 bg-blue-100 rounded-full"></div>
              <div className="relative">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Your Stats</h2>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-500">Total Calculations</div>
                    <div className="text-2xl font-bold text-gray-900">{userStats.totalCalculations}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Average Footprint</div>
                    <div className="text-2xl font-bold text-gray-900">{userStats.averageFootprint} kg CO₂e</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Tips Card with Carousel */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Tips to Improve</h2>
              <TipsCarousel tips={tips} />
            </div>
          </div>
          
          {/* Achievements Section */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Achievements</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {achievements.map(achievement => (
                <div 
                  key={achievement.id} 
                  className={`p-4 rounded-lg border ${achievement.earned 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-gray-200 bg-gray-50 opacity-60'}`}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="text-4xl mb-2">{achievement.icon}</div>
                    <div className="font-medium text-gray-900">{achievement.name}</div>
                    <div className="text-sm text-gray-500">{achievement.description}</div>
                    
                    {achievement.progress !== undefined && (
                      <div className="w-full mt-2">
                        <div className="bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ width: `${(achievement.progress / 5) * 100}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {achievement.progress}/5
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Room Filter */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              {/* Room Selector */}
              <div className="flex-grow">
                <RoomSelector 
                  availableRooms={availableRooms}
                  selectedRooms={selectedRooms}
                  onSelectRoom={handleRoomSelect}
                />
              </div>
              
              <div className="flex items-center">
                <div className="relative">
                  <button className="bg-white px-4 py-2 rounded-md border border-gray-200 shadow-sm flex items-center justify-between min-w-[200px]">
                    <span>January - February 2025</span>
                    <svg className="h-5 w-5 text-gray-500 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {/* Date range dropdown - would be shown on click */}
                </div>
              </div>
            </div>

            {/* Selected Rooms Tags */}
            <div className="flex flex-wrap gap-2 mt-4">
              {selectedRooms.map(roomId => (
                <div key={roomId} className="bg-green-50 text-green-800 px-3 py-1 rounded-full flex items-center border border-green-100">
                  {getRoomName(roomId)}
                  <button 
                    onClick={() => handleRoomSelect(roomId)}
                    className="ml-2 text-green-600 hover:text-green-800"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Show device errors if any */}
          {deviceError && (
            <div className="mb-6">
              <ErrorMessage 
                error={deviceError} 
                onRetry={() => setDeviceError(null)} 
              />
            </div>
          )}

          {/* Totals Summary (only visible when devices are filtered) */}
          {selectedRooms.length > 0 && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Filtered Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500">Total Energy</span>
                  <span className="text-2xl font-bold text-gray-900">{totalEnergy} kWh</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500">CO₂ Emissions</span>
                  <span className="text-2xl font-bold text-gray-900">{totalCO2} kg</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500">Estimated Cost</span>
                  <span className="text-2xl font-bold text-gray-900">€{totalCost.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Devices by Room */}
          {Object.keys(devicesByRoom).length > 0 ? (
            Object.entries(devicesByRoom).map(([roomId, roomDevices]) => (
              <div key={roomId} className="mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4 pl-1">{getRoomName(roomId)} devices</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {roomDevices.map(device => (
                    <DeviceStatsCard
                      key={device.id}
                      id={device.id}
                      name={device.name}
                      brand={device.brand}
                      image={device.image}
                      energy_kwh={device.energy_kwh}
                      co2_kg={device.co2_kg}
                      usage_time={device.usage_time}
                      cost_estimate={device.cost_estimate}
                      isOn={device.isOn || false}
                      onToggle={(id, newStatus) => toggleDeviceStatus(id, newStatus)}
                      onShowMenu={handleShowDeviceMenu}
                    />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
              <svg className="h-16 w-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No devices found</h3>
              <p className="text-gray-500 mb-4">Add your first device to start tracking energy usage</p>
              <button
                onClick={() => setShowAddDeviceModal(true)}
                className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add device
              </button>
            </div>
          )}

          {/* Premium Upgrade Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
            <div className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Plus</h2>
                  <div className="flex items-center mt-1">
                    <span className="text-xl font-bold">€29</span>
                    <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-800 text-sm rounded-md">25% Discount</span>
                  </div>
                  <p className="text-gray-500 mt-2">per user/month, billed annually</p>
                </div>
                <button 
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition w-full md:w-auto"
                  onClick={handleUpgradeClick}
                >
                  Upgrade to Plus
                </button>
              </div>
              
              <div className="mt-4">
                <h3 className="font-medium text-gray-800 mb-2">Unlock features</h3>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">Saving recommendations</span>
                  </li>
                  <li className="flex items-center">
                    <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">Device comparison</span>
                  </li>
                  <li className="flex items-center">
                    <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">Mobile version</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* User Profile */}
          <UserProfile user={user} onLogout={onLogout} />

          {/* Add Device Modal */}
          {showAddDeviceModal && (
            <AddDeviceModal
              isOpen={showAddDeviceModal}
              onClose={() => setShowAddDeviceModal(false)}
              onDeviceAdded={handleDeviceAdded}
              userId={user.id}
            />
          )}

          {/* Device Context Menu */}
          {showDeviceMenu && activeDeviceId && (
            <div className="fixed inset-0 z-50 overflow-y-auto" onClick={() => setShowDeviceMenu(false)}>
              <div className="fixed inset-0 bg-black opacity-30" aria-hidden="true"></div>
              <div className="relative bg-white w-56 rounded-lg shadow-lg border border-gray-200 p-1 ml-auto mr-4 mt-24">
                <button 
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded flex items-center text-gray-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle rename logic
                    setShowDeviceMenu(false);
                  }}
                >
                  <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Rename item
                </button>
                <button 
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded flex items-center text-gray-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle image change logic
                    setShowDeviceMenu(false);
                  }}
                >
                  <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Change image
                </button>
                <button 
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded flex items-center text-gray-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle hide device logic
                    setShowDeviceMenu(false);
                  }}
                >
                  <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7A9.97 9.97 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-1.43 3.27m-3.42-3.42a3 3 0 10-4.24 4.24m4.24-4.24l-4.24 4.24M9.879 16.121L12 14m4.242-4.242L12 14" />
                  </svg>
                  Hide device
                </button>
                <button 
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded flex items-center text-gray-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle view report logic
                    setShowDeviceMenu(false);
                  }}
                >
                  <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  View report
                </button>
                <div className="border-t border-gray-200 my-1"></div>
                <button 
                  className="w-full text-left px-4 py-2 hover:bg-red-50 rounded flex items-center text-red-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm("Are you sure you want to delete this device?")) {
                      deleteDevice(activeDeviceId);
                    } else {
                      setShowDeviceMenu(false);
                    }
                  }}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </ErrorBoundary>
  );
} 