# แผนพัฒนา Tournament Platform — Full Plan

## สรุป Constraints ที่ต้องคำนึงตลอด

| Constraint             | ผลกระทบ                                                  |
| ---------------------- | -------------------------------------------------------- |
| **Solo dev**           | ต้องเลือก stack ที่เร็ว ไม่ต้อง setup เยอะ               |
| **1 เดือน**            | ต้องตัด scope อย่างจริงจัง stage type บางอันต้อง defer   |
| **Free tier**          | Supabase free (500MB DB, 1GB storage) + Vercel free      |
| **Next.js + Supabase** | Supabase ครอบคลุม Auth, DB, Realtime, Storage ในที่เดียว |
| **TH + EN**            | ต้องวาง i18n ตั้งแต่ต้น ไม่งั้น retrofit ยาก             |

---

## 1. Tech Stack Decision

text

```
text┌─────────────────────────────────────────────────────┐
│                   FINAL TECH STACK                   │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Frontend    Next.js 14 (App Router) + TypeScript   │
│  UI          Tailwind CSS + shadcn/ui               │
│  State       Zustand (client) + SWR or React Query  │
│  i18n        next-intl (TH + EN)                    │
│  Forms       React Hook Form + Zod                  │
│  Charts/Bra  react-bracket (or custom SVG)          │
│                                                     │
│  Backend     Supabase (all-in-one)                  │
│  ├─ Auth     Supabase Auth (email + maybe Google)   │
│  ├─ Database Supabase PostgreSQL                    │
│  ├─ Realtime Supabase Realtime (Postgres Changes)   │
│  ├─ Storage  Supabase Storage (logos, images)       │
│  ├─ RLS      Row Level Security (authorization)     │
│  └─ Edge Fn  Supabase Edge Functions (if needed)    │
│                                                     │
│  Deploy      Vercel (free tier)                     │
│  Monitoring  Vercel Analytics (free)                │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**เหตุผลที่ Supabase เหมาะมากกับ project นี้:**

- Auth สำเร็จรูป ไม่ต้อง build เอง
- Realtime subscriptions = ตอบโจทย์ real-time bracket update
- RLS = ไม่ต้องเขียน authorization layer เอง
- Storage = เก็บ logo, player images ได้เลย
- Free tier เพียงพอสำหรับ MVP

---

## 2. Database Schema (Supabase / PostgreSQL)

sql

```
sql-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE user_role AS ENUM ('organizer', 'player');

CREATE TYPE tournament_status AS ENUM (
  'draft',
  'registration_open',
  'registration_closed',
  'in_progress',
  'completed',
  'cancelled'
);

CREATE TYPE participant_type AS ENUM ('player', 'team');

CREATE TYPE match_type AS ENUM ('ffa', 'duel');

CREATE TYPE stage_type AS ENUM (
  'single_elimination',
  'double_elimination',
  'gauntlet',
  'bracket_groups',
  'custom_bracket',
  'round_robin',
  'league',
  'swiss_system'
);

CREATE TYPE match_format AS ENUM (
  'no_game',
  'single_game',
  'home_and_away',
  'best_of',
  'fixed_game'
);

CREATE TYPE match_status AS ENUM (
  'pending',
  'ready',
  'running',
  'completed',
  'walkover',
  'cancelled'
);

CREATE TYPE participant_status AS ENUM (
  'pending',
  'approved',
  'checked_in',
  'eliminated',
  'withdrawn'
);

CREATE TYPE registration_status AS ENUM (
  'pending',
  'approved',
  'rejected',
  'cancelled'
);

CREATE TYPE registration_mode AS ENUM ('auto', 'manual');

-- ============================================================
-- TABLES
-- ============================================================

-- Users (extends Supabase Auth)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'player',
  avatar_url TEXT,
  dob DATE,
  preferred_language TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects (Organizer's container)
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Games (pre-seeded or admin-managed)
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  cover_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Platforms
CREATE TABLE platforms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  icon_url TEXT
);

-- Tournament <-> Platform (many-to-many)
CREATE TABLE tournament_platforms (
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  platform_id UUID REFERENCES platforms(id) ON DELETE CASCADE,
  PRIMARY KEY (tournament_id, platform_id)
);

-- Tournaments
CREATE TABLE tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES profiles(id),
  name TEXT NOT NULL,
  game_id UUID REFERENCES games(id),
  size INT NOT NULL CHECK (size > 0 AND size <= 256),
  participant_type participant_type NOT NULL DEFAULT 'team',
  match_type match_type NOT NULL DEFAULT 'duel',
  status tournament_status NOT NULL DEFAULT 'draft',

  -- Registration settings
  registration_enabled BOOLEAN DEFAULT FALSE,
  registration_mode registration_mode DEFAULT 'auto',
  registration_deadline TIMESTAMPTZ,

  -- Team settings (custom size)
  team_min_players INT DEFAULT 1,
  team_max_players INT DEFAULT 5,

  -- Metadata
  description TEXT,
  rules TEXT,
  prize_info TEXT,
  banner_url TEXT,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Participants (a team or individual player in a tournament)
