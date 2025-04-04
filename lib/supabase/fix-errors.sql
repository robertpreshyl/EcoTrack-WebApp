-- This SQL script fixes common errors in the Supabase setup for EcoTrack
-- Run this in the Supabase SQL Editor if you encounter permission issues or missing tables

-- 1. Create devices table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.devices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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

-- 2. Enable RLS on all tables
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.footprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.footprint_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.devices ENABLE ROW LEVEL SECURITY;

-- 3. Create indexes for better performance
CREATE INDEX IF NOT EXISTS devices_user_id_index ON public.devices (user_id);
CREATE INDEX IF NOT EXISTS devices_room_index ON public.devices (room);
CREATE INDEX IF NOT EXISTS footprints_user_id_index ON public.footprints (user_id);
CREATE INDEX IF NOT EXISTS footprint_details_footprint_id_index ON public.footprint_details (footprint_id);

-- 4. Fix footprints table RLS policies
DROP POLICY IF EXISTS "Users can view their own footprints" ON public.footprints;
CREATE POLICY "Users can view their own footprints" 
ON public.footprints FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own footprints" ON public.footprints;
CREATE POLICY "Users can insert their own footprints" 
ON public.footprints FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own footprints" ON public.footprints;
CREATE POLICY "Users can update their own footprints" 
ON public.footprints FOR UPDATE 
USING (auth.uid() = user_id);

-- 5. Fix footprint details policies
DROP POLICY IF EXISTS "Users can view footprint details related to their footprints" ON public.footprint_details;
CREATE POLICY "Users can view footprint details related to their footprints" 
ON public.footprint_details FOR SELECT 
USING (
  footprint_id IN (
    SELECT id FROM public.footprints WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can insert their own footprint details" ON public.footprint_details;
CREATE POLICY "Users can insert their own footprint details" 
ON public.footprint_details FOR INSERT 
WITH CHECK (
  footprint_id IN (
    SELECT id FROM public.footprints WHERE user_id = auth.uid()
  )
);

-- 6. Fix devices table policies
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
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own devices" ON public.devices;
CREATE POLICY "Users can delete their own devices" 
ON public.devices FOR DELETE 
USING (auth.uid() = user_id);

-- 7. Create a function to handle new user registration if it doesn't exist
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, created_at, updated_at)
    VALUES (new.id, new.email, now(), now());
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to call the function when a user signs up if it doesn't exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8. Fix common errors with public.profiles table
DO $$
BEGIN
    -- Check if email column exists
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'email'
    ) THEN
        -- Add email column if it doesn't exist
        ALTER TABLE public.profiles ADD COLUMN email TEXT;
    END IF;
    
    -- Check if created_at column exists
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'created_at'
    ) THEN
        -- Add created_at column if it doesn't exist
        ALTER TABLE public.profiles ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT now();
    END IF;
    
    -- Check if updated_at column exists
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'updated_at'
    ) THEN
        -- Add updated_at column if it doesn't exist
        ALTER TABLE public.profiles ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();
    END IF;
END
$$; 