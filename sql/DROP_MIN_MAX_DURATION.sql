-- Drop min_duration_hours and max_duration_hours columns
-- Run this if you already added total_hours and just need to remove the old columns

ALTER TABLE public.service_providers
DROP COLUMN IF EXISTS min_duration_hours,
DROP COLUMN IF EXISTS max_duration_hours;

-- Verify the columns are removed
-- Run this query to confirm:
-- SELECT column_name 
-- FROM information_schema.columns 
-- WHERE table_name = 'service_providers' 
-- AND column_name IN ('min_duration_hours', 'max_duration_hours');
-- Should return 0 rows

