# Côte d'Azur Services Platform

A premium services platform for the Côte d'Azur region, built with Next.js, TypeScript, Supabase, Tailwind CSS, shadcn/ui, and Framer Motion.

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

2. **Set up environment variables:**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Then add your Supabase credentials:
   - `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
cote-azur-services/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Homepage
│   └── services/          # Service pages
├── components/             # React components
│   ├── ui/                # shadcn/ui components
│   └── ServiceCard.tsx    # Service card component
├── lib/                   # Utility functions
│   ├── supabase/          # Supabase clients
│   └── utils.ts           # General utilities
└── types/                 # TypeScript types
    └── services.ts        # Service type definitions
```

## 🎨 Features

- ✨ Beautiful, modern UI with smooth animations
- 📱 Fully responsive design
- 🎯 Service category pages
- 🔐 Ready for Supabase authentication
- 🌙 Dark mode support (via shadcn/ui)
- ⚡ Optimized performance with Next.js

## 📝 Next Steps

1. Set up your Supabase project and add the credentials
2. Create database tables for services, bookings, and users
3. Implement authentication flows
4. Add booking functionality
5. Create admin dashboard for service providers
6. Add payment integration
7. Implement search and filtering

## 🚢 Deployment

This project is ready to deploy on Vercel:

1. Push your code to GitHub
2. Import the project in Vercel
3. Add your environment variables
4. Deploy!

## 📄 License

MIT
