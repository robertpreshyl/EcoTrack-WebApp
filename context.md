# EcoTrack Project Documentation
*Updated: July 2023*

## 1. Executive Summary

**Project Name:** EcoTrack - The Personalized Carbon Footprint Tracker

**Mission:** To empower individuals with localized, real-time carbon footprint tracking, actionable insights, and engaging features to drive eco-friendly behaviors, starting in Finland before expanding across Europe.

**Current Status:** Advanced MVP development with modern UI design, functional authentication flow, and responsive dashboard. Supabase integration complete for authentication and user management. We've implemented a modern light color scheme across all pages for a consistent user experience.

## 2. Business Overview

### 2.1 Problem & Solution

**Problem:** Individuals lack accessible, accurate, localized (e.g., for Finland), and engaging tools to measure and manage their carbon footprint. Existing solutions are often generic, not region-specific, or lack usability.

**Solution:** A SaaS web application offering:
- Localized carbon footprint calculator (initially Finland)
- Personalized insights and recommendations
- Gamification elements for engagement
- Future B2B reporting and API capabilities

### 2.2 Business Model

**Approach:** Freemium B2C initially, expanding to B2B services
- **Free Tier:** Basic carbon footprint calculation and tracking
- **Premium Tier (€5-10/month):** Detailed tracking, personalized insights, gamification
- **Future B2B Services:** Enterprise reporting, API access, white-label solutions

### 2.3 Target Market

**Phase 1 (Current):** Eco-conscious individuals in Finland (consumers, students, professionals)
**Phase 2:** Individuals in other EU regions
**Phase 3:** Businesses seeking carbon tracking for ESG goals or regulatory compliance

## 3. Project Phases & Roadmap

### 3.1 Phase 1: MVP (Months 1-3) - CURRENT PHASE
- ✅ Initial UI/UX design for calculator and dashboard
- ✅ Basic form for footprint inputs (transport, energy, diet)
- ✅ Multilingual support (Finnish/English)
- ✅ User authentication with Supabase
- ✅ Data storage in Supabase PostgreSQL
- ✅ Complete UI redesign with modern light theme
- ✅ Mobile-responsive design for all components
- ✅ User profile and session management
- ⬜ Integration with Carbon Interface API for calculations
- ⬜ Enhanced user dashboard with data visualization

### 3.2 Phase 2: Enhancement (Months 4-6)
- Premium subscription implementation with Stripe
- Historical data tracking and visualization
- Personalized reduction tips
- Gamification features (points, badges, leaderboards)
- UI/UX refinements based on user feedback

### 3.3 Phase 3: B2B & Growth (Months 7-12)
- Business carbon reporting features
- API development for third-party integration
- Affiliate partnerships with sustainable brands
- Performance optimization

### 3.4 Phase 4: Expansion (Months 13+)
- Geographic expansion beyond Finland
- Advanced B2B features and white-label solutions
- Mobile app development (potential)
- Team expansion

## 4. Technical Architecture

### 4.1 Technology Stack
- **Frontend:** Next.js (React) with TypeScript and Tailwind CSS
- **Backend:** Supabase (Edge Functions, Auth, PostgreSQL)
- **APIs:** Carbon Interface API (core), OpenAI API (future)
- **Payment Processing:** Stripe (future)
- **Hosting:** Vercel (frontend), Supabase (backend)

### 4.2 Application Structure
```
ecotrack-app/
├── app/                      # Next.js app directory
│   ├── api/                  # API routes for auth and data
│   ├── components/           # Shared React components
│   ├── dashboard/            # Dashboard pages
│   │   └── page.tsx
│   ├── calculator/           # Calculator pages
│   │   └── page.tsx
│   ├── login/                # Login page
│   │   └── page.tsx
│   ├── signup/               # Signup page
│   │   └── page.tsx
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Homepage/Landing page
├── lib/                      # Shared utilities
│   ├── context/              # React context providers
│   ├── supabase/             # Supabase client
│   ├── services/             # Service layers
│   ├── utils/                # Utility functions
│   └── types/                # TypeScript types
├── public/                   # Static assets
│   └── images/               # Images and icons
└── config files              # Next.js, TypeScript, etc.
```

### 4.3 Database Schema (Implemented)
```
users (Supabase Auth)
  id: uuid PK
  email: text
  created_at: timestamp
  
profiles
  id: uuid PK (references auth.users.id)
  full_name: text
  email: text
  language: text
  country: text
  
footprints
  id: uuid PK
  user_id: uuid FK(users.id)
  created_at: timestamp
  total_co2e_kg: numeric
  
footprint_details
  id: uuid PK
  footprint_id: uuid FK(footprints.id)
  category: text
  subcategory: text
  value: numeric
  
devices
  id: uuid PK
  user_id: uuid FK(users.id)
  name: text
  category: text
  subcategory: text
  energy_kwh: numeric
  co2_kg: numeric
  is_on: boolean
```

## 5. Current UI Components

### 5.1 Application Pages
- **Landing Page**: Modern, responsive landing page with feature showcase
- **Authentication Pages**: Login and signup pages with Supabase integration
- **Dashboard**: User dashboard with device management and carbon tracking
- **Carbon Calculator**: Interface for calculating carbon emissions

### 5.2 Design System
- Light color scheme with teal/blue accents
- Responsive design for mobile, tablet, and desktop
- Consistent component styling across all pages
- Interactive elements with hover/focus states

### 5.3 Dashboard Features
- User profile display
- Device management with real-time toggle functionality
- Carbon footprint visualization
- Tips carousel with eco-friendly recommendations

## 6. Key Integrations (Prioritized)

### 6.1 Completed Integrations
- **Supabase Authentication** - Implemented for user management
- **Supabase Database** - Storing user data and calculation results

### 6.2 Critical Path (Current Focus)
- **Carbon Interface API** - For accurate calculation of footprints
- **Data Visualization Library** - For enhanced dashboard charts

### 6.3 Phase 2 Priorities
- **Stripe API** - For handling premium subscriptions
- **OpenAI API (optional)** - For personalized reduction tips

## 7. Implementation Priorities

1. **Complete API Integration** - Connect to Carbon Interface API for real calculations
2. **Dashboard Enhancement** - Improve data visualization and user experience
3. **Data Analysis Features** - Add historical tracking and comparison tools
4. **Performance Optimization** - Audit and improve application performance
5. **User Feedback Integration** - Gather and incorporate user feedback

## 8. Development Guidelines

- Use TypeScript for all new components to avoid type errors
- Follow Next.js 13+ conventions (app directory, server/client components)
- Implement proper error handling for API calls
- Use "use client" directive for components using React hooks
- Monitor API usage carefully to control costs
- Maintain mobile responsiveness in all new features
- Implement proper loading states and error handling

## 9. Challenges & Solutions

- **Authentication Flow**: Implemented robust cookie-based auth with Supabase
- **Responsive Design**: Created a flexible layout system that adapts to all screen sizes
- **UI Consistency**: Established a consistent design system across all pages
- **Type Safety**: Enhanced TypeScript implementation for better error prevention

## 10. Next Steps

1. Integrate with Carbon Interface API for accurate emissions calculations
2. Enhance dashboard with interactive data visualizations
3. Implement user feedback system
4. Begin user testing with Finnish early adopters
5. Optimize performance and address any remaining UI issues
