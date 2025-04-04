# EcoTrack

EcoTrack is a comprehensive carbon footprint monitoring application that helps users track and reduce their environmental impact.

## Features

- **Personalized Carbon Footprint Tracking**: Calculate your carbon emissions from energy usage, transportation, and more
- **Interactive Dashboard**: View your carbon impact with detailed statistics and visualizations
- **Smart Device Integration**: Connect with IoT devices to automatically track energy consumption
- **Eco-Friendly Tips**: Receive personalized recommendations to reduce your carbon footprint
- **Historical Data Analysis**: Track your progress over time with detailed historical data

## Technology Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase
- **Authentication**: Supabase Auth
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

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Carbon Interface API](https://www.carboninterface.com/) for providing carbon emissions data
- [Supabase](https://supabase.io/) for database and authentication
- [Next.js](https://nextjs.org/) for the application framework