CREATE TABLE participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id), -- null if added by organizer directly
  type participant_type NOT NULL DEFAULT 'team',
  name TEXT NOT NULL,
  main_contact_email TEXT,
  custom_user_identifier TEXT,
  team_identifier TEXT,
  logo_url TEXT,
  seed INT,
  status participant_status NOT NULL DEFAULT 'pending',
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Players (members within a team participant)
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  custom_user_identifier TEXT,
  image_url TEXT,
  is_captain BOOLEAN DEFAULT FALSE,
  position INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stages
CREATE TABLE stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  number INT NOT NULL DEFAULT 1,
  name TEXT NOT NULL DEFAULT 'Stage',
  stage_type stage_type NOT NULL,
  size INT,
  has_third_place_match BOOLEAN DEFAULT FALSE,

  -- Match format
  format match_format NOT NULL DEFAULT 'single_game',
  best_of_value INT,          -- e.g., 3, 5, 7
  fixed_game_count INT,       -- for fixed_game format

  -- Advanced settings (flexible JSON)
  settings JSONB DEFAULT '{}',

  -- Placement / seeding
  placement_rules JSONB DEFAULT '{}',

  order_index INT NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rounds (within a stage)
CREATE TABLE rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_id UUID NOT NULL REFERENCES stages(id) ON DELETE CASCADE,
  name TEXT,
  number INT NOT NULL,
  group_name TEXT, -- for bracket groups / round robin groups
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Matches
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_id UUID NOT NULL REFERENCES stages(id) ON DELETE CASCADE,
  round_id UUID REFERENCES rounds(id),
  match_number INT,

  -- Participants
  participant1_id UUID REFERENCES participants(id),
  participant2_id UUID REFERENCES participants(id),
  winner_id UUID REFERENCES participants(id),

  -- Scores
  score_participant1 INT DEFAULT 0,
  score_participant2 INT DEFAULT 0,

  -- Status
  status match_status NOT NULL DEFAULT 'pending',

  -- Scheduling
  scheduled_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- Bracket linking
  next_match_id UUID REFERENCES matches(id),
  next_match_slot INT,          -- 1 or 2 (which slot winner goes to)
  next_loser_match_id UUID REFERENCES matches(id),  -- for double elim
  next_loser_match_slot INT,
  bracket_position INT,

  -- For result reporting
  reported_by UUID REFERENCES profiles(id),
  reported_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Match Games (individual games within a match, for Best-of format)
CREATE TABLE match_games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  game_number INT NOT NULL,
  score_participant1 INT DEFAULT 0,
  score_participant2 INT DEFAULT 0,
  winner_id UUID REFERENCES participants(id),
  replay_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Registrations (player/team registers for tournament)
CREATE TABLE registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id),
  participant_id UUID REFERENCES participants(id),
  status registration_status NOT NULL DEFAULT 'pending',
  message TEXT,
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_projects_owner ON projects(owner_id);
CREATE INDEX idx_tournaments_project ON tournaments(project_id);
CREATE INDEX idx_tournaments_status ON tournaments(status);
CREATE INDEX idx_tournaments_game ON tournaments(game_id);
CREATE INDEX idx_participants_tournament ON participants(tournament_id);
CREATE INDEX idx_players_participant ON players(participant_id);
CREATE INDEX idx_stages_tournament ON stages(tournament_id);
CREATE INDEX idx_rounds_stage ON rounds(stage_id);
CREATE INDEX idx_matches_stage ON matches(stage_id);
CREATE INDEX idx_matches_round ON matches(round_id);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_registrations_tournament ON registrations(tournament_id);
CREATE INDEX idx_registrations_user ON registrations(user_id);
```

---

## 3. Row Level Security (RLS) Strategy

sql

```
sql-- ============================================================
-- RLS Policies — สำคัญมากสำหรับ Supabase
-- ============================================================

-- Profiles: ใครก็อ่านได้, แก้ไขได้เฉพาะตัวเอง
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Projects: owner เท่านั้นจัดการ, public อ่านได้
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read projects" ON projects FOR SELECT USING (true);
CREATE POLICY "Owner manages projects" ON projects
  FOR ALL USING (auth.uid() = owner_id);

-- Tournaments: organizer (project owner) จัดการ, public อ่านได้
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read tournaments" ON tournaments FOR SELECT USING (true);
CREATE POLICY "Owner manages tournaments" ON tournaments FOR ALL USING (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = tournaments.project_id
    AND projects.owner_id = auth.uid()
  )
);

