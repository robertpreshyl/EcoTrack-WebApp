// Device-related type definitions used throughout the application

/**
 * Represents a device with its energy consumption and carbon emission data
 */
export interface DeviceEmission {
  id: string;
  name: string;
  brand?: string;
  category: string;
  subcategory: string;
  energy_kwh: number;
  co2_kg: number;
  usage_time: number;
  cost_estimate: number;
  isOn?: boolean;
  image?: string;
  room: string;
}

/**
 * Device props used for rendering device cards
 */
export interface DeviceProps {
  id: string;
  name: string;
  brand?: string;
  category: string;
  subcategory?: string;
  energy_kwh: number;
  co2_kg: number;
  usage_time: number;
  cost_estimate: number;
  isOn: boolean;
  image?: string;
  room?: string;
  onToggle: (id: string, newStatus: boolean) => void;
  onShowMenu?: (id: string) => void;
} 