-- EcoTrack Database Schema
-- Run this in Supabase SQL Editor to set up your database tables
-- Notes: 
-- 1. auth.users is automatically created by Supabase
-- 2. RLS (Row Level Security) policies are essential for data protection

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Footprints table - stores the main carbon footprint calculations
CREATE TABLE IF NOT EXISTS public.footprints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  total_co2e_kg NUMERIC NOT NULL,
  country_code TEXT NOT NULL,
  calculation_version TEXT DEFAULT '1.0', -- For tracking algorithm changes over time
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Footprint details - stores the breakdown of each footprint calculation
CREATE TABLE IF NOT EXISTS public.footprint_details (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  footprint_id UUID REFERENCES public.footprints(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL, -- 'transport', 'energy', 'diet', etc.
  subcategory TEXT NOT NULL, -- 'car', 'electricity', 'meat', etc.
  value NUMERIC NOT NULL, -- CO2e value
  raw_input JSONB, -- Stores the original input data for reference/debugging
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- User achievements - for gamification features in Phase 2
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  achievement_id UUID REFERENCES public.achievements(id) ON DELETE CASCADE NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (user_id, achievement_id)
);

-- Subscriptions - for premium features in Phase 2
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  stripe_subscription_id TEXT,
  status TEXT NOT NULL,
  tier TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- User profiles - additional user information beyond auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  language TEXT DEFAULT 'en',
  country TEXT DEFAULT 'FI',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Devices - stores user devices with their energy consumption data
CREATE TABLE IF NOT EXISTS public.devices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  brand TEXT,
  category TEXT NOT NULL, -- 'energy', 'transport', etc.
  subcategory TEXT, -- 'cooling', 'entertainment', 'appliance', etc.
  energy_kwh NUMERIC, -- Energy consumption in kWh
  co2_kg NUMERIC, -- CO2 emissions in kg
  usage_time NUMERIC, -- Usage time in hours
  cost_estimate NUMERIC, -- Estimated cost
  image_path TEXT, -- Path to the device image
  room TEXT, -- Room where the device is located
  is_on BOOLEAN DEFAULT false, -- Whether the device is turned on
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.footprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.footprint_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;

-- Create policies that only allow users to access their own data
-- Footprints policies
DROP POLICY IF EXISTS "Users can view their own footprints" ON public.footprints;
CREATE POLICY "Users can view their own footprints" 
ON public.footprints FOR SELECT 
USING (auth.uid() = user_id);

-- Update the insert policy to be more permissive
DROP POLICY IF EXISTS "Users can insert their own footprints" ON public.footprints;
CREATE POLICY "Users can insert footprints" 
ON public.footprints FOR INSERT 
WITH CHECK (true);

-- Footprint details policies
DROP POLICY IF EXISTS "Users can view their own footprint details" ON public.footprint_details;
CREATE POLICY "Users can view their own footprint details" 
ON public.footprint_details FOR SELECT 
USING ((SELECT user_id FROM public.footprints WHERE id = footprint_id) = auth.uid());

-- Update footprint details insert policy
DROP POLICY IF EXISTS "Users can insert their own footprint details" ON public.footprint_details;
CREATE POLICY "Users can insert footprint details" 
ON public.footprint_details FOR INSERT 
WITH CHECK (true);

-- User achievements policies
DROP POLICY IF EXISTS "Users can view their own achievements" ON public.user_achievements;
CREATE POLICY "Users can view their own achievements" 
ON public.user_achievements FOR SELECT 
USING (auth.uid() = user_id);

-- Subscriptions policies
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can view their own subscriptions" 
ON public.subscriptions FOR SELECT 
USING (auth.uid() = user_id);

-- Profiles policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Devices policies
DROP POLICY IF EXISTS "Users can view their own devices" ON public.devices;
CREATE POLICY "Users can view their own devices" 
ON public.devices FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own devices" ON public.devices;
CREATE POLICY "Users can create their own devices" 
ON public.devices FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own devices" ON public.devices;
CREATE POLICY "Users can update their own devices" 
ON public.devices FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own devices" ON public.devices;
CREATE POLICY "Users can delete their own devices" 
ON public.devices FOR DELETE 
USING (auth.uid() = user_id);

-- Create functions and triggers

-- Function to create a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, created_at, updated_at)
  VALUES (NEW.id, NEW.email, now(), now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function when a user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Make the get_carbon_leaderboard function use SECURITY DEFINER
DROP FUNCTION IF EXISTS public.get_carbon_leaderboard;

CREATE OR REPLACE FUNCTION public.get_carbon_leaderboard(limit_count integer DEFAULT 10)
RETURNS TABLE (
  username text,
  name text,
  avatar_url text,
  total_co2e_kg numeric,
  footprint_count bigint
) 
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id::text as username, -- Using ID as username until users set their own
    p.name,
    p.avatar_url,
    SUM(f.total_co2e_kg) as total_co2e_kg,
    COUNT(f.id) as footprint_count
  FROM 
    profiles p
  LEFT JOIN 
    footprints f ON p.id = f.user_id
  GROUP BY 
    p.id, p.name, p.avatar_url
  ORDER BY 
    total_co2e_kg ASC NULLS LAST
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql; 