-- Participants: public อ่านได้, organizer จัดการ + player ลงทะเบียนเอง
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read participants" ON participants FOR SELECT USING (true);
CREATE POLICY "Organizer manages participants" ON participants FOR ALL USING (
  EXISTS (
    SELECT 1 FROM tournaments
    JOIN projects ON projects.id = tournaments.project_id
    WHERE tournaments.id = participants.tournament_id
    AND projects.owner_id = auth.uid()
  )
);
CREATE POLICY "Players insert own participants" ON participants
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Matches: public อ่านได้, organizer + involved players แก้ได้
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read matches" ON matches FOR SELECT USING (true);
CREATE POLICY "Organizer manages matches" ON matches FOR ALL USING (
  EXISTS (
    SELECT 1 FROM stages
    JOIN tournaments ON tournaments.id = stages.tournament_id
    JOIN projects ON projects.id = tournaments.project_id
    WHERE stages.id = matches.stage_id
    AND projects.owner_id = auth.uid()
  )
);

-- Registrations: user ลงทะเบียนเอง, organizer approve
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own registrations" ON registrations
  FOR SELECT USING (auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM tournaments
      JOIN projects ON projects.id = tournaments.project_id
      WHERE tournaments.id = registrations.tournament_id
      AND projects.owner_id = auth.uid()
    )
  );
CREATE POLICY "Users register" ON registrations
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

---

## 4. Project Structure

text

```
texttournament-platform/
├── app/
│   ├── [locale]/                           # i18n routing (th|en)
│   │   ├── layout.tsx                      # locale layout + providers
│   │   ├── page.tsx                        # landing page
│   │   │
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   └── layout.tsx
│   │   │
│   │   ├── (public)/
│   │   │   ├── tournaments/
│   │   │   │   ├── page.tsx                # browse all tournaments
│   │   │   │   ├── [id]/
│   │   │   │   │   ├── page.tsx            # tournament detail
│   │   │   │   │   ├── bracket/page.tsx
│   │   │   │   │   ├── standings/page.tsx
│   │   │   │   │   ├── matches/page.tsx
│   │   │   │   │   └── register/page.tsx
│   │   │   │   └── layout.tsx
│   │   │   └── games/
│   │   │       ├── page.tsx
│   │   │       └── [slug]/page.tsx
│   │   │
│   │   ├── (organizer)/
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── projects/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx
│   │   │   │       ├── settings/page.tsx
│   │   │   │       └── tournaments/
│   │   │   │           ├── new/page.tsx
│   │   │   │           └── [tournamentId]/
│   │   │   │               ├── page.tsx
│   │   │   │               ├── settings/page.tsx
│   │   │   │               ├── participants/
│   │   │   │               │   ├── page.tsx
│   │   │   │               │   └── [participantId]/page.tsx
│   │   │   │               ├── stages/
│   │   │   │               │   ├── page.tsx
│   │   │   │               │   ├── new/page.tsx
│   │   │   │               │   └── [stageId]/
│   │   │   │               │       ├── configure/page.tsx
│   │   │   │               │       └── bracket/page.tsx
│   │   │   │               ├── registrations/page.tsx
│   │   │   │               └── results/page.tsx
│   │   │   └── layout.tsx
│   │   │
│   │   └── (player)/
│   │       ├── profile/page.tsx
│   │       ├── my-tournaments/page.tsx
│   │       └── layout.tsx
│   │
│   ├── api/                                # API routes (if needed beyond Supabase)
│   │   ├── tournaments/
│   │   │   └── [id]/generate-bracket/route.ts
│   │   └── matches/
│   │       └── [id]/report/route.ts
│   │
│   └── layout.tsx
│
├── components/
│   ├── ui/                                 # shadcn/ui components
│   ├── bracket/
│   │   ├── BracketView.tsx                 # main bracket renderer
│   │   ├── SingleElimination.tsx
│   │   ├── DoubleElimination.tsx
│   │   ├── RoundRobin.tsx
│   │   ├── MatchCard.tsx
│   │   └── ConnectorLines.tsx
│   ├── tournament/
│   │   ├── TournamentCard.tsx
│   │   ├── TournamentList.tsx
│   │   ├── TournamentSetupWizard.tsx
│   │   └── StageConfigForm.tsx
│   ├── participant/
│   │   ├── ParticipantForm.tsx
│   │   ├── PlayerFields.tsx
│   │   └── ParticipantList.tsx
│   ├── registration/
│   │   ├── RegistrationForm.tsx
│   │   └── RegistrationList.tsx
│   └── shared/
│       ├── Navbar.tsx
│       ├── Footer.tsx
│       ├── LanguageSwitcher.tsx
│       ├── ImageUpload.tsx
│       └── LoadingStates.tsx
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                       # browser client
│   │   ├── server.ts                       # server client
│   │   └── middleware.ts                   # auth middleware
│   ├── bracket-engine/
│   │   ├── index.ts
│   │   ├── single-elimination.ts           ★ core algorithm
│   │   ├── double-elimination.ts           ★ core algorithm
│   │   ├── round-robin.ts
│   │   ├── swiss-system.ts
│   │   ├── seeding.ts                      # seed calculation
│   │   └── types.ts
│   ├── i18n/
│   │   ├── request.ts
│   │   └── navigation.ts
│   └── utils.ts
│
├── messages/
│   ├── th.json                             # Thai translations
│   └── en.json                             # English translations
│
├── stores/
│   ├── tournament-store.ts
│   └── bracket-store.ts
│
├── hooks/
│   ├── useTournament.ts
│   ├── useRealtimeMatch.ts                 # Supabase realtime hook
│   └── useBracket.ts
│
├── types/
│   ├── database.ts                         # Supabase generated types
│   ├── tournament.ts
│   ├── participant.ts
│   ├── match.ts
│   └── bracket.ts
│
├── supabase/
│   ├── migrations/                         # SQL migrations
│   └── seed.sql                            # seed data (games, platforms)
│
├── public/
│   └── images/
│
├── tailwind.config.ts
├── next.config.ts
├── middleware.ts                            # Next.js middleware (locale + auth)
├── .env.local
└── package.json
```

