# EcoTrack Project Documentation
*Updated: April 2025*

## 1. Executive Summary

**Project Name:** EcoTrack - The Personalized Carbon Footprint Tracker

**Mission:** To empower individuals with localized, real-time carbon footprint tracking, actionable insights, and engaging features to drive eco-friendly behaviors, starting in Finland before expanding across Europe.

**Current Status:** MVP development stage with functional calculator UI and simulated calculations. Pending implementation of Supabase authentication and Carbon Interface API integration.

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
- ⬜ User authentication with Supabase
- ⬜ Integration with Carbon Interface API for calculations
- ⬜ Data storage in Supabase PostgreSQL
- ⬜ Basic user dashboard

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
- **Payment Processing:** Stripe
- **Hosting:** Vercel (frontend), Supabase (backend)

### 4.2 Application Structure
```
ecotrack-app/
├── app/                      # Next.js app directory
│   ├── api/                  # API routes (to be implemented)
│   ├── components/           # Shared React components
│   ├── dashboard/            # Dashboard pages
│   │   └── page.tsx
│   ├── calculator/           # Calculator pages
│   │   └── page.tsx
│   ├── auth/                 # Authentication pages
│   │   └── page.tsx
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Homepage
├── lib/                      # Shared utilities
│   ├── supabase/             # Supabase client
│   ├── carbon-api/           # Carbon Interface API utilities
│   └── types/                # TypeScript types
├── public/                   # Static assets
└── config files              # Next.js, TypeScript, etc.
```

### 4.3 Database Schema (Planned)
```
users
  id: uuid PK
  email: text
  created_at: timestamp
  
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
  
user_achievements
  id: uuid PK
  user_id: uuid FK(users.id)
  achievement_id: text
  earned_at: timestamp
  
subscriptions
  id: uuid PK
  user_id: uuid FK(users.id)
  stripe_subscription_id: text
  status: text
  tier: text
  expires_at: timestamp
```

## 5. Current UI Components

### 5.1 Main Application Layout
- Header with app name, language selector, and country selector
- Authentication section (login/signup)
- Dashboard area (for logged-in users)
- Calculator form
- Results display
- Footer

### 5.2 Calculator Form
Structured with these main sections:
- Transport (car, flights, motorbike, public transport)
- Home Energy (electricity, heating fuels, household size)
- Diet (type selection)
- Future: Waste & Consumption sections

### 5.3 Dashboard (to be expanded)
Current simulated features:
- Latest footprint display
- Placeholder for historical data
- Coming soon section for Phase 2 features

## 6. Key Integrations (Prioritized)

### 6.1 Critical Path (MVP)
- **Supabase Authentication** - For user management
- **Carbon Interface API** - For accurate calculation of footprints
- **Supabase Database** - For storing user data and calculation results

### 6.2 Phase 2 Priorities
- **Stripe API** - For handling premium subscriptions
- **Charting Library** - For visualizing historical data
- **OpenAI API (optional)** - For personalized reduction tips

## 7. Implementation Priorities

1. **Complete Authentication** - Implement proper Supabase authentication to replace the current simulation
2. **API Integration** - Connect to Carbon Interface API for real calculations
3. **Data Persistence** - Store user information and calculation history
4. **Localization Refinement** - Ensure Finnish data factors are accurate
5. **User Testing** - Gather initial feedback from Finnish users
6. **UI Polish** - Refine interface based on feedback

## 8. Development Guidelines

- Use TypeScript for all new components to avoid type errors
- Follow Next.js 13+ conventions (app directory, server/client components)
- Implement proper error handling for API calls
- Use "use client" directive for components using React hooks
- Monitor API usage carefully to control costs
- Build with mobile responsiveness in mind
- Implement proper loading states and error handling

## 9. Risks & Considerations

- **API Costs** - Carbon Interface API pricing is higher than initially estimated
- **Market Adoption** - Need to validate willingness to pay for premium features
- **Technical Debt** - Current implementation needs TypeScript refinement
- **Authentication** - Must implement proper auth flow with Supabase
- **Calculation Accuracy** - Ensure that Finnish-specific factors are properly applied

## 10. Next Steps

1. Implement Supabase authentication
2. Set up proper database schema
3. Integrate with Carbon Interface API
4. Implement data persistence
5. Fix TypeScript errors in current implementation
6. Deploy MVP for initial user testing
