-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('customer', 'provider', 'admin');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled');
CREATE TYPE provider_status AS ENUM ('pending_approval', 'approved', 'rejected', 'suspended');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');

-- Profiles table (extends Supabase auth.users)
-- This represents both service buyers and service providers
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  role user_role DEFAULT 'customer' NOT NULL,
  location TEXT, -- e.g., "Nice", "Antibes", "Cannes"
  languages TEXT[], -- Array of languages
  bio TEXT, -- About section
  onboarding_completed BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Service categories table
CREATE TABLE IF NOT EXISTS public.service_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Service providers table
-- Represents providers who offer services in specific categories
CREATE TABLE IF NOT EXISTS public.service_providers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  service_category_id UUID NOT NULL REFERENCES public.service_categories(id) ON DELETE CASCADE,
  business_name TEXT,
  bio TEXT,
  hourly_rate DECIMAL(10, 2) NOT NULL,
  min_duration_hours DECIMAL(4, 2) DEFAULT 1.0 NOT NULL CHECK (min_duration_hours > 0),
  max_duration_hours DECIMAL(4, 2),
  rating DECIMAL(3, 2) DEFAULT 0.00 NOT NULL CHECK (rating >= 0 AND rating <= 5),
  total_reviews INTEGER DEFAULT 0 NOT NULL,
  total_bookings INTEGER DEFAULT 0 NOT NULL,
  status provider_status DEFAULT 'pending_approval' NOT NULL,
  verified BOOLEAN DEFAULT false NOT NULL,
  available BOOLEAN DEFAULT true NOT NULL,
  -- Service-specific fields
  service_area TEXT[], -- Areas they serve (e.g., ["Nice", "Antibes"])
  portfolio_images TEXT[], -- Array of image URLs
  certifications TEXT[], -- Array of certifications
  languages_spoken TEXT[], -- Languages provider speaks
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(profile_id, service_category_id)
);

-- Bookings table
-- Represents service bookings made by customers
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES public.service_providers(id) ON DELETE CASCADE,
  service_category_id UUID NOT NULL REFERENCES public.service_categories(id) ON DELETE CASCADE,
  status booking_status DEFAULT 'pending' NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_hours DECIMAL(4, 2) NOT NULL CHECK (duration_hours > 0),
  total_price DECIMAL(10, 2) NOT NULL CHECK (total_price >= 0),
  address TEXT NOT NULL,
  address_details TEXT, -- Apartment, floor, etc.
  notes TEXT, -- Customer notes/requirements
  provider_notes TEXT, -- Provider internal notes
  -- Payment fields
  payment_status payment_status DEFAULT 'pending' NOT NULL,
  payment_id TEXT, -- Stripe payment ID
  payment_method TEXT, -- Payment method used
  paid_at TIMESTAMPTZ,
  -- Check-in/Completion
  checked_in_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES public.service_providers(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(booking_id, customer_id)
);

-- Provider applications table
-- Tracks provider sign-up requests for admin approval
CREATE TABLE IF NOT EXISTS public.provider_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  service_category_id UUID NOT NULL REFERENCES public.service_categories(id) ON DELETE CASCADE,
  status provider_status DEFAULT 'pending_approval' NOT NULL,
  application_data JSONB, -- Store application form data
  admin_notes TEXT,
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Payments table (for financial tracking)
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES public.service_providers(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
  currency TEXT DEFAULT 'EUR' NOT NULL,
  payment_type TEXT NOT NULL, -- 'booking', 'refund', etc.
  status payment_status DEFAULT 'pending' NOT NULL,
  stripe_payment_id TEXT,
  stripe_customer_id TEXT,
  metadata JSONB, -- Store additional payment metadata
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_location ON public.profiles(location);
CREATE INDEX IF NOT EXISTS idx_service_categories_slug ON public.service_categories(slug);
CREATE INDEX IF NOT EXISTS idx_service_categories_active ON public.service_categories(active);
CREATE INDEX IF NOT EXISTS idx_service_providers_profile_id ON public.service_providers(profile_id);
CREATE INDEX IF NOT EXISTS idx_service_providers_category_id ON public.service_providers(service_category_id);
CREATE INDEX IF NOT EXISTS idx_service_providers_status ON public.service_providers(status);
CREATE INDEX IF NOT EXISTS idx_service_providers_available ON public.service_providers(available);
CREATE INDEX IF NOT EXISTS idx_service_providers_rating ON public.service_providers(rating DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_customer_id ON public.bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_provider_id ON public.bookings(provider_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_scheduled_at ON public.bookings(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON public.bookings(payment_status);
CREATE INDEX IF NOT EXISTS idx_reviews_provider_id ON public.reviews(provider_id);
CREATE INDEX IF NOT EXISTS idx_reviews_booking_id ON public.reviews(booking_id);
CREATE INDEX IF NOT EXISTS idx_provider_applications_status ON public.provider_applications(status);
CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON public.payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_customer_id ON public.payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_provider_id ON public.payments(provider_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to automatically update updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_categories_updated_at BEFORE UPDATE ON public.service_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_providers_updated_at BEFORE UPDATE ON public.service_providers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_provider_applications_updated_at BEFORE UPDATE ON public.provider_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create profile on user signup
-- This ensures EVERY user who signs up gets a profile in the profiles table
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NULL),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'customer')
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name);
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log error but don't fail user creation
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile when user signs up
-- This trigger runs automatically for EVERY new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update provider rating when review is added/updated
CREATE OR REPLACE FUNCTION update_provider_rating()
RETURNS TRIGGER AS $$
DECLARE
  avg_rating DECIMAL(3, 2);
  total_count INTEGER;
BEGIN
  SELECT AVG(rating)::DECIMAL(3, 2), COUNT(*)::INTEGER
  INTO avg_rating, total_count
  FROM public.reviews
  WHERE provider_id = NEW.provider_id;
  
  UPDATE public.service_providers
  SET rating = COALESCE(avg_rating, 0.00),
      total_reviews = total_count
  WHERE id = NEW.provider_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update provider rating
CREATE TRIGGER update_provider_rating_trigger
  AFTER INSERT OR UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION update_provider_rating();

-- Function to increment booking count when booking is created
CREATE OR REPLACE FUNCTION increment_provider_bookings()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.service_providers
  SET total_bookings = total_bookings + 1
  WHERE id = NEW.provider_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to increment booking count
CREATE TRIGGER increment_provider_bookings_trigger
  AFTER INSERT ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION increment_provider_bookings();

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can view public profiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for service_categories (public read)
CREATE POLICY "Service categories are viewable by everyone"
  ON public.service_categories FOR SELECT
  USING (active = true);

CREATE POLICY "Admins can manage service categories"
  ON public.service_categories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for service_providers
CREATE POLICY "Service providers are viewable by everyone"
  ON public.service_providers FOR SELECT
  USING (status = 'approved' AND available = true);

CREATE POLICY "Providers can view their own provider profiles"
  ON public.service_providers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = service_providers.profile_id
      AND profiles.id = auth.uid()
    )
  );