---

## 5. Bracket Engine Design (Core Logic)

text

```
text┌──────────────────────────────────────────────────────────────┐
│              BRACKET ENGINE — Architecture                    │
│                                                              │
│  Pure functions, no DB dependency, easy to test              │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐     │
│  │  Input                                               │     │
│  │  {                                                   │     │
│  │    participants: Participant[]  (sorted by seed)     │     │
│  │    config: StageConfig                                │     │
│  │    {                                                 │     │
│  │      type: 'single_elimination'                      │     │
│  │      size: 16                                        │     │
│  │      hasThirdPlaceMatch: true                        │     │
│  │      format: 'best_of'                               │     │
│  │      bestOfValue: 3                                  │     │
│  │    }                                                 │     │
│  │  }                                                   │     │
│  └──────────────────────┬──────────────────────────────┘     │
│                         │                                    │
│                         ▼                                    │
│  ┌─────────────────────────────────────────────────────┐     │
│  │  1. Seed Participants                                │     │
│  │     - Standard seeding (1v16, 8v9, 4v13, 5v12...)   │     │
│  │     - or Random shuffle                              │     │
│  │     - Pad with BYEs to next power of 2              │     │
│  └──────────────────────┬──────────────────────────────┘     │
│                         │                                    │
│                         ▼                                    │
│  ┌─────────────────────────────────────────────────────┐     │
│  │  2. Generate Rounds                                  │     │
│  │     log2(size) rounds for single elim                │     │
│  │     Round names: Quarter, Semi, Final (auto naming)  │     │
│  └──────────────────────┬──────────────────────────────┘     │
│                         │                                    │
│                         ▼                                    │
│  ┌─────────────────────────────────────────────────────┐     │
│  │  3. Generate Matches                                 │     │
│  │     - Assign participants to Round 1 matches         │     │
│  │     - Set next_match_id pointers                     │     │
│  │     - Set next_match_slot (1 or 2)                   │     │
│  │     - For double elim: also set loser bracket links  │     │
│  └──────────────────────┬──────────────────────────────┘     │
│                         │                                    │
│                         ▼                                    │
│  ┌─────────────────────────────────────────────────────┐     │
│  │  Output                                              │     │
│  │  {                                                   │     │
│  │    rounds: Round[]                                   │     │
│  │    matches: Match[] (with all linkages)              │     │
│  │    byeParticipants: Participant[] (auto-win)         │     │
│  │  }                                                   │     │
│  └─────────────────────────────────────────────────────┘     │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

text

```
text=== SINGLE ELIMINATION EXAMPLE (8 participants) ===

Round 1 (QF)        Round 2 (SF)        Round 3 (F)
┌──────────┐
│ Seed 1   │──┐
│ Seed 8   │──┤
└──────────┘  │     ┌──────────┐
              ├─────│ Winner A │──┐
┌──────────┐  │     │ Winner B │──┤
│ Seed 4   │──┤     └──────────┘  │
│ Seed 5   │──┘                   │     ┌──────────┐
└──────────┘                      ├─────│  FINAL   │
┌──────────┐                      │     │          │
│ Seed 2   │──┐                   │     └──────────┘
│ Seed 7   │──┤     ┌──────────┐  │
└──────────┘  ├─────│ Winner C │──┤
              │     │ Winner D │──┘
