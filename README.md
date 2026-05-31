# Tournament Platform

A premium esports tournament management platform for the Samutprakan Esport Association. Built with Next.js, Supabase, and Tailwind CSS.

## Features

- **Tournament Management:** Create and manage single/double elimination and round-robin tournaments.
- **Team-based Registration:** Support for team name entry and member management.
- **Real-time Brackets:** Automatic bracket generation and live updates.
- **Visible Seed Draw:** Organizers can preview a randomized seed draw before applying it to the participant roster.
- **Bracket Reset for Reseeding:** Organizers can clear generated matches/rounds before redrawing seeds and regenerating the bracket.
- **Shared Feedback UI:** Reusable modal and toast helpers keep confirmations, loading states, and action results consistent.
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
- `components/ui/ActionFeedbackModal.tsx`: Shared action modal for confirmations, loading states, and result feedback.
- `lib/`: Shared utilities, Supabase clients, and bracket engine.
- `lib/app-toast.ts`: Shared toast helper wrapping Sonner.
- `messages/`: Localization JSON files.
- `supabase/`: Database migrations and schema.

## License

© 2026 Samutprakan Esport Association. All rights reserved.
