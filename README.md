# Ghana Farmer

A comprehensive digital farm management platform for Ghanaian farmers.

## Features

- **Farm Management**: Track multiple farms with GPS location
- **Crop Management**: Log planting, activities, and harvests for 49+ crops
- **Livestock Management**: Track animals, vaccinations, health records, and production
- **Financial Tracking**: Record expenses and income, view profitability reports
- **Market Intelligence**: Real-time market prices and price alerts
- **Weather Information**: Weather forecasts and alerts
- **Task Management**: Auto-generated and custom tasks with reminders
- **Multi-language Support**: English, Twi, Ga, Ewe, Hausa, Dagbani

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: NextAuth.js

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-repo/ghfarmer.git
cd ghfarmer
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your database credentials and other settings.

4. Set up the database:
```bash
npm run db:generate
npm run db:push
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard pages
│   └── ...
├── components/            # React components
│   ├── ui/               # Base UI components
│   └── dashboard/        # Dashboard-specific components
├── lib/                   # Utility functions and configurations
│   ├── auth.ts           # NextAuth configuration
│   ├── db.ts             # Prisma client
│   ├── utils.ts          # Helper functions
│   └── validations/      # Zod schemas
└── types/                 # TypeScript type definitions

prisma/
├── schema.prisma         # Database schema
└── migrations/           # Database migrations

docs/
├── PRD.md               # Product Requirements Document
└── tasklist.md          # Development task list
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run migrations
- `npm run db:studio` - Open Prisma Studio

## Database Schema

The database includes models for:
- Users & Authentication
- Farms
- Crops & Crop Activities
- Livestock & Health Records
- Financial Records (Expenses & Income)
- Tasks
- Market Prices
- Notifications
- Reference Data (Regions, Fertilizers, Medications, etc.)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT License - see LICENSE file for details.
