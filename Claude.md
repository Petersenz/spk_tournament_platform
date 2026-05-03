# CLAUDE.md — Tournament Platform

markdown

```
markdown# Tournament Platform

## Project Overview

Web-based tournament management platform inspired by play.toornament.com.
Two user roles: **Organizer** (creates/manages tournaments) and **Player** (browses/registers for tournaments).

Solo developer project targeting 1-month MVP delivery.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) + TypeScript |
| UI | Tailwind CSS + shadcn/ui |
| Forms | React Hook Form + Zod |
| State | Zustand (client) + Supabase client (server state) |
| i18n | next-intl (Thai + English) |
| Backend | Supabase (PostgreSQL, Auth, Realtime, Storage) |
| Deploy | Vercel (free tier) |

## Project Structure

```

app/
[locale]/ # i18n routing (th|en)
(auth)/ # Login, Register
(public)/ # Tournament browse, detail, games
(organizer)/ # Dashboard, projects, tournaments management
(player)/ # Profile, my tournaments
api/ # API routes for complex logic (bracket generation, match reporting)

components/
ui/ # shadcn/ui components
bracket/ # Bracket visualization (SingleElim, DoubleElim, RoundRobin, MatchCard)
tournament/ # Tournament cards, wizard, stage config
participant/ # Participant form, player fields
registration/ # Registration form, list
shared/ # Navbar, Footer, LanguageSwitcher, ImageUpload

lib/
supabase/ # client.ts, server.ts, middleware.ts
bracket-engine/ # Pure functions: single-elim, double-elim, round-robin, seeding
i18n/ # next-intl config
utils.ts

messages/
th.json # Thai translations
en.json # English translations

stores/ # Zustand stores
hooks/ # Custom hooks (useRealtimeMatch, useTournament)
types/ # TypeScript type definitions
supabase/
migrations/ # SQL migration files
seed.sql # Seed data (games, platforms)

text

````
text
## Database

PostgreSQL via Supabase. Key tables:

- `profiles` — extends Supabase Auth (nickname, role, dob)
- `projects` — organizer's container (owner_id → profiles)
- `tournaments` — within project (name, game, size max 256, participant_type, match_type, status, registration settings)
- `participants` — team or individual in tournament (name, email, custom identifiers, logo, seed, status)
- `players` — members within a team participant (name, email, image, is_captain)
- `stages` — tournament stages (stage_type, format, settings)
- `rounds` — within stages
- `matches` — with next_match_id pointers for bracket linking
- `match_games` — individual games within a match (for best-of)
- `registrations` — player registration requests

### Key Enums

- `user_role`: organizer, player
- `tournament_status`: draft, registration_open, registration_closed, in_progress, completed, cancelled
- `stage_type`: single_elimination, double_elimination, gauntlet, bracket_groups, custom_bracket, round_robin, league, swiss_system
- `match_format`: no_game, single_game, home_and_away, best_of, fixed_game
- `match_status`: pending, ready, running, completed, walkover, cancelled
- `registration_mode`: auto, manual

### RLS Strategy

- Profiles: public read, self-update only
- Projects/Tournaments: public read, owner (project.owner_id) manages
- Participants: public read, organizer manages, players can insert own
- Matches: public read, organizer manages
- Registrations: user sees own + organizer sees all for their tournaments

## Supabase Client Usage

```typescript
// Browser (client components)
import { createClient } from '@/lib/supabase/client'
const supabase = createClient()

// Server (server components, API routes)
import { createClient } from '@/lib/supabase/server'
const supabase = await createClient()
````

Direct Supabase client for standard CRUD. Next.js API routes only for:

- Bracket generation (complex logic)
- Match result + auto-advance (needs transaction)
- Operations requiring service_role key

## Bracket Engine

Pure TypeScript functions in `lib/bracket-engine/`. No DB dependency — easy to test.

text

```
textInput:  participants[] + stageConfig
  → Seed participants (standard or random)
  → Pad to power of 2 (BYEs) for elimination types
  → Generate rounds
  → Generate matches with next_match_id pointers