CREATE POLICY "Providers can update their own profile"
  ON public.service_providers FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = service_providers.profile_id
      AND profiles.id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all providers"
  ON public.service_providers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for bookings
CREATE POLICY "Users can view their own bookings"
  ON public.bookings FOR SELECT
  USING (
    customer_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.service_providers
      WHERE service_providers.id = bookings.provider_id
      AND service_providers.profile_id = auth.uid()
    )
  );

CREATE POLICY "Customers can create bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Users can update their own bookings"
  ON public.bookings FOR UPDATE
  USING (
    customer_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.service_providers
      WHERE service_providers.id = bookings.provider_id
      AND service_providers.profile_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all bookings"
  ON public.bookings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for reviews
CREATE POLICY "Reviews are viewable by everyone"
  ON public.reviews FOR SELECT
  USING (true);

CREATE POLICY "Customers can create reviews for their completed bookings"
  ON public.reviews FOR INSERT
  WITH CHECK (
    customer_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.bookings
      WHERE bookings.id = reviews.booking_id
      AND bookings.customer_id = auth.uid()
      AND bookings.status = 'completed'
    )
  );

CREATE POLICY "Customers can update their own reviews"
  ON public.reviews FOR UPDATE
  USING (customer_id = auth.uid());

-- RLS Policies for provider_applications
CREATE POLICY "Users can view their own applications"
  ON public.provider_applications FOR SELECT
  USING (profile_id = auth.uid());

CREATE POLICY "Users can create applications"
  ON public.provider_applications FOR INSERT
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Admins can view all applications"
  ON public.provider_applications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update applications"
  ON public.provider_applications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for payments
CREATE POLICY "Users can view their own payments"
  ON public.payments FOR SELECT
  USING (
    customer_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.service_providers
      WHERE service_providers.id = payments.provider_id
      AND service_providers.profile_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all payments"
  ON public.payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Insert initial service categories
INSERT INTO public.service_categories (id, name, description, icon, slug) VALUES
  (uuid_generate_v4(), 'Chef Privé', 'Private chef services for intimate dining experiences', 'chef-hat', 'chef-prive'),
  (uuid_generate_v4(), 'Coiffeur Privé', 'Private hairdressing services at your location', 'scissors', 'coiffeur-prive'),
  (uuid_generate_v4(), 'Cleaning Services', 'Professional cleaning and housekeeping services', 'sparkles', 'cleaning'),
  (uuid_generate_v4(), 'Gardening', 'Landscaping and garden maintenance services', 'sprout', 'gardening'),
  (uuid_generate_v4(), 'Chauffeur Privé', 'Private chauffeur and transportation services', 'car', 'chauffeur-prive'),
  (uuid_generate_v4(), 'Babysitting', 'Professional childcare and babysitting services', 'baby', 'babysitting'),
  (uuid_generate_v4(), 'Personal Shopper', 'Luxury personal shopping and styling services', 'shopping-bag', 'personal-shopper'),
  (uuid_generate_v4(), 'Stylist', 'Personal styling and fashion consultation', 'shirt', 'stylist'),
  (uuid_generate_v4(), 'Interior Stylist', 'Interior design and home styling services', 'home', 'interior-stylist')
ON CONFLICT (slug) DO NOTHING;