┌──────────┐  │     └──────────┘
│ Seed 3   │──┤
│ Seed 6   │──┘
└──────────┘

=== DOUBLE ELIMINATION — Structure ===

WINNERS BRACKET                    LOSERS BRACKET
(Winners advance, losers drop)     (Second chance)

R1    R2    R3(WF)                 LR1   LR2   LR3(LF)
W1──┐                              L1──┐
W2──┤──W5─┐                         L2──┤──L5─┐
W3──┘     ├──W7                       L3──┘     ├──L7
W4──┐  W6─┘                         L4──┐  L6─┘
W5──┤──┘                              L5──┤──┘
                                      (losers from WR2 drop here)

                              GRAND FINAL
                              ┌──────────────┐
                              │ WF Winner    │
                              │ vs           │
                              │ LF Winner    │
                              │              │
                              │ (If LF wins  │
                              │  → Reset     │
                              │  match)      │
                              └──────────────┘
```

---

## 6. API Layer Design (Supabase Client-side)

text

```
text┌───────────────────────────────────────────────────────────┐
│           API Architecture with Supabase                   │
│                                                           │
│  Client (React) ──→ Supabase JS Client ──→ PostgreSQL     │
│                    (with RLS)                             │
│                                                           │
│  ใช้ Supabase client โดยตรงสำหรับ CRUD ปกติ              │
│  ใช้ Next.js API Routes สำหรับ:                           │
│  - Bracket generation (complex logic)                     │
│  - Match result + auto-advance (transaction)              │
│  - Anything that needs service_role key                   │
└───────────────────────────────────────────────────────────┘
```

typescript

```
typescript// lib/supabase/client.ts — Browser client
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// lib/supabase/server.ts — Server client
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}
```

text

```
text=== Key API Interactions ===

Organizer Flow:
  1. Create project       → supabase.from('projects').insert(...)
  2. Create tournament    → supabase.from('tournaments').insert(...)
  3. Add participants     → supabase.from('participants').insert(...)
  4. Add players          → supabase.from('players').insert(...)
  5. Configure stage      → supabase.from('stages').insert(...)
  6. Generate bracket     → POST /api/tournaments/[id]/generate-bracket
  7. Update match result  → PATCH /api/matches/[id]/report
                            (triggers auto-advance via DB function)

Player Flow:
  1. Browse tournaments   → supabase.from('tournaments').select(...)
                            .in('status', ['registration_open', ...])
  2. Register             → supabase.from('registrations').insert(...)
  3. View my tournaments  → supabase.from('registrations').select(...)
                            .eq('user_id', userId)
  4. View bracket         → supabase.from('matches').select(...)
                            (with realtime subscription)

Realtime:
  supabase
    .channel('matches')
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'matches',
      filter: `stage_id=eq.${stageId}`
    }, handleMatchUpdate)
    .subscribe()
```

---

## 7. MVP Scope — ตัดสินใจเด็ดขาด

text

```
text┌──────────────────────────────────────────────────────────────┐
│                    1-MONTH MVP SCOPE                          │
│                                                              │
│  สิ่งที่ต้องยอมรับ:                                          │
│  1 เดือน solo dev = ~20 working days                         │
│  ต้องตัด stage type ให้เหลือเท่าที่ทำได้จริง                 │
└──────────────────────────────────────────────────────────────┘

✅ MVP — ทำเลย (Phase 1)
══════════════════════
  Authentication
    ✅ Register (nickname, email, password, dob)
    ✅ Login / Logout
    ✅ Role: organizer / player (เลือกตอน register)

  Organizer
    ✅ Project CRUD
    ✅ Tournament CRUD (name, game, platforms, size, participant type)
    ✅ Tournament setup wizard (basic flow)
    ✅ Participant management (add, edit, delete)
    ✅ Player management (within team, custom size)
    ✅ Registration settings (enable/disable, auto/manual)
    ✅ Registration approval workflow

  Stages & Bracket (MVP subset)
    ✅ Single Elimination ← ใช้บ่อยที่สุด
    ✅ Double Elimination ← ยอดนิยม
    ✅ Round Robin        ← logic ไม่ซับซ้อน
    ✅ Match format: single game, best of, no game
    ✅ Configure: number, name, size, 3rd/4th match
    ✅ Generate bracket → create matches automatically
    ✅ Match result reporting (organizer primary)
    ✅ Auto-advance winner to next match

  Player
    ✅ Browse tournaments (filter: game, status)
    ✅ Tournament detail page
    ✅ Registration form
    ✅ View bracket (with realtime update)
    ✅ My tournaments page

  Platform
    ✅ i18n (TH + EN)
    ✅ Responsive design
    ✅ Supabase Realtime for bracket updates
    ✅ Image upload (logo, avatar) via Supabase Storage


