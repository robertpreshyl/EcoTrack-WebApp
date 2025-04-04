-- DEVICES SCHEMA
-- This schema defines the structure for tracking user devices and their energy consumption

-- Enable the pgcrypto extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Define the devices table
CREATE TABLE IF NOT EXISTS "devices" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL REFERENCES "profiles"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "brand" TEXT,
  "category" TEXT NOT NULL,
  "subcategory" TEXT,
  "room" TEXT,
  "energy_kwh" NUMERIC(10, 2) NOT NULL DEFAULT 0,
  "co2_kg" NUMERIC(10, 2) NOT NULL DEFAULT 0,
  "usage_time" NUMERIC(10, 2) NOT NULL DEFAULT 0,
  "cost_estimate" NUMERIC(10, 2) NOT NULL DEFAULT 0,
  "is_on" BOOLEAN NOT NULL DEFAULT FALSE,
  "image_path" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add Row Level Security (RLS) policies
ALTER TABLE "devices" ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid errors
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'devices' AND policyname = 'Users can view their own devices'
    ) THEN
        DROP POLICY "Users can view their own devices" ON "devices";
    END IF;

    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'devices' AND policyname = 'Users can insert their own devices'
    ) THEN
        DROP POLICY "Users can insert their own devices" ON "devices";
    END IF;

    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'devices' AND policyname = 'Users can update their own devices'
    ) THEN
        DROP POLICY "Users can update their own devices" ON "devices";
    END IF;

    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'devices' AND policyname = 'Users can delete their own devices'
    ) THEN
        DROP POLICY "Users can delete their own devices" ON "devices";
    END IF;
END
$$;

-- Create policies
CREATE POLICY "Users can view their own devices" 
  ON "devices" FOR SELECT 
  USING ("user_id" = auth.uid());

CREATE POLICY "Users can insert their own devices" 
  ON "devices" FOR INSERT 
  WITH CHECK ("user_id" = auth.uid());

CREATE POLICY "Users can update their own devices" 
  ON "devices" FOR UPDATE 
  USING ("user_id" = auth.uid());

CREATE POLICY "Users can delete their own devices" 
  ON "devices" FOR DELETE 
  USING ("user_id" = auth.uid());

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS "devices_user_id_idx" ON "devices" ("user_id");
CREATE INDEX IF NOT EXISTS "devices_category_idx" ON "devices" ("category");
CREATE INDEX IF NOT EXISTS "devices_is_on_idx" ON "devices" ("is_on");

-- Function to update the updated_at timestamp on record changes
CREATE OR REPLACE FUNCTION update_devices_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Check if trigger exists before creating it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_devices_updated_at_trigger'
    ) THEN
        CREATE TRIGGER update_devices_updated_at_trigger
        BEFORE UPDATE ON "devices"
        FOR EACH ROW
        EXECUTE FUNCTION update_devices_updated_at();
    END IF;
END
$$; 