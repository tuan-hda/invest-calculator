# Project Brief: Invest Calculator

A Next.js application designed to help users track investments, calculate accumulation plans, and monitor financial markers like gold prices, with integrated Vietnamese lunar calendar support.

## Core Goals
- Provide a unified dashboard for investment tracking.
- Calculate and visualize investment accumulation strategies.
- Monitor real-time or near real-time gold prices (SJC/Gold).
- Integrate financial planning with lunar calendar events (relevant for Vietnamese culture).

## Key Features
- **Investment Management**: Breakdown and history of investments.
- **Accumulation Planner**: Tools to simulate long-term wealth building.
- **Gold Price Tracking**: Automated fetching and display of gold market data.
- **Lunar Calendar**: Integration of Vietnamese lunar dates and events.
- **Authentication**: Secure user access via Clerk.
- **Data Persistence**: Robust storage using Supabase.

## Tech Stack
- **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS, Framer Motion.
- **UI Components**: shadcn/ui (Radix UI).
- **Authentication**: Clerk.
- **Database**: Supabase.
- **Utilities**: `vn-lunar` for calendar, `cheerio` for price scraping, `recharts` for data visualization.