⏳ Phase 2 — หลัง MVP (เดือนที่ 2)
════════════════════════════════════
  ❌ Swiss System
  ❌ Gauntlet
  ❌ Bracket Groups
  ❌ Custom Bracket
  ❌ League
  ❌ Player result reporting
  ❌ Advanced stage config (placement rules, advanced settings)
  ❌ Seeding UI (drag & drop)
  ❌ Email notifications
  ❌ Check-in system
  ❌ Statistics / standings export
```

---

## 8. Detailed 4-Week Sprint Plan

text

```
text┌──────────────────────────────────────────────────────────────┐
│                   WEEK 1: FOUNDATION                          │
│                   วันที่ 1-5                                  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Day 1: Project Setup                                        │
│  ├── npx create-next-app (App Router, TS, Tailwind)          │
│  ├── Install: supabase, shadcn/ui, next-intl, zod,          │
│  │   react-hook-form, zustand                                │
│  ├── Setup Supabase project (get URL + anon key)             │
│  ├── Configure next-intl (TH + EN)                           │
│  └── Setup folder structure                                  │
│                                                              │
│  Day 2: Database + Auth                                      │
│  ├── Run migration: create all tables (from schema above)    │
│  ├── Setup RLS policies                                      │
│  ├── Auth pages: Register + Login                            │
│  ├── Profile creation on signup (DB trigger)                 │
│  └── Auth middleware (protect organizer routes)              │
│                                                              │
│  Day 3: UI Foundation                                        │
│  ├── Navbar (with language switcher, auth state)             │
│  ├── Landing page (basic)                                    │
│  ├── Setup shadcn/ui components                              │
│  └── Responsive layout foundation                            │
│                                                              │
│  Day 4: Project & Tournament CRUD                            │
│  ├── Project list page                                       │
│  ├── Create project form                                     │
│  ├── Project detail page                                     │
│  └── Tournament create form (basic info)                     │
│                                                              │
│  Day 5: Tournament Setup                                     │
│  ├── Tournament setup wizard UI (multi-step)                 │
│  ├── Step 1: Basic info (name, game, platform, size)         │
│  ├── Step 2: Participant type (player/team) + match type     │
│  ├── Games & Platforms seed data                             │
│  └── Tournament detail page (tabs)                           │
│                                                              │
│  DELIVERABLE: Auth works, can create project + tournament    │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                   WEEK 2: PARTICIPANTS + REGISTRATION        │
│                   วันที่ 6-10                                │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Day 6: Participant Management                               │
│  ├── Participant list page (within tournament)               │
│  ├── Add participant form                                    │
│  │   ├── name, main_contact_email                            │
│  │   ├── custom_user_identifier, team_identifier             │
│  │   └── logo upload (Supabase Storage)                      │
│  ├── Edit / Delete participant                               │
│  └── Player management (add/edit/delete players in team)     │
│                                                              │
│  Day 7: Player Fields + Seeding                              │
│  ├── Player fields: name, email, custom_id, image            │
│  ├── Dynamic player add (1 to team_max_players)              │
│  ├── Seed assignment (manual input number)                   │
│  ├── Random seed button                                      │
│  └── Participant list with seed column + sort                │
│                                                              │
│  Day 8: Registration System                                  │
│  ├── Tournament registration settings (enable, mode,         │
│  │   deadline)                                                │
│  ├── Player: Registration form                               │
│  ├── Registration list (organizer view)                      │
│  ├── Approve / Reject workflow                               │
│  └── Auto-approve logic (create participant immediately)     │
│                                                              │
│  Day 9: Player Browse                                        │
│  ├── Public tournament list page                             │
│  │   ├── Filter: game, status (upcoming/running/completed)   │
│  │   ├── Search                                               │
│  │   └── Pagination                                           │
│  ├── Tournament detail (public view)                         │
│  ├── Game list page                                          │
│  └── Game → tournaments page                                 │
│                                                              │
│  Day 10: Player Dashboard + Polish                           │
│  ├── My tournaments page (player)                            │
│  ├── Registration status tracking                            │
│  ├── i18n: translate all pages (TH + EN)                     │
│  └── Responsive fixes                                        │
│                                                              │
│  DELIVERABLE: Full participant + registration flow works     │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                   WEEK 3: STAGE & BRACKET ENGINE ★            │
│                   วันที่ 11-15                               │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Day 11: Stage Configuration UI                              │
│  ├── Stage list page (within tournament)                     │
│  ├── Create stage form                                       │
│  │   ├── Stage type selector (3 types for MVP)               │
│  │   ├── General: number, name, size                         │
│  │   ├── Match settings: format, best_of_value               │
│  │   └── 3rd/4th place match toggle                          │
│  └── Edit stage                                              │
│                                                              │
│  Day 12: Bracket Engine — Single Elimination ★               │
│  ├── lib/bracket-engine/single-elimination.ts                │
│  │   ├── Seed participants (standard seeding)                │
│  │   ├── Pad to power of 2 (BYEs)                           │
│  │   ├── Generate rounds                                     │
│  │   ├── Generate matches with next_match pointers           │
│  │   └── Handle 3rd place match                              │
│  ├── API route: POST /api/stages/[id]/generate               │
│  ├── Unit tests for bracket generation                       │
│  └── Test with 4, 8, 16, 32 participants                    │
│                                                              │
│  Day 13: Bracket Engine — Double Elimination ★               │
│  ├── lib/bracket-engine/double-elimination.ts                │
│  │   ├── Winners bracket (same as single elim)               │
│  │   ├── Losers bracket generation                           │
│  │   │   (losers from winners bracket R(N) drop to           │
│  │   │    losers bracket R(N*2-1) and R(N*2))                │
│  │   ├── Loser match linking                                 │
│  │   └── Grand Final + reset logic                           │
│  └── Unit tests                                              │
│                                                              │
│  Day 14: Bracket Engine — Round Robin                        │
│  ├── lib/bracket-engine/round-robin.ts                       │
│  │   ├── Generate all pairings (circle method)               │
│  │   ├── n*(n-1)/2 matches                                   │
│  │   ├── Group support (optional)                            │
│  │   └── Standings calculation (W/L/Points)                  │
│  └── Unit tests                                              │
│                                                              │
│  Day 15: Bracket Visualization                               │
│  ├── BracketView.tsx — main component                        │
│  ├── Single elimination bracket render                       │
│  │   ├── Rounds as columns                                   │
│  │   ├── Match cards (team names, scores)                    │
│  │   ├── Connector lines between matches                     │
│  │   └── Responsive (horizontal scroll on mobile)            │
│  ├── Double elimination bracket render                       │
│  │   ├── Winners bracket (top)                               │
│  │   ├── Losers bracket (bottom)                             │
│  │   └── Grand Final (right side)                            │
│  └── Round robin standings table                             │
│                                                              │
│  DELIVERABLE: Can generate bracket, visualize it             │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                   WEEK 4: MATCHES, RESULTS, POLISH            │
│                   วันที่ 16-20                               │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Day 16: Match Management                                    │
│  ├── Match detail view (within bracket click)                │
│  ├── Match list page (within tournament)                     │
│  ├── Score update form (organizer)                           │
│  │   ├── For best_of: individual game scores                 │
│  │   └── Overall score + winner selection                    │
│  └── Match status updates                                    │
│                                                              │
│  Day 17: Auto-Advance + Result Flow                          │
│  ├── DB function/trigger: on match complete →                │
│  │   1. Update winner → next_match participant slot           │
│  │   2. Update loser → next_loser_match (double elim)        │
│  │   3. Check if next match is ready (both slots filled)     │
│  │   4. Update bracket in realtime                           │
│  ├── Player result reporting (basic)                         │
│  │   ├── Player submits score                                │
│  │   └── Organizer confirms (cross-check)                    │
│  └── Walkover handling                                       │
│                                                              │
│  Day 18: Realtime + Polish                                   │
│  ├── Supabase Realtime subscription on matches               │
│  │   └── When match updates → bracket re-renders live        │
│  ├── Tournament status flow (draft → reg_open →              │
│  │   reg_closed → in_progress → completed)                   │
│  ├── Organizer dashboard (overview stats)                    │
│  └── Loading states, error handling                          │
│                                                              │
│  Day 19: i18n + Responsive + UX                              │
│  ├── Complete TH + EN translations                           │
│  ├── Mobile responsive audit                                 │
│  ├── Tournament setup wizard polish                          │
│  ├── Empty states (no tournaments, no participants)          │
│  └── Form validation (Zod) everywhere                        │
│                                                              │
│  Day 20: Testing + Deploy                                    │
│  ├── Manual testing of all flows                             │
│  ├── Fix critical bugs                                       │
│  ├── Environment variables setup                             │
│  ├── Deploy to Vercel                                        │
│  ├── Test production                                         │
│  └── README / basic documentation                            │
│                                                              │
│  DELIVERABLE: MVP deployed and usable                        │
└──────────────────────────────────────────────────────────────┘
```

---

## 9. Key Implementation Patterns

### Tournament Setup Wizard State

typescript

```
typescript// stores/tournament-store.ts
interface TournamentWizardState {
  // Step 1: Basic Info
  name: string
  gameId: string
  platformIds: string[]
  size: number           // max 256
  participantType: 'player' | 'team'
  matchType: 'ffa' | 'duel'
  teamMinPlayers: number
  teamMaxPlayers: number