Output: { rounds, matches, byeParticipants }
```

### Bracket Types (MVP)

- **Single Elimination** : standard bracket, losers eliminated after 1 loss
- **Double Elimination** : winners bracket + losers bracket + grand final
- **Round Robin** : all-play-all, circle method for pairings

### Match Linking

Matches link forward via `next_match_id` + `next_match_slot` (1 or 2).
Double elimination also uses `next_loser_match_id` + `next_loser_match_slot`.

### Auto-Advance

When match completes:

1. 1.Winner advances to `next_match_id` at `next_match_slot`
2. 2.Loser drops to `next_loser_match_id` (double elim)
3. 3.If both slots filled → match status = `ready`
4. 4.Supabase Realtime broadcasts changes automatically

## Realtime

typescript

```
typescript// Subscribe to match updates for a stage
supabase
  .channel(`matches:stage:${stageId}`)
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'matches',
    filter: `stage_id=eq.${stageId}`,
  }, (payload) => { /* update bracket UI */ })
  .subscribe()
```

Only subscribe to matches for the currently viewed stage.

## i18n

Using next-intl. Route prefix: `/th/...` and `/en/...`.

- Develop in English first
- Thai translations in batch at the end
- All user-facing strings must go through `useTranslations()`
- Translation files: `messages/th.json`, `messages/en.json`

## Key User Flows

### Organizer Flow

1. 1.Register (choose organizer role) → Login
2. 2.Create Project → Create Tournament within project
3. 3.Setup wizard: basic info → participant type → stage config
4. 4.Add Participants (teams with custom player count, or individuals)
5. 5.Configure Stage (type, format, size, settings)
6. 6.Generate Bracket → system creates matches
7. 7.Manage registrations (if enabled): approve/reject
8. 8.Run tournament: update scores → auto-advance winners

### Player Flow

1. 1.Register (player role) → Login
2. 2.Browse tournaments (filter by game, status)
3. 3.View tournament detail
4. 4.Register for tournament (fill team info + players)
5. 5.View bracket (realtime updates)
6. 6.My tournaments dashboard

## MVP Scope

### In Scope (Month 1)

- Auth (register, login, roles)
- Project + Tournament CRUD
- Participant management (custom team size)
- Registration (auto + manual approval)
- Single Elimination bracket
- Double Elimination bracket
- Round Robin
- Match format: single game, best of, no game
- Match result reporting (organizer primary)
- Auto-advance winners
- Realtime bracket updates
- Player browse + register
- i18n (TH + EN)
- Image upload (logos, avatars)

### Out of Scope (Phase 2)

- Swiss System, Gauntlet, Bracket Groups, Custom Bracket, League
- Player result reporting / cross-check
- Email notifications
- Check-in system
- Chat/communication
- Statistics export
- Advanced seeding UI (drag & drop)
- Advanced stage placement rules

## Coding Conventions

### TypeScript

- Strict mode enabled
- All function parameters and return types explicitly typed
- Use `interface` for object shapes, `type` for unions/intersections
- No `any` — use `unknown` and narrow

### Components

- Server Components by default, `'use client'` only when needed
- One component per file
- Props interface named `{ComponentName}Props`
- Use shadcn/ui primitives, extend with Tailwind

### Naming

- Files: kebab-case (`tournament-card.tsx`)
- Components: PascalCase (`TournamentCard`)
- Hooks: camelCase with `use` prefix (`useRealtimeMatch`)
- Database: snake_case (`tournament_id`)
- TypeScript: camelCase (`tournamentId`), PascalCase for types (`Tournament`)

### Styling

- Tailwind CSS only, no custom CSS unless absolutely necessary
- Use `cn()` utility from shadcn for conditional classes
- Responsive: mobile-first (`sm:`, `md:`, `lg:`)

### Forms

- React Hook Form for all forms
- Zod schemas for validation (shared between client and server)
- Error messages via i18n

### Data Fetching

- Supabase client directly in components (with RLS)
- Server Components for initial data load
- Optimistic updates for match results

### State Management

- Zustand for complex client state (tournament wizard)
- Supabase realtime for server-pushed state (match updates)
- URL state for filters and pagination

## Common Commands

bash

```
bash# Development
npm run dev

# Database
npx supabase db reset          # Reset local DB
npx supabase migration new     # Create new migration
npx supabase gen types         # Generate TypeScript types from DB

# Build
npm run build
npm run lint
```

## Environment Variables

env

```
envNEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=     # Only for API routes that need elevated access
```

## Important Notes

- Team player count is customizable (not fixed at 5) — set via `team_min_players` and `team_max_players` on tournament
- Tournament size max 256 participants
- Stage size max 12 for bracket-type stages
- BYE handling: pad participants to next power of 2 for elimination brackets
- Standard seeding: top seed plays lowest seed (1v16, 8v9, 4v13, 5v12)
- Free tier limits: Supabase 500MB DB, 1GB storage; Vercel 100GB bandwidth
