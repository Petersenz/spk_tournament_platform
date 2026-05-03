# Tournament Platform

A premium esports tournament management platform for the Samutprakan Esport Association. Built with Next.js, Supabase, and Tailwind CSS.

## Features

- **Tournament Management:** Create and manage single/double elimination and round-robin tournaments.
- **Team-based Registration:** Support for team name entry and member management.
- **Real-time Brackets:** Automatic bracket generation and live updates.
- **Premium UI:** Dark-first, high-performance esports aesthetic.
- **Internationalization:** Full support for Thai and English.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Database/Auth:** Supabase
- **Styling:** Tailwind CSS 4, Lucide Icons, Shadcn/UI
- **i18n:** next-intl

## Getting Started

1. Clone the repository.
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env.local` and fill in your Supabase credentials.
4. Run development server: `npm run dev`
5. Build for production: `npm run build`

## Project Structure

- `app/[locale]/`: Localized routes and pages.
- `components/`: Reusable UI components.
- `lib/`: Shared utilities, Supabase clients, and bracket engine.
- `messages/`: Localization JSON files.
- `supabase/`: Database migrations and schema.

## License

© 2026 Samutprakan Esport Association. All rights reserved.