  // Step 2: Registration
  registrationEnabled: boolean
  registrationMode: 'auto' | 'manual'
  registrationDeadline: string | null

  // Step 3: Stages
  stages: StageConfig[]

  // Navigation
  currentStep: number
  setStep: (step: number) => void
  // ... actions
}
```

### Realtime Match Hook

typescript

```
typescript// hooks/useRealtimeMatch.ts
'use client'
import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useRealtimeMatch(stageId: string, onUpdate: (match: Match) => void) {
  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel(`matches:stage:${stageId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'matches',
        filter: `stage_id=eq.${stageId}`,
      }, (payload) => {
        onUpdate(payload.new as Match)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [stageId, onUpdate])
}
```

### Auto-Advance Logic (API Route)

typescript

```
typescript// app/api/matches/[id]/report/route.ts
import { createClient } from '@/lib/supabase/server'

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { score1, score2 } = await request.json()
  const matchId = params.id

  // 1. Update match score
  const winnerId = score1 > score2 ? 'participant1_id' : 'participant2_id'

  const { data: match } = await supabase
    .from('matches')
    .update({
      score_participant1: score1,
      score_participant2: score2,
      winner_id: winnerId,  // resolved to actual participant ID
      status: 'completed',
      completed_at: new Date().toISOString(),
    })
    .eq('id', matchId)
    .select()
    .single()

  // 2. Advance winner to next match
  if (match.next_match_id) {
    const slot = match.next_match_slot // 1 or 2
    await supabase
      .from('matches')
      .update({
        [`participant${slot}_id`]: match.winner_id,
        status: 'ready', // if both slots filled
      })
      .eq('id', match.next_match_id)
  }

  // 3. Send loser to losers bracket (double elim)
  if (match.next_loser_match_id) {
    const loserId = match.winner_id === match.participant1_id
      ? match.participant2_id
      : match.participant1_id
    const slot = match.next_loser_match_slot

    await supabase
      .from('matches')
      .update({ [`participant${slot}_id`]: loserId })
      .eq('id', match.next_loser_match_id)
  }

  // 4. Supabase Realtime จะ broadcast การเปลี่ยนแปลงอัตโนมัติ
  return Response.json({ success: true })
}
```

---

## 10. Risk Mitigation

text

```
text┌────────────────────────┬──────────────────────────────────────┐
│ Risk                   │ Mitigation                           │
├────────────────────────┼──────────────────────────────────────┤
│ Bracket engine bugs    │ Write unit tests FIRST for each      │
│ (most complex part)    │ bracket type. Test with 4,8,16,32    │
│                        │ participants. Edge cases: odd nums,  │
│                        │ byes, 1 participant                  │
├────────────────────────┼──────────────────────────────────────┤
│ Double elim is very    │ If stuck, defer to Phase 2.          │
│ complex                │ Ship single elim + round robin first │
├────────────────────────┼──────────────────────────────────────┤
│ 1 month too tight      │ Cut scope ruthlessly. 3 stage types  │
│                        │ max for MVP. No advanced configs.    │
├────────────────────────┼──────────────────────────────────────┤
│ Supabase free tier     │ 500MB is enough for MVP.             │
│ limits                 │ Monitor usage. Cache queries.        │
├────────────────────────┼──────────────────────────────────────┤
│ i18n adds overhead     │ Use next-intl. Do EN first,          │
│                        │ TH translation in batch at the end   │
├────────────────────────┼──────────────────────────────────────┤
│ Realtime performance   │ Supabase realtime is per-table.      │
│                        │ Only subscribe to matches for the    │
│                        │ current stage, not all matches       │
├────────────────────────┼──────────────────────────────────────┤
│ Bracket visualization  │ Use proven library (react-bracket)   │
│ is hard                │ or simple CSS grid. Don't overthink. │
└────────────────────────┴──────────────────────────────────────┘
```

---

## 11. Quick Wins ที่ช่วยประหยัดเวลา

| วิธี                                  | ประหยัดเวลา                          |
| ------------------------------------- | ------------------------------------ |
| **shadcn/ui**— copy-paste components  | ~2-3 วัน ไม่ต้อง build UI จากศูนย์   |
| **Supabase Auth**— สำเร็จรูป          | ~2 วัน ไม่ต้อง build auth เอง        |
| **Supabase RLS**— authorization ใน DB | ~2 วัน ไม่ต้องเขียน middleware เอง   |
| **next-intl**— i18n library           | ~1 วัน setup แล้วใช้ได้ทั้ง project  |
| **react-hook-form + Zod**             | ~1 วัน form handling ทั้งหมด         |
| **Supabase Realtime**— แค่ subscribe  | ~0.5 วัน ไม่ต้อง build WebSocket เอง |
