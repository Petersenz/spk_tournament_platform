# Tournament Platform — Project Instructions

This project is a comprehensive tournament management platform for the Samutprakan Esport Association, built with Next.js, Supabase, and a focus on real-time bracket management.

## Project Overview

- **Stack:** Next.js 15+ (App Router), TypeScript, Tailwind CSS, shadcn/ui.
- **Backend:** Supabase (Auth, PostgreSQL, Realtime, Storage, RLS).
- **Internationalization:** `next-intl` (Supports TH and EN).
- **State Management:** Zustand for client state.
- **Form Handling:** React Hook Form + Zod validation.
- **Core Logic:** Custom Bracket Engine (`lib/bracket-engine`) for single/double elimination and round-robin.

## Architecture

### Routing & Layouts

The project uses Next.js App Router with i18n routing:

- `app/[locale]/`: Root for all localized routes.
- `(auth)`: Login and registration.
- `(admin)`: Platform-wide administration.
- `(organizer)`: Tournament and project management for organizers.
- `(player)`: Player-specific features (dashboard, history).
- `(public)`: Public-facing tournament lists and details.

### Database & Security

- **Supabase:** Primary data store and authentication provider using `@supabase/ssr`.
- **RLS (Row Level Security):** Policies are used extensively to manage data access. Refer to `supabase/migrations` for schema and policy definitions.
- **Triggers:** The database includes a `handle_new_user` trigger on `auth.users` that automatically creates a corresponding entry in the `public.profiles` table upon signup.
- **Middleware:** `middleware.ts` orchestrates both `next-intl` (for localization) and `lib/supabase/middleware.ts` (for session refreshing and route protection).

### Bracket Engine

Located in `lib/bracket-engine/`, it contains pure functional logic for generating tournament structures:

- `single-elimination.ts`: Standard single-bracket logic with support for BYEs and 3rd place matches.
- `double-elimination.ts`: Winners and Losers bracket logic with Grand Final reset support.
- `round-robin.ts`: Circle method for pairing and points-based standing calculation.

## Development Conventions

- **i18n:** Always use `next-intl` for UI text. Messages are stored in `messages/en.json` and `messages/th.json`. Localization is handled via the `[locale]` dynamic segment.
- **UI/UX:** Adhere to the design system described in `Design.md`. Prefer dark-first, clean, modern esports aesthetics using the "Samutprakan Esport Association" color palette.
- **Components:** Use shadcn/ui components located in `components/ui/`. Components should be accessible and responsive.
- **Shared Feedback UI:** Use `components/ui/ActionFeedbackModal.tsx` for reusable action modals that need loading, warning, success, or destructive states. Use `lib/app-toast.ts` instead of importing `sonner` directly in new code so toast behavior stays consistent.
- **Surgical Edits:** When modifying code, maintain structural integrity and type safety. Avoid suppressing warnings or using `any`.
- **Supabase Clients:**
  - Use `lib/supabase/client.ts` (`createBrowserClient`) for browser-side calls in Client Components.
  - Use `lib/supabase/server.ts` (`createServerClient`) for Server Components, Server Actions, and Route Handlers. This client handles cookies automatically for secure server-side operations.

### Participant Seeding

- Participant seed draw is a preview-first workflow in the organizer participant roster.
- The UI should show the randomized order before saving; never persist a shuffle immediately without review.
- Seed updates only write to `participants.seed`; no schema changes are required.
- Seed draw stays locked while bracket matches exist. Use the organizer Clear Bracket flow to delete generated matches/rounds first, then redraw seeds and regenerate the bracket.
- Clear Bracket must verify owner/admin access and warn that match records, scores, bracket links, and rounds for the stage will be deleted.
- Server actions that update seeds must verify owner/admin access and ensure all approved participants in the tournament are assigned exactly once.

## Building and Running

### Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
npm run start
```

### Linting

```bash
npm run lint
```

## Key Files

- `Plan.md`: Detailed development roadmap and database schema.
- `Design.md`: UI/UX design system and component specifications.
- `supabase/migrations/`: Database schema and RLS policies.
- `lib/bracket-engine/`: Core tournament logic.
- `messages/`: Localization strings.
