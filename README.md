# EcoTrack

EcoTrack is a comprehensive carbon footprint monitoring application that helps users track and reduce their environmental impact.

![EcoTrack Dashboard](public/images/ecotrack-banner.png)

## Version 1.0.0
We've reached our first stable version with a complete UI overhaul featuring a modern light design theme across all pages.

## Features

- **Personalized Carbon Footprint Tracking**: Calculate your carbon emissions from energy usage, transportation, and more
- **Modern UI Design**: Clean, responsive interface with a light color scheme and teal/blue accents
- **Secure Authentication**: Full user authentication flow with Supabase
- **Interactive Dashboard**: View your carbon impact with detailed statistics and visualizations
- **Smart Device Management**: Track and manage your devices to monitor energy consumption
- **Eco-Friendly Tips**: Receive personalized recommendations to reduce your carbon footprint
- **Complete Responsive Design**: Fully responsive on mobile, tablet, and desktop
- **Historical Data Analysis**: Track your progress over time with detailed historical data

## Screenshots

### Landing Page
![Landing Page](public/images/screenshots/landing.png)

### Dashboard
![Dashboard](public/images/screenshots/dashboard.png)

## Technology Stack

- **Frontend**: Next.js 13 (App Router), React 18, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase
- **Authentication**: Supabase Auth with cookie-based sessions
- **Database**: PostgreSQL (via Supabase)
- **API Integration**: Carbon Interface API
- **Hosting**: Vercel

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account
- Carbon Interface API key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/robertpreshyl/EcoTrack-WebApp.git
   cd EcoTrack-WebApp
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with the following variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   CARBON_INTERFACE_API_KEY=your_carbon_interface_api_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Database Setup

See the [SUPABASE_SETUP.md](SUPABASE_SETUP.md) file for detailed instructions on setting up the Supabase database.

## Project Structure

```
ecotrack-app/
├── app/                    # Next.js app directory
│   ├── api/                # API routes for auth and data
│   ├── components/         # Shared React components
│   ├── dashboard/          # Dashboard pages
│   ├── login/              # Login page
│   ├── signup/             # Signup page
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Homepage/Landing page
├── lib/                    # Shared utilities
│   ├── context/            # React context providers
│   ├── supabase/           # Supabase client
│   ├── services/           # Service layers
│   ├── utils/              # Utility functions
│   └── types/              # TypeScript types
├── public/                 # Static assets
└── config files            # Next.js, TypeScript, etc.
```

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/robertpreshyl/EcoTrack-WebApp/tags).

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Carbon Interface API](https://www.carboninterface.com/) for providing carbon emissions data
- [Supabase](https://supabase.io/) for database and authentication
- [Next.js](https://nextjs.org/) for the application framework
- [TailwindCSS](https://tailwindcss.com/) for the design system
