-- Update Provider Status in Supabase
-- This script shows how to change a provider's status

-- Option 1: Update a specific provider by ID
-- Replace 'provider-id-here' with the actual provider ID
UPDATE public.service_providers
SET status = 'pending_approval'  -- or 'approved', 'rejected', 'suspended'
WHERE id = 'provider-id-here';

-- Option 2: Update a provider by business name
UPDATE public.service_providers
SET status = 'pending_approval'
WHERE business_name = 'Business Name Here';

-- Option 3: View all providers and their statuses first
SELECT 
  id,
  business_name,
  status,
  available,
  profiles.full_name,
  profiles.email
FROM public.service_providers
LEFT JOIN public.profiles ON service_providers.profile_id = profiles.id
ORDER BY created_at DESC;

-- Option 4: Set a provider as not approved (pending_approval)
UPDATE public.service_providers
SET status = 'pending_approval'
WHERE id = 'provider-id-here';

-- Option 5: Set a provider as rejected
UPDATE public.service_providers
SET status = 'rejected'
WHERE id = 'provider-id-here';

-- Available status values:
-- 'pending_approval' - Waiting for admin approval
-- 'approved' - Approved and visible to customers
-- 'rejected' - Rejected by admin
-- 'suspended' - Temporarily suspended

