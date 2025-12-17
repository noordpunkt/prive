-- Add cover_image_index field to service_providers table
-- This field stores the index (0-based) of the cover photo in the portfolio_images array
-- If NULL, the first image (index 0) is considered the cover photo

ALTER TABLE public.service_providers
ADD COLUMN IF NOT EXISTS cover_image_index INTEGER CHECK (cover_image_index >= 0);

-- Add comment
COMMENT ON COLUMN public.service_providers.cover_image_index IS 'Index of the cover photo in portfolio_images array (0-based). NULL means first image is cover.';

