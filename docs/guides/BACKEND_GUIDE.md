# Backend Architecture Guide - Privé à la Carte

## Overview

This backend is designed as a **service marketplace** where:
- **Service Providers** can sign up, get approved, and offer services
- **Service Buyers/Customers** can browse services and book providers
- **Admins** can approve providers and manage the platform

## Core User Flows

### 1. Service Provider Flow

1. **Sign Up as Provider**
   - User creates account with role "provider"
   - Submits provider application via `/api/providers/apply`
   - Application stored in `provider_applications` table with status `pending_approval`

2. **Admin Approval**
   - Admin reviews application via `/api/admin/applications`
   - Approves or rejects
   - If approved: creates entry in `service_providers` table with status `approved`

3. **Provider Profile Management**
   - Provider can update their profile via `updateProviderProfile()`
   - Can set: hourly rate, availability, service areas, portfolio, etc.
   - Can toggle availability on/off

### 2. Service Buyer Flow

1. **Sign Up as Customer**
   - User creates account (default role: "customer")
   - Can complete onboarding via `completeOnboarding()`

2. **Browse Services**
   - View all service categories via `/api/services`
   - View providers for a category via `/api/services/[slug]`
   - Filter by location, rating, availability

3. **Book Service**
   - Select provider and service
   - Create booking via `createBooking()` or `/api/bookings`
   - Booking status: `pending` → `confirmed` → `in_progress` → `completed`

4. **Payment**
   - Payment tracked in `payments` table
   - Payment status: `pending` → `paid` → `failed`/`refunded`
   - Stripe integration ready (payment_id field)

5. **Review Provider**
   - After booking completion, customer can leave review
   - Review automatically updates provider rating

## Database Schema

### Core Tables

#### `profiles`
- Extends Supabase auth.users
- Stores: name, email, phone, avatar, role, location, languages, bio
- Role: `customer`, `provider`, or `admin`

#### `service_categories`
- Service types (Chef Privé, Cleaning, etc.)
- Fields: name, description, icon, slug

#### `service_providers`
- Provider profiles for specific service categories
- Fields: business_name, bio, hourly_rate, rating, status, availability
- Status: `pending_approval`, `approved`, `rejected`, `suspended`
- One user can be a provider for multiple categories

#### `bookings`
- Service bookings/appointments
- Fields: customer, provider, scheduled_at, duration, price, address
- Status: `pending`, `confirmed`, `in_progress`, `completed`, `cancelled`
- Payment status tracked separately

#### `reviews`
- Customer reviews for providers
- Automatically updates provider rating via trigger

#### `provider_applications`
- Tracks provider sign-up requests
- Admin reviews and approves/rejects
- On approval, creates `service_providers` entry

#### `payments`
- Payment records for financial tracking
- Links to bookings
- Stores Stripe payment IDs

## API Endpoints

### Services
- `GET /api/services` - List all active service categories
- `GET /api/services/[slug]` - Get category with providers

### Providers
- `POST /api/providers/apply` - Submit provider application
- `GET /api/providers` - List providers (with filters)

### Bookings
- `GET /api/bookings` - Get user's bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/[id]` - Get booking details
- `PATCH /api/bookings/[id]` - Update booking

### Admin
- `GET /api/admin/applications` - List provider applications
- `PATCH /api/admin/applications` - Approve/reject application

## Server Actions

### Provider Actions (`lib/actions/providers.ts`)
- `submitProviderApplication()` - Submit application
- `getMyProviderProfile()` - Get provider profile
- `updateProviderProfile()` - Update profile
- `getProviderApplications()` - Admin: list applications
- `reviewProviderApplication()` - Admin: approve/reject

### Booking Actions (`lib/actions/bookings.ts`)
- `createBooking()` - Create booking with validation
- `getBookings()` - Get user's bookings
- `updateBookingStatus()` - Update booking status

### Profile Actions (`lib/actions/profile.ts`)
- `getCurrentProfile()` - Get current user profile
- `updateProfile()` - Update profile
- `completeOnboarding()` - Complete onboarding

### Review Actions (`lib/actions/reviews.ts`)
- `createReview()` - Create review
- `getReviewsByProvider()` - Get provider reviews

## Security & Permissions

### Row Level Security (RLS)
- All tables have RLS enabled
- Users can only see their own data
- Providers can see their own bookings
- Admins can see everything
- Public data (service categories, approved providers) visible to all

### Role-Based Access
- **Customer**: Can create bookings, leave reviews
- **Provider**: Can manage their profile, view their bookings
- **Admin**: Can approve providers, view all data

## Key Features

### Provider Approval System
- Applications require admin approval
- Prevents spam and ensures quality
- Admin can review, approve, or reject with notes

### Booking Validation
- Checks provider availability
- Validates duration (min/max hours)
- Ensures provider is approved
- Calculates price automatically

### Rating System
- Automatic rating calculation from reviews
- Updates provider rating in real-time
- Triggers handle rating updates

### Payment Tracking
- Separate payments table for financial records
- Links to bookings
- Ready for Stripe integration
- Tracks payment status

## Next Steps for Frontend

1. **Provider Onboarding UI**
   - Form to submit provider application
   - Upload portfolio images
   - Set pricing and availability

2. **Customer Booking UI**
   - Service discovery page
   - Provider selection
   - Booking form with date/time picker
   - Payment integration

3. **Provider Dashboard**
   - View bookings
   - Manage availability
   - Update profile
   - View earnings

4. **Admin Dashboard**
   - Review provider applications
   - Approve/reject with notes
   - View platform analytics

5. **Payment Integration**
   - Stripe checkout
   - Payment webhooks
   - Update payment status

## Environment Variables Needed

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
STRIPE_SECRET_KEY=your_stripe_secret_key (for payments)
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key (for payments)
```

## Database Migration

Run the migration file in Supabase SQL Editor:
```
supabase/migrations/001_initial_schema.sql
```

This will create all tables, indexes, triggers, and RLS policies.

