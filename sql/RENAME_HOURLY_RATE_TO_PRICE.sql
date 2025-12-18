-- Rename hourly_rate column to price to reflect fixed pricing model
-- Run this in Supabase SQL Editor

-- Rename the column in service_providers table
ALTER TABLE public.service_providers 
RENAME COLUMN hourly_rate TO price;

-- Update any comments if needed
COMMENT ON COLUMN public.service_providers.price IS 'Fixed price for the service/experience (not per hour)';

