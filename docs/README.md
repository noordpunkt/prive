# Privé à la Carte

A premium services platform offering exceptional private services à la carte, built with Next.js, TypeScript, Supabase, Tailwind CSS, shadcn/ui, and Framer Motion.

## 🚀 Tech Stack

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Supabase** - Backend and database
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful UI components
- **Framer Motion** - Smooth animations

## 📦 Services Offered

- 👨‍🍳 Chef Privé - Private chef services
- ✂️ Coiffeur Privé - Private hairdressing
- 🧹 Cleaning Services - Professional cleaning
- 🌿 Gardening - Landscaping and maintenance
- 🚗 Chauffeur Privé - Private transportation
- 👶 Babysitting - Professional childcare
- 🛍️ Personal Shopper - Luxury shopping services
- 👔 Stylist - Personal styling and fashion
- 🏠 Interior Stylist - Interior design services

## 🛠️ Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Add your custom font (optional):**
   - Upload your font files to `public/fonts/`
   - Update font paths in `app/layout.tsx` if needed
   - See `public/fonts/README.md` for detailed instructions

3. **Set up environment variables:**
   Create a `.env.local` file with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up Supabase database:**
   - Create a new Supabase project at https://supabase.com
   - Go to SQL Editor in your Supabase dashboard
   - Run the migration file: `supabase/migrations/001_initial_schema.sql`
   - This will create all necessary tables, indexes, triggers, and RLS policies

5. **Run the development server:**
   ```bash
   npm run dev
   ```

6. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
prive/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── bookings/      # Booking endpoints
│   │   ├── services/       # Service endpoints
│   │   └── providers/      # Provider endpoints
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Homepage
│   └── services/           # Service pages
├── components/             # React components
│   ├── ui/                # shadcn/ui components
│   ├── ServiceCard.tsx    # Service card component
│   └── ThemeToggle.tsx    # Dark/light mode toggle
├── lib/                   # Utility functions
│   ├── supabase/          # Supabase clients
│   ├── actions/           # Server actions
│   └── utils.ts           # General utilities
├── supabase/              # Database migrations
│   └── migrations/        # SQL migration files
└── types/                 # TypeScript types
    ├── services.ts        # Service type definitions
    └── database.ts        # Database type definitions
```

## 🗄️ Database Schema

The database includes the following tables:

- **profiles** - User profiles (extends Supabase auth.users)
- **service_categories** - Available service categories
- **service_providers** - Service providers and their details
- **bookings** - Service bookings/appointments
- **reviews** - Customer reviews for providers

All tables have Row Level Security (RLS) enabled with appropriate policies.

## 🔌 API Routes

### Services
- `GET /api/services` - Get all active service categories
- `GET /api/services/[slug]` - Get service category by slug with providers

### Bookings
- `GET /api/bookings` - Get user's bookings
- `POST /api/bookings` - Create a new booking
- `GET /api/bookings/[id]` - Get booking details
- `PATCH /api/bookings/[id]` - Update booking

### Providers
- `GET /api/providers` - Get service providers (with optional filters)

## 🎨 Features

- ✨ Beautiful, modern UI with smooth animations
- 📱 Fully responsive design
- 🎯 Service category pages
- 🔐 Supabase authentication ready
- 🌙 Dark mode support
- ⚡ Optimized performance with Next.js
- 🗄️ Complete backend with Supabase
- 📊 Database with RLS policies
- 🔒 Secure API routes

## 📝 Next Steps

1. ✅ Set up your Supabase project and add the credentials
2. ✅ Run database migrations
3. ⏭️ Implement authentication flows (UI)
4. ⏭️ Add booking functionality (UI)
5. ⏭️ Create admin dashboard for service providers
6. ⏭️ Add payment integration
7. ⏭️ Implement search and filtering

## 🚢 Deployment

This project is ready to deploy on Vercel:

1. Push your code to GitHub
2. Import the project in Vercel
3. Add your environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

## 📄 License

MIT
