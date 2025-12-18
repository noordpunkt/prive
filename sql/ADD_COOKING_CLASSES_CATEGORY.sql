-- Add "Cooking classes" service category to the database
-- Run this in your Supabase SQL Editor

INSERT INTO public.service_categories (name, description, icon, slug, active) VALUES
  ('Cooking classes', 'Learn to cook with professional chefs', 'chef-hat', 'cooking-classes', true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  active = EXCLUDED.active;

-- Verify the category was created
SELECT 
  id,
  name,
  slug,
  description,
  icon,
  active,
  created_at
FROM public.service_categories
WHERE slug = 'cooking-classes';

