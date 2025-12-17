-- Add total_hours field and remove min/max duration columns
-- This replaces the min/max duration approach with a single total hours field

-- Step 1: Add total_hours column
ALTER TABLE public.service_providers
ADD COLUMN IF NOT EXISTS total_hours DECIMAL(4, 2) DEFAULT 2.0 CHECK (total_hours > 0);

-- Step 2: Add comment
COMMENT ON COLUMN public.service_providers.total_hours IS 'Total duration in hours for the service (replaces min/max duration)';

-- Step 3: Set default total_hours based on existing min/max duration for existing records
UPDATE public.service_providers
SET total_hours = COALESCE(max_duration_hours, min_duration_hours, 2.0)
WHERE total_hours IS NULL;

-- Step 4: Remove old min/max duration columns
ALTER TABLE public.service_providers
DROP COLUMN IF EXISTS min_duration_hours,
DROP COLUMN IF EXISTS max_duration_hours;

