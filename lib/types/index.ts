// User Profile Types
export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
}

// Footprint Calculation Types
export interface FootprintData {
  country: string;
  transport: TransportData;
  energy: EnergyData;
  diet: DietData;
  housing: HousingData;
}

export interface TransportData {
  car: CarData | null;
  flights: FlightsData;
  motorbike: MotorbikeData | null;
  bus: PublicTransportData | null;
  train: PublicTransportData | null;
  taxi: PublicTransportData | null;
}

export interface CarData {
  distance_km_week: number;
  fuel: 'petrol' | 'diesel' | 'hybrid' | 'lpg' | 'electric';
  size: 'small' | 'medium' | 'large';
}

export interface FlightsData {
  short_haul_annual: number;
  medium_haul_annual: number;
  long_haul_annual: number;
}

export interface MotorbikeData {
  distance_km_week: number;
  size: 'small' | 'medium' | 'large';
}

export interface PublicTransportData {
  distance_km_week: number;
}

export interface EnergyData {
  electricity_kwh_month: number;
  natural_gas_annual: number;
  heating_oil_litres_annual: number;
  wood_kg_annual: number;
  lpg_annual: number;
  district_heating: 'unknown' | 'low_carbon' | 'typical';
}

export interface HousingData {
  household_size: number;
}

export interface DietData {
  type: 'average' | 'vegetarian' | 'vegan' | 'pescetarian' | 'low_meat' | 'meat_heavy';
}

// Footprint Result Types
export interface FootprintResult {
  id?: string;
  created_at?: string;
  total_co2e_kg: number;
  breakdown?: FootprintBreakdown;
  error?: string;
}

export interface FootprintBreakdown {
  transport: number;
  energy: number;
  diet: number;
  // Additional breakdown categories can be added later
}

// Subscription Types
export interface SubscriptionData {
  id: string;
  user_id: string;
  stripe_subscription_id: string;
  status: 'active' | 'past_due' | 'canceled' | 'trialing';
  tier: 'free' | 'premium';
  expires_at: string;
} 