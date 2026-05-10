# UI/UX Design System — Samutprakan Esport Association

markdown

````
markdown# UI Design System — Samutprakan Esport Association

## 1. Design Philosophy

### Core Principles
- **Clean Modern** — minimal, elegant, อ่านง่าย inspired by Toornament
- **Dark-first** — dark mode เป็น default, light mode เป็น alternate
- **Esports-grade** — professional gaming aesthetic แต่ไม่ดุดันเกินไป
- **Content-forward** — tournament data เป็น hero, design สนับสนุนไม่แย่งซีน
- **Motion with purpose** — animation ทุกชิ้นมีเหตุผล ไม่ใช่แค่สวยงาม

### Brand Voice
- ชื่อ: **Samutprakan Esport Association**
- บุคลิก: Professional, Accessible, Competitive, Community-driven
- Typography mood: Modern Thai-tech hybrid

---

## 2. Color System

### 2.1 Core Palette

```css
:root {
  /* === PRIMARY — Off-white muted (60%) === */
  --primary-50:  #f8f7f5;   /* lightest, subtle background */
  --primary-100: #f0eeea;   /* card background (light mode) */
  --primary-200: #e4e1dc;   /* borders, dividers */
  --primary-300: #d5d1ca;   /* disabled text */
  --primary-400: #b8b3ab;   /* placeholder text */
  --primary-500: #9a9489;   /* muted body text (light mode) */
  --primary-600: #7a756b;   /* secondary text */
  --primary-700: #5c5850;   /* primary text (light mode) */
  --primary-800: #3d3a34;   /* headings (light mode) */
  --primary-900: #1f1d1a;   /* darkest text */

  /* === SECONDARY — Bright Coke Red (30%) === */
  --secondary-50:  #fef2f2;
  --secondary-100: #fee2e2;
  --secondary-200: #fecaca;
  --secondary-300: #fca5a5;
  --secondary-400: #f87171;
  --secondary-500: #ef4444;
  --secondary-600: #dc2626;
  --secondary-700: #f40009;   /* ★ PRIMARY BRAND COLOR (Coke Red) */
  --secondary-800: #b90010;
  --secondary-900: #93000d;
  --secondary-950: #4a0006;

  /* === ACCENT — Dark Gray (10%) === */
  --accent-50:  #f6f6f6;
  --accent-100: #e7e7e7;
  --accent-200: #d1d1d1;
  --accent-300: #b0b0b0;
  --accent-400: #888888;
  --accent-500: #6d6d6d;
  --accent-600: #5d5d5d;
  --accent-700: #4f4f4f;
  --accent-800: #454545;
  --accent-900: #3d3d3d;
  --accent-950: #1a1a1a;
}
````

### 2.2 Dark Theme (Default)

css

```
css[data-theme="dark"] {
  /* Backgrounds */
  --bg-primary:     #0a0a0c;      /* deepest background */
  --bg-secondary:   #111114;      /* card background */
  --bg-tertiary:    #1a1a1e;      /* elevated surface */
  --bg-quaternary:  #222228;      /* hover state, input background */
  --bg-overlay:     rgba(0, 0, 0, 0.7);

  /* Text */
  --text-primary:   #f0eeea;      /* primary-50, main text */
  --text-secondary: #b8b3ab;      /* primary-400, secondary text */
  --text-tertiary:  #7a756b;      /* primary-600, muted text */
  --text-disabled:  #5c5850;      /* primary-700 */

  /* Brand */
  --brand-primary:   #f40009;     /* Coke Red */
  --brand-hover:     #ff333b;     /* lighter on hover */
  --brand-active:    #d60008;     /* darker on active */
  --brand-subtle:    rgba(244, 0, 9, 0.12);  /* background tint */
  --brand-glow:      rgba(244, 0, 9, 0.4);   /* glow effects */

  /* Borders */
  --border-primary:   rgba(255, 255, 255, 0.08);
  --border-secondary: rgba(255, 255, 255, 0.04);
  --border-hover:     rgba(244, 0, 9, 0.3);
  --border-active:    rgba(244, 0, 9, 0.6);

  /* Semantic */
  --success:        #22c55e;
  --success-subtle: rgba(34, 197, 94, 0.12);
  --warning:        #f59e0b;
  --warning-subtle: rgba(245, 158, 11, 0.12);
  --error:          #ef4444;
  --error-subtle:   rgba(239, 68, 68, 0.12);
  --info:           #3b82f6;
  --info-subtle:    rgba(59, 130, 246, 0.12);
}
```

### 2.3 Light Theme

css

```
css[data-theme="light"] {
  /* Backgrounds */
  --bg-primary:     #f8f7f5;      /* primary-50 */
  --bg-secondary:   #ffffff;      /* card background */
  --bg-tertiary:    #f0eeea;      /* elevated surface */
  --bg-quaternary:  #e4e1dc;      /* hover state */
  --bg-overlay:     rgba(0, 0, 0, 0.4);

  /* Text */
  --text-primary:   #1f1d1a;      /* primary-900 */
  --text-secondary: #5c5850;      /* primary-700 */
  --text-tertiary:  #9a9489;      /* primary-500 */
  --text-disabled:  #b8b3ab;      /* primary-400 */

  /* Brand — works on both themes */
  --brand-primary:   #f40009;
  --brand-hover:     #d60008;
  --brand-active:    #b30006;
  --brand-subtle:    rgba(244, 0, 9, 0.08);
  --brand-glow:      rgba(244, 0, 9, 0.2);

  /* Borders */
  --border-primary:   rgba(0, 0, 0, 0.1);
  --border-secondary: rgba(0, 0, 0, 0.05);
  --border-hover:     rgba(244, 0, 9, 0.3);
  --border-active:    rgba(244, 0, 9, 0.6);

  /* Semantic — slightly darker for light bg contrast */
  --success:        #16a34a;
  --success-subtle: rgba(22, 163, 74, 0.08);
  --warning:        #d97706;
  --warning-subtle: rgba(217, 119, 6, 0.08);
  --error:          #dc2626;
  --error-subtle:   rgba(220, 38, 38, 0.08);
  --info:           #2563eb;
  --info-subtle:    rgba(37, 99, 235, 0.08);
}
```

### 2.4 Color Usage Rules

text

```
text┌─────────────────────────────────────────────────────────────┐
│                    COLOR HIERARCHY                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  60% — Off-white muted                                      │
│  ├── Page backgrounds                                       │
│  ├── Card surfaces                                          │
│  ├── Text (primary, secondary, tertiary)                    │
│  └── Borders, dividers                                      │
│                                                             │
│  30% — Coke Red #F40009                                     │
│  ├── Primary buttons (CTA)                                  │
│  ├── Active states, selected tabs                           │
│  ├── Links (hover state)                                    │
│  ├── Status badges (live, in-progress)                      │
│  ├── Accent borders                                         │
│  └── Glow effects, highlights                               │
│                                                             │
│  10% — Dark Gray                                            │
│  ├── Navbar background                                      │
│  ├── Sidebar background                                     │
│  ├── Footer background                                      │
│  ├── Secondary buttons                                      │
│  ├── Input backgrounds                                      │
│  └── Code blocks, technical info                            │
│                                                             │
│  Semantic (supplementary)                                   │
│  ├── Green  — completed, won, success                       │
│  ├── Amber  — pending, upcoming, warning                    │
│  ├── Red    — error, eliminated, cancelled                  │
│  └── Blue   — info, running, in-progress (alt)              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2.5 Tournament Status Colors

text

```
text  draft              →  --text-tertiary   (gray, muted)
  registration_open  →  --success         (green, active)
  registration_closed→  --warning         (amber, waiting)
  in_progress        →  --brand-primary   (coke red, live)
  completed          →  --text-tertiary   (gray, done)
  cancelled          →  --error           (red, dead)
```

---

## 3. Typography

### 3.1 Font Stack

css

```
css/* Display / Headings — Kanit (Thai + Latin support) */
/* Body / UI — Inter (excellent readability) */

@import url('https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap');

:root {
  --font-display: 'Kanit', sans-serif;
  --font-body:    'Inter', sans-serif;
  --font-mono:    'JetBrains Mono', 'Fira Code', monospace;
}
```

**Kanit** — ใช้สำหรับ:

- Page headings (H1-H3)
- Tournament names
- Navigation links
- Buttons (uppercase variant)
- Hero section text
- Stats/numbers

**Inter** — ใช้สำหรับ:

- Body text
- Form labels & inputs
- Table content
- Descriptions
- Captions & metadata
- Sidebar menu items

### 3.2 Type Scale

text

```
text┌──────────────────────────────────────────────────────────────────────┐
│                      TYPOGRAPHY SCALE                                 │
├──────────┬────────┬────────┬──────────┬──────────┬──────────────────┤
│ Name     │ Size   │ Weight │ Line H   │ Letter   │ Usage            │
│          │ (px)   │        │          │ Spacing  │                  │
├──────────┼────────┼────────┼──────────┼──────────┼──────────────────┤
│ display  │ 64     │ 800    │ 1.1      │ -0.02em  │ Hero headings    │
│ h1       │ 40     │ 700    │ 1.2      │ -0.01em  │ Page titles      │
│ h2       │ 32     │ 600    │ 1.25     │ -0.01em  │ Section titles   │
│ h3       │ 24     │ 600    │ 1.3      │  0       │ Card titles      │
│ h4       │ 20     │ 600    │ 1.4      │  0       │ Sub-sections     │
│ body-lg  │ 18     │ 400    │ 1.6      │  0       │ Featured text    │
│ body     │ 16     │ 400    │ 1.6      │  0       │ Default body     │
│ body-md  │ 15     │ 400    │ 1.5      │  0       │ Minimum UI text  │
│ caption  │ 13     │ 500    │ 1.4      │ 0.02em   │ Labels, metadata │
│ overline │ 12     │ 600    │ 1.4      │ 0.08em   │ Category labels  │
└──────────┴────────┴────────┴──────────┴──────────┴──────────────────┘

> [!IMPORTANT]
> **Typography Rule:** DO NOT use `text-sm` (14px) for any primary UI labels or body content.
> For Thai language support, the minimum size must be `text-base` (16px) or `text-md` (~15-16px).
> Smaller sizes (caption/overline) are strictly for non-critical metadata.
```

### 3.3 Thai Text Adjustments

css

```
css/* Thai text needs more line-height and slightly larger size */
[lang="th"] {
  --line-height-multiplier: 1.15;
}

/* Thai body text */
[lang="th"] .body { line-height: 1.8; }
[lang="th"] .body-sm { line-height: 1.7; }

/* Kanit already optimized for Thai — no additional adjustments needed */
```

### 3.4 Typography Examples

text

```
text=== HERO SECTION ===
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                                                             │
│   COMPETE.          ← display (64px, Kanit 800, uppercase)  │
│   CONQUER.          ← display (64px, Kanit 800, uppercase)  │
│   CLAIM GLORY.      ← display (64px, Kanit 800, uppercase)  │
│                       color: --brand-primary with glow      │
│                                                             │
│   The ultimate tournament platform for                      │
│   Samutprakan Esport Association.   ← body-lg (18px, Inter) │
│                                                             │
│   [ Browse Tournaments ]  ← button                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘

=== TOURNAMENT CARD ===
┌─────────────────────────────────────────┐
│ ┌─────────────────────────────────────┐ │
│ │  BANNER IMAGE                       │ │
│ │                                     │ │
│ │  ┌──────────┐                       │ │
│ │  │ LIVE     │  ← caption (12px)     │ │
│ │  │ badge    │    bg: brand-primary  │ │
│ │  └──────────┘                       │ │
│ └─────────────────────────────────────┘ │
│                                         │
│  VALORANT COMMUNITY CUP    ← h3 (24px) │
│  Samutprakan Division      ← body-sm   │
│                                         │
│  ┌──────┐ ┌──────┐ ┌──────┐            │
│  │ PC   │ │ PS5  │ │ Xbox │ ← caption  │
│  └──────┘ └──────┘ └──────┘            │
│                                         │
│  👥 32/64 players    📅 Jan 15  ← body-sm│
│                                         │
└─────────────────────────────────────────┘
```

---

## 4. Spacing & Layout

### 4.1 Spacing Scale

css

```
css:root {
  --space-0:   0;
  --space-1:   4px;     /* tight gaps */
  --space-2:   8px;     /* small gaps, icon margins */
  --space-3:   12px;    /* compact padding */
  --space-4:   16px;    /* default padding */
  --space-5:   20px;    /* comfortable padding */
  --space-6:   24px;    /* card padding */
  --space-8:   32px;    /* section gaps */
  --space-10:  40px;    /* large section gaps */
  --space-12:  48px;    /* major sections */
  --space-16:  64px;    /* page sections */
  --space-20:  80px;    /* hero sections */
  --space-24:  96px;    /* major page breaks */
}
```

### 4.2 Grid System

text

```
text┌──────────────────────────────────────────────────────────────────┐
│                         12-COLUMN GRID                            │
│                                                                  │
│  Max width: 1280px (content), 1440px (full-bleed)                │
│  Gutter: 24px (desktop), 16px (mobile)                           │
│  Margin: auto (centered), or edge-to-edge for hero               │
│                                                                  │
│  Breakpoints:                                                    │
│  ├── sm:  640px   (mobile landscape)                             │
│  ├── md:  768px   (tablet)                                       │
│  ├── lg:  1024px  (desktop)                                      │
│  ├── xl:  1280px  (large desktop)                                │
│  └── 2xl: 1440px  (ultra wide)                                   │
│                                                                  │
│  Layout examples:                                                │
│  ├── Tournament list: 3 cols (lg), 2 cols (md), 1 col (sm)      │
│  ├── Tournament detail: 8/4 split (main + sidebar)               │
│  ├── Dashboard: sidebar 280px + main fluid                       │
│  └── Forms: max-width 640px centered                             │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### 4.3 Border Radius

css

```
css:root {
  --radius-sm:   4px;    /* badges, small elements */
  --radius-md:   8px;    /* buttons, inputs */
  --radius-lg:   12px;   /* cards */
  --radius-xl:   16px;   /* modals, large cards */
  --radius-full: 9999px; /* avatars, pills */
}
```

### 4.4 Shadows (Dark Theme)

css

```
css:root {
  --shadow-sm:  0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-md:  0 4px 12px rgba(0, 0, 0, 0.4);
  --shadow-lg:  0 8px 24px rgba(0, 0, 0, 0.5);
  --shadow-xl:  0 16px 48px rgba(0, 0, 0, 0.6);
  --shadow-glow: 0 0 20px rgba(244, 0, 9, 0.3);  /* coke red glow */
}
```

---

## 5. Component Specifications

### 5.1 Buttons

text

```
text┌─────────────────────────────────────────────────────────────┐
│                      BUTTON SYSTEM                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  PRIMARY (Coke Red)                                         │
│  ┌─────────────────────────────┐                            │
│  │     BROWSE TOURNAMENTS      │  bg: --brand-primary       │
│  │     (Kanit, 14px, 600)      │  text: white               │
│  └─────────────────────────────┘  radius: --radius-md       │
│   h: 44px  px: 24px                                        │
│   hover: bg lighter 8%, subtle glow shadow                  │
│   active: bg darker 5%, scale(0.98)                         │
│   focus: 2px outline --brand-primary, offset 2px            │
│                                                             │
│  SECONDARY (Ghost/Outline)                                  │
│  ┌─────────────────────────────┐                            │
│  │     VIEW BRACKET            │  bg: transparent           │
│  │                             │  border: 1px --border-hov  │
│  └─────────────────────────────┘  text: --text-primary      │
│   hover: bg --brand-subtle, border --brand-primary          │
│                                                             │
│  TERTIARY (Text-only)                                       │
│   text: --text-secondary                                    │
│   hover: text --brand-primary                               │
│   padding: --space-2 --space-3                              │
│                                                             │
│  DANGER                                                     │
│  ┌─────────────────────────────┐                            │
│  │     DELETE TOURNAMENT       │  bg: --error               │
│  └─────────────────────────────┘  hover: bg darker 10%      │
│                                                             │
│  SIZES                                                      │
│  ├── sm: h-32, px-12, text-13px                            │
│  ├── md: h-40, px-20, text-14px  (default)                 │
│  ├── lg: h-48, px-28, text-16px                            │
│  └── xl: h-56, px-36, text-18px                            │
│                                                             │
│  ICON BUTTON                                                │
│  ┌────┐                                                    │
│  │ 🔍 │  40x40, radius-full, bg --bg-tertiary              │
│  └────┘  hover: bg --brand-subtle                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Cards (Tournament Card)

text

```
text┌─────────────────────────────────────────────────────────────┐
│                    TOURNAMENT CARD                           │
│                                                             │
│  ┌───────────────────────────────────────────┐              │
│  │                                           │  16:9 ratio  │
│  │           BANNER IMAGE                    │  or gradient │
│  │           (fallback: game gradient)       │  placeholder │
│  │                                           │              │
│  │  ┌────────┐                               │              │
│  │  │ ● LIVE │  ← status badge              │              │
│  │  └────────┘                               │              │
│  │                                           │              │
│  │  ┌────────────────────────────────────┐   │              │
│  │  │  VALORANT COMMUNITY CUP           │   │  h3          │
│  │  │  Samutprakan Division             │   │  body-sm     │
│  │  │                                    │   │              │
│  │  │  ┌────┐ ┌────┐                    │   │  platform    │
│  │  │  │ PC │ │PS5 │                    │   │  badges      │
│  │  │  └────┘ └────┘                    │   │              │
│  │  │                                    │   │              │
│  │  │  👥 32/64    📅 Jan 15, 2025      │   │  metadata    │
│  │  └────────────────────────────────────┘   │              │
│  └───────────────────────────────────────────┘              │
│                                                             │
│  SPEC:                                                      │
│  ├── bg: --bg-secondary                                     │
│  ├── border: 1px --border-primary                           │
│  ├── radius: --radius-lg (12px)                             │
│  ├── padding: 0 (image bleeds), content --space-5           │
│  ├── hover: translateY(-4px), shadow-lg, border --brand     │
│  ├── transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)     │
│  └── TILT: 3D perspective tilt on hover (see motion spec)   │
│                                                             │
│  STATUS BADGE COLORS:                                       │
│  ├── registration_open: bg success, text white              │
│  ├── in_progress: bg brand-primary, text white + pulse dot  │
│  ├── upcoming: bg warning, text black                       │
│  └── completed: bg accent-700, text primary-400             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 5.3 Form Inputs

text

```
text┌─────────────────────────────────────────────────────────────┐
│                      FORM INPUTS                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  TEXT INPUT                                                 │
│  ┌─────────────────────────────────────┐                    │
│  │  Tournament Name                    │  label: body-sm    │
│  │  ┌─────────────────────────────┐    │  --text-secondary  │
│  │  │ Enter tournament name...    │    │                    │
│  │  └─────────────────────────────┘    │  input:            │
│  └─────────────────────────────────────┘  bg: --bg-tertiary │
│                                           border: 1px       │
│                                           --border-primary  │
│                                           radius: --radius-md│
│                                           h: 44px, px: 16px │
│                                           text: --text-pri  │
│                                           placeholder:      │
│                                           --text-disabled   │
│                                           focus: border     │
│                                           --brand-primary   │
│                                           + ring glow       │
│                                                             │
│  SELECT / DROPDOWN                                          │
│  ┌─────────────────────────────────────┐                    │
│  │  Game                               │                    │
│  │  ┌──────────────────────┐ ▼ │       │  same style as     │
│  │  │ Select a game...     │   │       │  text input         │
│  │  └──────────────────────┘────┘       │  dropdown arrow    │
│  │  ┌──────────────────────┐            │  custom styled     │
│  │  │ Valorant             │            │  dropdown panel:   │
│  │  │ League of Legends    │            │  bg --bg-tertiary  │
│  │  │ PUBG                 │            │  border, shadow-lg │
│  │  └──────────────────────┘            │  max-h: 240px      │
│  └─────────────────────────────────────┘  scrollable         │
│                                                             │
│  CHECKBOX / TOGGLE                                          │
│  ┌────┐ Enable Registration                                  │
│  │ ✓  │  20x20, border --border-primary                     │
│  └────┘  checked: bg --brand-primary, white checkmark        │
│          transition: all 0.2s                                │
│                                                             │
│  TOGGLE SWITCH                                              │
│  ┌────────┐                                                 │
│  │  ●───  │  44x24, radius-full                             │
│  └────────┘  off: bg --accent-700                           │
│              on: bg --brand-primary                          │
│              knob: 18px white circle                         │
│              transition: 0.2s                                │
│                                                             │
│  FILE UPLOAD                                                │
│  ┌─────────────────────────────────────┐                    │
│  │                                     │  dashed border     │
│  │     📷 Drop image or click          │  --border-primary  │
│  │        to upload                    │  hover: border     │
│  │                                     │  --brand-primary   │
│  └─────────────────────────────────────┘  bg --bg-tertiary  │
│                                           radius: --radius-lg│
│                                           h: 120px          │
│                                                             │
│  ERROR STATE                                                │
│  ┌─────────────────────────────────────┐                    │
│  │  ┌─────────────────────────────┐    │  border: --error   │
│  │  │ invalid@email               │    │                    │
│  │  └─────────────────────────────┘    │                    │
│  │  ⚠ Please enter a valid email       │  text: --error     │
│  └─────────────────────────────────────┘  text-sm           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 5.4 Navigation — Top Navbar (Public/Player)

text

```
text┌──────────────────────────────────────────────────────────────────────┐
│                         TOP NAVBAR                                   │
│                                                                      │
│  Height: 64px                                                        │
│  bg: --bg-primary with backdrop-blur(12px)                           │
│  border-bottom: 1px --border-secondary                               │
│  position: sticky, top: 0, z-index: 50                               │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │                                                                │  │
│  │  [Logo]    Tournaments  Games  About    [🔍] [🌐] [Avatar ▼]  │  │
│  │                                                                │  │
│  │  ← 24px →                                          ← 24px →  │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  LOGO:                                                               │
│  ├── Icon (left) + "Samutprakan Esports" (Kanit, 18px, 600)         │
│  ├── --text-primary, hover: --brand-primary                          │
│  └── Link to home                                                    │
│                                                                      │
│  NAV LINKS:                                                          │
│  ├── Kanit, 14px, 500                                                │
│  ├── color: --text-secondary                                         │
│  ├── hover: --text-primary                                           │
│  ├── active: --brand-primary + bottom border 2px                     │
│  └── gap: --space-8                                                  │
│                                                                      │
│  RIGHT SIDE:                                                         │
│  ├── Search icon button (opens search modal)                         │
│  ├── Language toggle (TH/EN) — small pill                            │
│  └── Avatar (32px, radius-full) + dropdown menu                      │
│                                                                      │
│  AUTH STATE:                                                          │
│  ├── Logged out: [Login] [Register] buttons                          │
│  └── Logged in: [Avatar] dropdown → Profile, My Tournaments,        │
│      Dashboard (if organizer), Logout                                │
│                                                                      │
│  MOBILE:                                                             │
│  ├── Hamburger menu (right side)                                     │
│  ├── Full-screen overlay menu                                        │
│  └── Stagger animation on open (items slide in one by one)           │
│                                                                      │
│  SCROLL BEHAVIOR:                                                    │
│  ├── On scroll down: navbar gets darker bg (--bg-secondary)          │
│  └── On scroll up: navbar reappears (hide on scroll down pattern)    │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

### 5.5 Navigation — Sidebar (Organizer)

text

```
text┌──────────────────────────────────────────────────────────────────────┐
│                    ORGANIZER SIDEBAR                                 │
│                                                                      │
│  Width: 260px (expanded), 72px (collapsed)                           │
│  bg: --bg-secondary                                                  │
│  border-right: 1px --border-secondary                                │
│  height: 100vh, sticky top: 0                                        │
│                                                                      │
│  ┌────────────────────────────────┐                                  │
│  │  [≡]  Samutprakan Esports      │  ← Logo + collapse toggle       │
│  ├────────────────────────────────┤                                  │
│  │                                │                                  │
│  │  ┌──────────────────────────┐  │                                  │
│  │  │ 📊  Dashboard            │  │  ← active item                  │
│  │  │     bg: --brand-subtle   │  │    bg: brand-subtle             │
│  │  │     text: --brand-primary│  │    left border: 3px brand       │
│  │  └──────────────────────────┘  │                                  │
│  │                                │                                  │
│  │  📁  Projects                  │                                  │
│  │  🏆  Tournaments               │                                  │
│  │  👥  Participants              │                                  │
│  │  📋  Registrations             │                                  │
│  │  ⚙️  Settings                  │                                  │
│  │                                │                                  │
│  │  ────────────────────────      │  divider                        │
│  │                                │                                  │
│  │  🔗  View Public Site          │  external link                   │
│  │                                │                                  │
│  ├────────────────────────────────┤                                  │
│  │                                │                                  │
│  │  [Avatar]  Username            │  ← user section at bottom       │
│  │            organizer@email     │                                  │
│  │            [← Logout]          │                                  │
│  │                                │                                  │
│  └────────────────────────────────┘                                  │
│                                                                      │
│  ITEM SPEC:                                                          │
│  ├── height: 44px                                                    │
│  ├── padding: 0 16px                                                 │
│  ├── icon: 20px, --text-tertiary                                     │
│  ├── text: Inter, 14px, 500, --text-secondary                        │
│  ├── hover: bg --bg-tertiary                                         │
│  ├── active: bg --brand-subtle, text --brand-primary,                │
│  │          left border 3px --brand-primary                          │
│  └── transition: all 0.15s ease                                      │
│                                                                      │
│  COLLAPSE BEHAVIOR:                                                  │
│  ├── Toggle button at top (hamburger icon)                           │
│  ├── Collapsed: only icons visible, tooltip on hover                 │
│  └── Transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1)           │
│                                                                      │
│  MOBILE (< 1024px):                                                  │
│  ├── Sidebar becomes overlay (backdrop-blur)                         │
│  ├── Triggered by hamburger in top mini-navbar                       │
│  └── Slide in from left with stagger animation                       │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

### 5.6 Badges & Tags

text

```
text┌─────────────────────────────────────────────────────────────┐
│                     BADGE SYSTEM                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  STATUS BADGE (pill shape)                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ ● LIVE   │  │ UPCOMING │  │ COMPLETED│  │ DRAFT    │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│   bg: brand     bg: warning   bg: accent    bg: bg-tertiary│
│   + pulse dot   text: black   text: muted   text: muted    │
│                                                             │
│  PLATFORM TAG                                               │
│  ┌────┐ ┌──────┐ ┌──────┐                                  │
│  │ PC │ │ PS5  │ │ Xbox │  bg: --bg-tertiary               │
│  └────┘ └──────┘ └──────┘  border: 1px --border-primary    │
│                              text: caption (12px)           │
│                              radius: --radius-sm            │
│                                                             │
│  COUNT BADGE                                                │
│  ┌──┐                                                      │
│  │5 │  bg: --brand-primary, text: white                    │
│  └──┘  radius: --radius-full, min-w: 20px                  │
│        font: caption, 600                                   │
│                                                             │
│  SEED BADGE                                                 │
│  ┌──┐                                                      │
│  │#1│  bg: --bg-tertiary, border: --border-primary         │
│  └──┘  text: --text-secondary, mono font                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 5.7 Match Card (Bracket)

text

```
text┌─────────────────────────────────────────────────────────────┐
│                      MATCH CARD                             │
│                                                             │
│  ┌───────────────────────────────────┐                      │
│  │  ┌─────────────────────────────┐  │                      │
│  │  │ 🔴 Team Alpha    2    W    │  │  ← winner row        │
│  │  ├─────────────────────────────┤  │    bg: --bg-tertiary │
│  │  │    Team Beta     1         │  │  ← loser row         │
│  │  └─────────────────────────────┘  │    bg: transparent   │
│  │  Match #1  ·  BO3  ·  2:30 PM    │  ← match metadata   │
│  └───────────────────────────────────┘                      │
│                                                             │
│  SIZE: 200px wide, auto height                              │
│  bg: --bg-secondary                                         │
│  border: 1px --border-primary                               │
│  radius: --radius-md (8px)                                  │
│                                                             │
│  ROW:                                                       │
│  ├── height: 40px                                           │
│  ├── padding: 0 12px                                        │
│  ├── flex: space-between                                    │
│  ├── seed (if shown): 20px mono, --text-tertiary           │
│  ├── team name: body-sm, --text-primary (truncate)          │
│  ├── score: Kanit, 16px, 600, --text-primary                │
│  └── winner indicator: left border 3px --brand-primary      │
│                                                             │
│  STATES:                                                    │
│  ├── pending: opacity 0.5, team names show "TBD"            │
│  ├── ready: both teams filled, normal opacity               │
│  ├── running: border --brand-primary, pulse animation       │
│  └── completed: winner row highlighted                      │
│                                                             │
│  CONNECTOR LINES (between matches):                         │
│  ├── stroke: 1px, --border-primary                          │
│  ├── path: right-angle connectors                           │
│  ├── animated when match completes (line draws)             │
│  └── color transitions to --brand-primary on completion     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. Animation & Motion System

### 6.1 Motion Principles

text

```
text┌─────────────────────────────────────────────────────────────┐
│                    MOTION PRINCIPLES                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. EVERY animation has purpose (guide attention,           │
│     show relationship, provide feedback)                    │
│                                                             │
│  2. Respect prefers-reduced-motion                          │
│     → disable all non-essential animations                  │
│                                                             │
│  3. Performance first                                       │
│     → only animate transform and opacity                    │
│     → use will-change sparingly                             │
│     → use requestAnimationFrame for JS animations           │
│     → GPU-accelerated only (translate3d, scale)             │
│                                                             │
│  4. Timing:                                                 │
│     ├── Micro (button press): 100-150ms                    │
│     ├── Small (hover, focus): 200-300ms                    │
│     ├── Medium (expand, collapse): 300-400ms               │
│     ├── Large (page transition): 400-600ms                 │
│     └── Extra (scroll reveals): 600-800ms                  │
│                                                             │
│  5. Easing:                                                 │
│     ├── Default: cubic-bezier(0.4, 0, 0.2, 1)             │
│     ├── Enter: cubic-bezier(0, 0, 0.2, 1)                 │
│     ├── Exit: cubic-bezier(0.4, 0, 1, 1)                  │
│     └── Spring: cubic-bezier(0.34, 1.56, 0.64, 1)         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 Tilt Hover Effect (All Clickable Cards)

css

```
css/*
 * 3D Tilt Effect — applies to tournament cards, game cards,
 * any clickable card element
 *
 * Uses CSS perspective + JS mouse tracking
 * Max tilt: 6 degrees
 * Glare effect: subtle white gradient following mouse
 */

.tilt-card {
  perspective: 1000px;
  transform-style: preserve-3d;
}

.tilt-card-inner {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
              box-shadow 0.3s ease;
  will-change: transform;
}

.tilt-card-inner:hover {
  transform: rotateX(var(--tilt-x, 0deg))
             rotateY(var(--tilt-y, 0deg))
             translateZ(10px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3),
              0 0 20px rgba(155, 27, 48, 0.15);
}

/* Glare overlay */
.tilt-card-inner::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(
    circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
    rgba(255, 255, 255, 0.06) 0%,
    transparent 60%
  );
  border-radius: inherit;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s;
}

.tilt-card-inner:hover::after {
  opacity: 1;
}
```

typescript

```
typescript// hooks/useTilt.ts
// Lightweight tilt hook — no external dependencies
// Uses requestAnimationFrame for smooth 60fps

import { useRef, useCallback, type RefObject } from 'react'

interface TiltOptions {
  maxTilt?: number        // default 6 degrees
  scale?: number          // default 1.02
  speed?: number          // default 300ms
  glare?: boolean         // default true
}

export function useTilt<T extends HTMLElement>(options: TiltOptions = {}) {
  const { maxTilt = 6, scale = 1.02, glare = true } = options
  const ref = useRef<T>(null)
  const frameRef = useRef<number>(0)

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!ref.current) return

    cancelAnimationFrame(frameRef.current)
    frameRef.current = requestAnimationFrame(() => {
      const el = ref.current!
      const rect = el.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width    // 0-1
      const y = (e.clientY - rect.top) / rect.height    // 0-1

      const tiltX = (y - 0.5) * maxTilt * -1
      const tiltY = (x - 0.5) * maxTilt

      el.style.setProperty('--tilt-x', `${tiltX}deg`)
      el.style.setProperty('--tilt-y', `${tiltY}deg`)
      el.style.setProperty('--mouse-x', `${x * 100}%`)
      el.style.setProperty('--mouse-y', `${y * 100}%`)
    })
  }, [maxTilt])

  const handleMouseLeave = useCallback(() => {
    if (!ref.current) return
    el.style.setProperty('--tilt-x', '0deg')
    el.style.setProperty('--tilt-y', '0deg')
  }, [])

  return { ref, handleMouseMove, handleMouseLeave }
}
```

### 6.3 Parallax Hero (Landing Page)

css

```
css/*
 * Parallax effect on hero section
 * Uses CSS transform: translateZ + perspective for pure CSS parallax
 * Fallback: JS scroll-based for broader support
 *
 * Layers:
 * 1. Background gradient/pattern — slowest (0.3x scroll speed)
 * 2. Decorative geometric shapes — medium (0.5x)
 * 3. Content text — normal (1x, no parallax)
 */

.hero-parallax-container {
  perspective: 1px;
  height: 100vh;
  overflow-x: hidden;
  overflow-y: auto;
}

.hero-bg-layer {
  position: absolute;
  inset: -20%;  /* oversized to prevent gaps during parallax */
  transform: translateZ(-2px) scale(3);
  z-index: -1;
}

/* Decorative floating shapes */
.hero-shapes {
  position: absolute;
  inset: 0;
  transform: translateZ(-1px) scale(2);
  z-index: 0;
}

.hero-shape {
  position: absolute;
  border: 1px solid rgba(155, 27, 48, 0.15);
  border-radius: 4px;
  animation: float 20s ease-in-out infinite;
}

.hero-shape:nth-child(1) {
  width: 120px; height: 120px;
  top: 15%; left: 10%;
  animation-delay: 0s;
  transform: rotate(15deg);
}

.hero-shape:nth-child(2) {
  width: 80px; height: 80px;
  top: 60%; right: 15%;
  animation-delay: -5s;
  transform: rotate(-20deg);
}

.hero-shape:nth-child(3) {
  width: 200px; height: 200px;
  bottom: 10%; left: 40%;
  animation-delay: -10s;
  border-radius: 50%;
}

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(var(--rotation, 0deg)); }
  50% { transform: translateY(-20px) rotate(calc(var(--rotation, 0deg) + 5deg)); }
}
```

### 6.4 Scroll-Triggered Animations

css

```
css/*
 * IntersectionObserver-based scroll reveals
 * Elements animate in when they enter the viewport
 *
 * Variants:
 * - fadeUp: slide up + fade in (most common)
 * - fadeLeft/Right: slide from side
 * - scaleIn: scale from 0.95 to 1
 * - stagger: children animate one by one
 */

.reveal {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.6s cubic-bezier(0, 0, 0.2, 1),
              transform 0.6s cubic-bezier(0, 0, 0.2, 1);
}

.reveal.visible {
  opacity: 1;
  transform: translateY(0);
}

/* Stagger children */
.stagger-children > .reveal:nth-child(1) { transition-delay: 0ms; }
.stagger-children > .reveal:nth-child(2) { transition-delay: 80ms; }
.stagger-children > .reveal:nth-child(3) { transition-delay: 160ms; }
.stagger-children > .reveal:nth-child(4) { transition-delay: 240ms; }
.stagger-children > .reveal:nth-child(5) { transition-delay: 320ms; }
.stagger-children > .reveal:nth-child(6) { transition-delay: 400ms; }
```

typescript

```
typescript// hooks/useScrollReveal.ts
import { useEffect, useRef } from 'react'

export function useScrollReveal(threshold = 0.15) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('visible')
          observer.unobserve(el) // animate once only
        }
      },
      { threshold, rootMargin: '0px 0px -50px 0px' }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  return ref
}
```

### 6.5 Particle Effect (Hero Background)

typescript

```
typescript/*
 * Canvas-based particle system for hero background
 *
 * PERFORMANCE RULES:
 * - Max 50 particles on desktop, 20 on mobile
 * - Use requestAnimationFrame
 * - Pause when tab is not visible (visibilitychange)
 * - Disable entirely if prefers-reduced-motion
 * - Use simple circles, no complex shapes
 * - Single color: --brand-primary with low opacity (0.1-0.3)
 *
 * BEHAVIOR:
 * - Particles drift slowly upward (0.2-0.5 px/frame)
 * - Subtle horizontal drift (sin wave)
 * - Fade in/out at edges
 * - Connect nearby particles with thin lines (if distance < 150px)
 *   Connection opacity based on distance (closer = more opaque)
 */

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number       // 1-3px
  opacity: number      // 0.1-0.3
}

// Canvas sizing: match container, cap at 1920x1080
// Device pixel ratio aware (window.devicePixelRatio)
// Resize handler with debounce (250ms)
```

### 6.6 Page Transitions

css

```
css/*
 * Page transition using Next.js App Router + framer-motion (optional)
 * or CSS View Transitions API (modern browsers)
 *
 * Simple approach: fade + slight upward slide
 */

.page-enter {
  opacity: 0;
  transform: translateY(8px);
}

.page-enter-active {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 0.3s ease, transform 0.3s ease;
}
```

### 6.7 Micro-Interactions

text

```
text┌─────────────────────────────────────────────────────────────┐
│                   MICRO-INTERACTIONS                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  BUTTON PRESS                                               │
│  └── scale(0.97) on :active, 100ms ease                    │
│                                                             │
│  LINK UNDERLINE                                             │
│  └── underline grows from left to right on hover            │
│      background-size: 0% → 100% from left                   │
│                                                             │
│  FOCUS RING                                                 │
│  └── 2px solid --brand-primary, offset 2px                  │
│      appears on :focus-visible only (not click)             │
│                                                             │
│  INPUT FOCUS                                                │
│  └── border color transitions to --brand-primary            │
│      + subtle box-shadow glow (0 0 0 3px brand-subtle)     │
│                                                             │
│  TOGGLE SWITCH                                              │
│  └── knob slides with slight overshoot (spring easing)      │
│                                                             │
│  BADGE PULSE (live status)                                  │
│  └── dot pulses: scale 1 → 1.5 → 1, opacity 1 → 0 → 1     │
│      duration: 2s, infinite                                 │
│                                                             │
│  SCORE UPDATE (realtime)                                    │
│  └── number changes: old slides up + fades out,             │
│      new slides up + fades in, 300ms                        │
│                                                             │
│  BRACKET LINE DRAW                                          │
│  └── when match completes, connector line draws             │
│      from match to next match (stroke-dasharray animation)  │
│                                                             │
│  SKELETON LOADING                                           │
│  └── shimmer effect: gradient moves left to right           │
│      bg: linear-gradient(90deg, bg-tertiary 25%,            │
│      bg-quaternary 50%, bg-tertiary 75%)                    │
│      background-size: 200% 100%, animation: 1.5s infinite   │
│                                                             │
│  TOAST NOTIFICATION                                         │
│  └── slides in from top-right, auto-dismiss 4s              │
│      progress bar at bottom                                 │
│                                                             │
│  MODAL                                                      │
│  └── backdrop fade in (0.3s)                                │
│      content: scale(0.95) + fade → scale(1) + visible       │
│      (0.2s, 0.1s delay after backdrop)                      │
│                                                             │
│  NUMBER COUNTER (stats section)                             │
│  └── counts up from 0 to target when in viewport            │
│      duration: 2s, easeOutExpo                              │
│                                                             │
│  CURSOR GLOW (optional, desktop only)                       │
│  └── subtle radial gradient follows cursor                  │
│      on hero section only, very low opacity (0.03)          │
│      color: --brand-primary                                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 6.8 Reduced Motion

css

```
css@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }

  .tilt-card-inner {
    transform: none !important;
  }

  .parallax-layer {
    transform: none !important;
  }

  .particle-canvas {
    display: none;
  }
}
```

---

## 7. Page Layouts

### 7.1 Landing Page

text

```
text┌──────────────────────────────────────────────────────────────────┐
│  NAVBAR (sticky)                                                  │
│  [Logo]    Tournaments  Games     [🔍] [TH/EN] [Login] [Sign Up]│
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ╔══════════════════════════════════════════════════════════════╗ │
│  ║                    HERO SECTION                              ║ │
│  ║                    height: 100vh                              ║ │
│  ║                                                              ║ │
│  ║  [Particle canvas background]                                ║ │
│  ║  [Floating geometric shapes — parallax]                      ║ │
│  ║  [Gradient mesh overlay]                                     ║ │
│  ║                                                              ║ │
│  ║         COMPETE.                                             ║ │
│  ║         CONQUER.                                             ║ │
│  ║         CLAIM GLORY.         ← Kanit, 64px, 800              ║ │
│  ║                              color: white + crimson glow     ║ │
│  ║                                                              ║ │
│  ║  The ultimate tournament platform for                        ║ │
│  ║  Samutprakan Esport Association.   ← Inter, 18px             ║ │
│  ║                                                              ║ │
│  ║  [ Browse Tournaments ]  [ Create Tournament ]               ║ │
│  ║      (primary btn)         (secondary btn)                   ║ │
│  ║                                                              ║ │
│  ║  ─── scroll indicator (animated chevron) ───                 ║ │
│  ╚══════════════════════════════════════════════════════════════╝ │
│                                                                   │
│  ─────────────────────────────────────────────────────────────── │
│                                                                   │
│  ╔══════════════════════════════════════════════════════════════╗ │
│  ║              FEATURED TOURNAMENTS                            ║ │
│  ║              padding: 96px 0                                 ║ │
│  ║                                                              ║ │
│  ║  "Featured Tournaments"  ← h2, Kanit, center                ║ │
│  ║  "Join the competition"  ← body, Inter, center, muted       ║ │
│  ║                                                              ║ │
│  ║  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐         ║ │
│  ║  │  TOURNAMENT  │ │  TOURNAMENT  │ │  TOURNAMENT  │         ║ │
│  ║  │  CARD 1      │ │  CARD 2      │ │  CARD 3      │         ║ │
│  ║  │  (tilt)      │ │  (tilt)      │ │  (tilt)      │         ║ │
│  ║  └──────────────┘ └──────────────┘ └──────────────┘         ║ │
│  ║  ← stagger reveal on scroll →                               ║ │
│  ║                                                              ║ │
│  ║  [ View All Tournaments → ]                                 ║ │
│  ╚══════════════════════════════════════════════════════════════╝ │
│                                                                   │
│  ─────────────────────────────────────────────────────────────── │
│                                                                   │
│  ╔══════════════════════════════════════════════════════════════╗ │
│  ║              BROWSE BY GAME                                  ║ │
│  ║              bg: --bg-secondary                              ║ │
│  ║                                                              ║ │
│  ║  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐              ║ │
│  ║  │ VAL  │ │ LOL  │ │ PUBG │ │ CS2  │ │ DOTA │              ║ │
│  ║  │      │ │      │ │      │ │      │ │      │              ║ │
│  ║  │ img  │ │ img  │ │ img  │ │ img  │ │ img  │              ║ │
│  ║  │      │ │      │ │      │ │      │ │      │              ║ │
│  ║  │ 12   │ │ 8    │ │ 5    │ │ 3    │ │ 2    │              ║ │
│  ║  │ tours│ │ tours│ │ tours│ │ tours│ │ tours│              ║ │
│  ║  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘              ║ │
│  ║  ← tilt hover + scroll reveal →                             ║ │
│  ╚══════════════════════════════════════════════════════════════╝ │
│                                                                   │
│  ─────────────────────────────────────────────────────────────── │
│                                                                   │
│  ╔══════════════════════════════════════════════════════════════╗ │
│  ║              HOW IT WORKS                                    ║ │
│  ║                                                              ║ │
│  ║  ┌───────────┐    ┌───────────┐    ┌───────────┐            ║ │
│  ║  │     1     │    │     2     │    │     3     │            ║ │
│  ║  │  Create   │ →  │  Manage   │ →  │ Compete   │            ║ │
│  ║  │  Tournament│    │  Brackets │    │ & Win     │            ║ │
│  ║  │           │    │           │    │           │            ║ │
│  ║  │ icon      │    │ icon      │    │ icon      │            ║ │
│  ║  │ desc      │    │ desc      │    │ desc      │            ║ │
│  ║  └───────────┘    └───────────┘    └───────────┘            ║ │
│  ║                                                              ║ │
│  ║  ← connecting lines between steps, stagger reveal →         ║ │
│  ╚══════════════════════════════════════════════════════════════╝ │
│                                                                   │
│  ─────────────────────────────────────────────────────────────── │
│                                                                   │
│  ╔══════════════════════════════════════════════════════════════╗ │
│  ║              COMMUNITY STATS                                 ║ │
│  ║              bg: --bg-secondary                              ║ │
│  ║                                                              ║ │
│  ║    ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ║ │
│  ║    │   1,250  │  │    48    │  │   5,600  │  │    96    │  ║ │
│  ║    │ Players  │  │Tournaments│  │  Matches │  │   Games  │  ║ │
│  ║    └──────────┘  └──────────┘  └──────────┘  └──────────┘  ║ │
│  ║                                                              ║ │
│  ║  ← number counter animation on scroll into view →           ║ │
│  ╚══════════════════════════════════════════════════════════════╝ │
│                                                                   │
│  ─────────────────────────────────────────────────────────────── │
│                                                                   │
│  ╔══════════════════════════════════════════════════════════════╗ │
│  ║              FOOTER                                          ║ │
│  ║              bg: --bg-secondary, border-top                  ║ │
│  ║                                                              ║ │
│  ║  [Logo]    │  Quick Links  │  Resources  │  Connect         ║ │
│  ║  Samutprakan│ Tournaments  │  FAQ        │  Discord         ║ │
│  ║  Esports   │ Games         │  Contact    │  Twitter         ║ │
│  ║            │ Create Tour   │  Terms      │  Facebook        ║ │
│  ║                                                              ║ │
│  ║  ───────────────────────────────────────────                 ║ │
│  ║  © 2025 Samutprakan Esport Association. All rights reserved.║ │
│  ╚══════════════════════════════════════════════════════════════╝ │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

### 7.2 Tournament Browse Page

text

```
text┌──────────────────────────────────────────────────────────────────┐
│  NAVBAR                                                           │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  max-width: 1280px, padding: 32px 24px                           │
│                                                                   │
│  "Tournaments"              ← h1, Kanit                          │
│  "Discover and join competitive events"  ← body, muted           │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ FILTERS BAR                                                  │ │
│  │                                                              │ │
│  │ [🔍 Search...]  [Game ▼]  [Platform ▼]  [Status ▼]  [Reset]│ │
│  │                                                              │ │
│  │ Status tabs:  [All] [Upcoming] [Live] [Completed]            │ │
│  │               ↑ active tab has bottom border --brand-primary │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐              │
│  │  TOURNAMENT  │ │  TOURNAMENT  │ │  TOURNAMENT  │              │
│  │  CARD        │ │  CARD        │ │  CARD        │              │
│  │  (tilt+reveal│ │              │ │              │              │
│  └──────────────┘ └──────────────┘ └──────────────┘              │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐              │
│  │  TOURNAMENT  │ │  TOURNAMENT  │ │  TOURNAMENT  │              │
│  │  CARD        │ │  CARD        │ │  CARD        │              │
│  └──────────────┘ └──────────────┘ └──────────────┘              │
│                                                                   │
│  3 columns (lg), 2 columns (md), 1 column (sm)                  │
│  gap: 24px                                                       │
│  stagger reveal animation on scroll                              │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  PAGINATION                                                  │ │
│  │  [← Prev]  [1] [2] [3] ... [12]  [Next →]                  │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  FOOTER                                                           │
└──────────────────────────────────────────────────────────────────┘
```

### 7.3 Tournament Detail Page

text

```
text┌──────────────────────────────────────────────────────────────────┐
│  NAVBAR                                                           │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ HERO BANNER                                                  │ │
│  │ height: 280px                                                │ │
│  │ bg: banner image or gradient (game-specific)                 │ │
│  │ overlay: gradient from transparent to --bg-primary           │ │
│  │                                                              │ │
│  │  ┌──────┐                                                    │ │
│  │  │ LIVE │ ← status badge                                     │ │
│  │  └──────┘                                                    │ │
│  │                                                              │ │
│  │  VALORANT COMMUNITY CUP    ← h1, Kanit, white               │ │
│  │  Samutprakan Division      ← body, white/80%                │ │
│  │                                                              │ │
│  │  [🎮 Valorant] [🖥 PC] [👥 32/64] [📅 Jan 15]  ← badges    │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ TAB NAVIGATION                                               │ │
│  │                                                              │ │
│  │  [Overview] [Bracket] [Standings] [Matches] [Participants]  │ │
│  │   ↑ active: --brand-primary underline                       │ │
│  │   inactive: --text-secondary                                │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ CONTENT AREA                                                 │ │
│  │                                                              │ │
│  │ ┌──────────────────────────────┐ ┌────────────────────────┐ │ │
│  │ │                              │ │  SIDEBAR               │ │ │
│  │ │  MAIN CONTENT                │ │                        │ │ │
│  │ │  (tab-dependent)             │ │  ┌──────────────────┐  │ │ │
│  │ │                              │ │  │ REGISTER NOW     │  │ │ │
│  │ │  For "Bracket" tab:          │ │  │ (primary CTA)    │  │ │ │
│  │ │  ┌────────────────────────┐  │ │  └──────────────────┘  │ │ │
│  │ │  │                        │  │ │                        │ │ │
│  │ │  │  BRACKET VIEWER        │  │ │  ┌──────────────────┐  │ │ │
│  │ │  │  (horizontal scroll)   │  │ │  │ INFO             │  │ │ │
│  │ │  │                        │  │ │  │ Game: Valorant   │  │ │ │
│  │ │  │  R1    R2    SF    F   │  │ │  │ Format: Duel     │  │ │ │
│  │ │  │  ┌─┐  ┌─┐  ┌─┐  ┌─┐  │  │ │  │ Size: 32         │  │ │ │
│  │ │  │  └─┘──└─┘  │  │  │  │  │ │ │  │ Stage: Single El │  │ │ │
│  │ │  │  ┌─┘───────┘  │  │  │  │ │ │  │ Reg: Open        │  │ │ │
│  │ │  │  └─┘──────────┘──└─┘  │  │ │  └──────────────────┘  │ │ │
│  │ │  │                        │  │ │                        │ │ │
│  │ │  └────────────────────────┘  │ │  ┌──────────────────┐  │ │ │
│  │ │                              │ │  │ PARTICIPANTS     │  │ │ │
│  │ │                              │ │  │ (mini list)      │  │ │ │
│  │ │                              │ │  │ Team 1           │  │ │ │
│  │ │                              │ │  │ Team 2           │  │ │ │
│  │ │                              │ │  │ ...              │  │ │ │
│  │ │                              │ │  │ [View All →]     │  │ │ │
│  │ │                              │ │  └──────────────────┘  │ │ │
│  │ └──────────────────────────────┘ └────────────────────────┘ │ │
│  │                                                              │ │
│  │ 8/4 split on desktop, stacked on mobile                     │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  FOOTER                                                           │
└──────────────────────────────────────────────────────────────────┘
```

### 7.4 Organizer Dashboard

text

```
text┌──────────────────────────────────────────────────────────────────┐
│                                                                   │
│  ┌─────────────┐ ┌─────────────────────────────────────────────┐ │
│  │             │ │  TOP BAR (64px)                               │ │
│  │  SIDEBAR    │ │  [Page Title]              [🔔] [Avatar ▼]   │ │
│  │  (260px)    │ ├─────────────────────────────────────────────┤ │
│  │             │ │                                               │ │
│  │  [Logo]     │ │  STATS CARDS                                  │ │
│  │             │ │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐│ │
│  │  📊 Dash    │ │  │   5    │ │   12   │ │  256   │ │   48   ││ │
│  │  📁 Projects│ │  │Projects│ │  Tours │ │Players │ │ Matches││ │
│  │  🏆 Tours   │ │  └────────┘ └────────┘ └────────┘ └────────┘│ │
│  │  👥 Parts   │ │                                               │ │
│  │  📋 Regis   │ │  RECENT TOURNAMENTS                           │ │
│  │  ⚙ Settings │ │  ┌──────────────────────────────────────────┐│ │
│  │             │ │  │ Tournament  │ Status  │ Participants│ ... ││ │
│  │ ──────────  │ │  ├──────────────────────────────────────────┤│ │
│  │             │ │  │ Valorant Cup│ ● LIVE  │ 32/64       │     ││ │
│  │ 🔗 Public   │ │  │ LoL Tour    │ UPCOMING│ 12/32       │     ││ │
│  │    Site     │ │  │ PUBG Squad  │ DRAFT   │ 0/16        │     ││ │
│  │             │ │  └──────────────────────────────────────────┘│ │
│  │             │ │                                               │ │
│  │ [Avatar]    │ │  QUICK ACTIONS                                │ │
│  │  Username   │ │  [+ New Project]  [+ New Tournament]          │ │
│  │  [Logout]   │ │                                               │ │
│  └─────────────┘ └─────────────────────────────────────────────┘ │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

### 7.5 Tournament Setup Wizard (Organizer)

text

```
text┌──────────────────────────────────────────────────────────────────┐
│  SIDEBAR  │  MAIN CONTENT                                        │
│           │                                                       │
│           │  "Create Tournament"           ← h1                  │
│           │                                                       │
│           │  ┌─────────────────────────────────────────────────┐ │
│           │  │ STEP INDICATOR                                   │ │
│           │  │                                                  │ │
│           │  │  ①─────②─────③─────④                            │ │
│           │  │  Basic  Format  Stage  Settings                  │ │
│           │  │  Info   & Type  Config                           │ │
│           │  │                                                  │ │
│           │  │  ● = current (brand-primary bg)                  │ │
│           │  │  ✓ = completed (brand-primary, checkmark)        │ │
│           │  │  ○ = upcoming (border only)                      │ │
│           │  │  line = border-primary (completed: brand)        │ │
│           │  └─────────────────────────────────────────────────┘ │
│           │                                                       │
│           │  ┌─────────────────────────────────────────────────┐ │
│           │  │ STEP CONTENT                                     │ │
│           │  │                                                  │ │
│           │  │  (content changes per step)                      │ │
│           │  │                                                  │ │
│           │  │  Step 1 — Basic Info:                            │ │
│           │  │  ┌─────────────────────────────────────┐        │ │
│           │  │  │ Tournament Name *                    │        │ │
│           │  │  │ [________________________]          │        │ │
│           │  │  │                                     │        │ │
│           │  │  │ Game *                               │        │ │
│           │  │  │ [Select game...           ▼]        │        │ │
│           │  │  │                                     │        │ │
│           │  │  │ Platforms                             │        │ │
│           │  │  │ [☑ PC] [☐ PS5] [☐ Xbox] [☐ Switch] │        │ │
│           │  │  │                                     │        │ │
│           │  │  │ Size (max 256) *                     │        │ │
│           │  │  │ [________________________]          │        │ │
│           │  │  │                                     │        │ │
│           │  │  │ Participant Type *                   │        │ │
│           │  │  │ (●) Team    ( ) Player              │        │ │
│           │  │  │                                     │        │ │
│           │  │  │ Team Size                            │        │ │
│           │  │  │ Min [__]  Max [__]                  │        │ │
│           │  │  └─────────────────────────────────────┘        │ │
│           │  │                                                  │ │
│           │  └─────────────────────────────────────────────────┘ │
│           │                                                       │
│           │  ┌─────────────────────────────────────────────────┐ │
│           │  │ NAVIGATION                                       │ │
│           │  │                                                  │ │
│           │  │ [← Back]                    [Next Step →]        │ │
│           │  │ (secondary btn)             (primary btn)        │ │
│           │  └─────────────────────────────────────────────────┘ │
│           │                                                       │
└──────────────────────────────────────────────────────────────────┘
```

### 7.6 Stage Configuration Page

text

```
text┌──────────────────────────────────────────────────────────────────┐
│  SIDEBAR  │  MAIN CONTENT                                        │
│           │                                                       │
│           │  "Configure Stage"                ← h1               │
│           │  "Single Elimination"             ← h3, muted        │
│           │                                                       │
│           │  ┌─────────────────────┐ ┌─────────────────────────┐ │
│           │  │  GENERAL            │ │  PREVIEW                │ │
│           │  │                     │ │                         │ │
│           │  │  Number             │ │  Mini bracket preview   │ │
│           │  │  [1]                │ │  (auto-updates as you   │ │
│           │  │                     │ │   configure)            │ │
│           │  │  Name               │ │                         │ │
│           │  │  [Playoffs____]     │ │  ┌─┐ ┌─┐              │ │
│           │  │  max 30 chars       │ │  └─┘─┘ │              │ │
│           │  │                     │ │  ┌─┐ ┌─┘              │ │
│           │  │  Size               │ │  └─┘─┘                │ │
│           │  │  [8]               │ │                         │ │
│           │  │  max 12             │ │                         │ │
│           │  │                     │ │                         │ │
│           │  │  3rd/4th match?     │ │                         │ │
│           │  │  Toggle: [ON/OFF]   │ │                         │ │
│           │  │                     │ │                         │ │
│           │  ├─────────────────────┤ │                         │ │
│           │  │  MATCH SETTINGS     │ │                         │ │
│           │  │                     │ │                         │ │
│           │  │  Format             │ │                         │ │
│           │  │  [Best of     ▼]   │ │                         │ │
│           │  │                     │ │                         │ │
│           │  │  Best of            │ │                         │ │
│           │  │  (●) 3  ( ) 5  ( ) 7│ │                         │ │
│           │  │                     │ │                         │ │
│           │  ├─────────────────────┤ │                         │ │
│           │  │  ADVANCED           │ │                         │ │
│           │  │  (collapsible)      │ │                         │ │
│           │  │  ...                │ │                         │ │
│           │  └─────────────────────┘ └─────────────────────────┘ │
│           │                                                       │
│           │  [Cancel]  [Save Stage]                               │
│           │                                                       │
└──────────────────────────────────────────────────────────────────┘
```

---

## 8. Responsive Design

text

```
text┌─────────────────────────────────────────────────────────────┐
│                    RESPONSIVE RULES                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  BREAKPOINTS                                                │
│  ├── sm:  640px   (phones landscape)                       │
│  ├── md:  768px   (tablets)                                │
│  ├── lg:  1024px  (small laptops)                          │
│  ├── xl:  1280px  (desktops)                               │
│  └── 2xl: 1440px  (large screens)                          │
│                                                             │
│  MOBILE (< 768px)                                          │
│  ├── Navbar → hamburger menu                               │
│  ├── Sidebar → overlay drawer                              │
│  ├── Cards → single column, full width                     │
│  ├── Tournament detail → stacked layout                    │
│  ├── Bracket → horizontal scroll with hint                 │
│  ├── Wizard → full-width, step indicator compact           │
│  ├── Font sizes → same (don't shrink body below 14px)      │
│  └── Touch targets → min 44x44px                           │
│                                                             │
│  TABLET (768px - 1023px)                                   │
│  ├── Cards → 2 columns                                     │
│  ├── Sidebar → collapsible overlay                         │
│  └── Content → slight padding reduction                    │
│                                                             │
│  DESKTOP (1024px+)                                         │
│  ├── Full sidebar visible                                  │
│  ├── Cards → 3 columns                                     │
│  ├── Tournament detail → side-by-side layout               │
│  └── Hover effects enabled                                 │
│                                                             │
│  PERFORMANCE ON MOBILE                                      │
│  ├── Disable tilt effect (no mouse)                        │
│  ├── Reduce particle count (20 max)                        │
│  ├── Simpler parallax (or disable)                         │
│  ├── Lazy load images below fold                           │
│  └── Use IntersectionObserver for all scroll animations    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 9. Iconography & Imagery

### 9.1 Icons

text

```
textLibrary: Lucide React (consistent, tree-shakeable, MIT license)

Usage rules:
├── Size: 20px (default), 16px (compact), 24px (emphasis)
├── Stroke width: 1.5px (default), 2px (bold)
├── Color: inherit from text color (--text-secondary default)
└── Alignment: always vertically center with adjacent text

Key icons:
├── Navigation: Home, Trophy, Users, Gamepad, Settings, Search
├── Actions: Plus, Edit, Trash, Check, X, ChevronDown
├── Status: Circle (filled for live), Clock, Calendar
├── Social: ExternalLink, Share
└── Bracket: Minus, ArrowRight, GitBranch
```

### 9.2 Images & Placeholders

text

```
textTournament banner:
├── Aspect ratio: 16:9
├── Fallback: game-specific gradient (generated from game primary color)
├── Loading: skeleton shimmer
└── Optimization: next/image, WebP, srcset

Game covers:
├── Aspect ratio: 3:4 (portrait)
├── Fallback: game initial letter on gradient bg
└── Size: 200x267px display

Player/Team logos:
├── Shape: circle (player), rounded square (team)
├── Size: 64px (list), 128px (detail), 32px (inline)
├── Fallback: initials on gradient bg
└── Upload: max 2MB, crop to square on upload

Avatars:
├── Shape: circle
├── Sizes: 32px (navbar), 48px (profile), 96px (detail)
└── Fallback: initials on brand-subtle bg
```

---

## 10. Accessibility

text

```
text┌─────────────────────────────────────────────────────────────┐
│                  ACCESSIBILITY CHECKLIST                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  COLOR                                                      │
│  ├── All text meets WCAG AA contrast ratio (4.5:1)         │
│  ├── Brand primary (#9B1B30) on dark bg (#0a0a0c) = 4.6:1 ✓│
│  ├── Interactive elements have visible focus states         │
│  └── Color is never the only way to convey information      │
│      (always paired with icon, text, or pattern)            │
│                                                             │
│  TYPOGRAPHY                                                 │
│  ├── Body text minimum 14px (never smaller)                 │
│  ├── Line height: 1.5-1.6 for body text                    │
│  ├── Paragraph max width: 72ch (comfortable reading)        │
│  └── Font loading: swap (no invisible text)                 │
│                                                             │
│  INTERACTION                                                │
│  ├── All interactive elements keyboard accessible           │
│  ├── Tab order follows visual order                         │
│  ├── Focus trap in modals                                   │
│  ├── Escape closes modals/dropdowns                         │
│  ├── Touch targets: minimum 44x44px on mobile               │
│  └── aria-labels on icon-only buttons                       │
│                                                             │
│  MOTION                                                     │
│  ├── prefers-reduced-motion: disable all animations         │
│  ├── No flashing content (3 flashes per second max)         │
│  └── Animations don't convey essential info (progressive)   │
│                                                             │
│  IMAGES                                                     │
│  ├── All images have alt text                               │
│  ├── Decorative images: alt=""                              │
│  └── SVG icons have aria-hidden="true" when decorative      │
│                                                             │
│  FORMS                                                      │
│  ├── All inputs have visible labels (not just placeholder)  │
│  ├── Error messages linked via aria-describedby             │
│  ├── Required fields marked with * and aria-required        │
│  └── Form validation errors announced to screen readers     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 11. Tailwind Configuration

typescript

```
typescript// tailwind.config.ts — key customizations

import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Use CSS custom properties for theme switching
        bg: {
          primary:    'var(--bg-primary)',
          secondary:  'var(--bg-secondary)',
          tertiary:   'var(--bg-tertiary)',
          quaternary: 'var(--bg-quaternary)',
        },
        text: {
          primary:   'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          tertiary:  'var(--text-tertiary)',
          disabled:  'var(--text-disabled)',
        },
        brand: {
          DEFAULT: 'var(--brand-primary)',
          hover:   'var(--brand-hover)',
          active:  'var(--brand-active)',
          subtle:  'var(--brand-subtle)',
          glow:    'var(--brand-glow)',
        },
        border: {
          primary:   'var(--border-primary)',
          secondary: 'var(--border-secondary)',
          hover:     'var(--border-hover)',
          active:    'var(--border-active)',
        },
      },
      fontFamily: {
        display: ['Kanit', 'sans-serif'],
        body:    ['Inter', 'sans-serif'],
        mono:    ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        'display': ['3.5rem',  { lineHeight: '1.1',   fontWeight: '800', letterSpacing: '-0.02em' }],
        'h1':      ['2.5rem',  { lineHeight: '1.2',   fontWeight: '700', letterSpacing: '-0.01em' }],
        'h2':      ['2rem',    { lineHeight: '1.25',  fontWeight: '600', letterSpacing: '-0.01em' }],
        'h3':      ['1.5rem',  { lineHeight: '1.3',   fontWeight: '600' }],
        'h4':      ['1.25rem', { lineHeight: '1.4',   fontWeight: '600' }],
        'body-lg': ['1.125rem',{ lineHeight: '1.6',   fontWeight: '400' }],
        'body':    ['1rem',    { lineHeight: '1.6',   fontWeight: '400' }],
        'body-sm': ['0.875rem',{ lineHeight: '1.5',   fontWeight: '400' }],
        'caption': ['0.75rem', { lineHeight: '1.4',   fontWeight: '500', letterSpacing: '0.02em' }],
        'overline':['0.6875rem',{lineHeight: '1.4',   fontWeight: '600', letterSpacing: '0.08em' }],
      },
      borderRadius: {
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
      },
      boxShadow: {
        'glow': '0 0 20px var(--brand-glow)',
        'glow-lg': '0 0 40px var(--brand-glow)',
      },
      animation: {
        'float': 'float 20s ease-in-out infinite',
        'pulse-dot': 'pulseDot 2s ease-in-out infinite',
        'shimmer': 'shimmer 1.5s ease-in-out infinite',
        'count-up': 'countUp 2s ease-out forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-20px)' },
        },
        pulseDot: {
          '0%, 100%': { transform: 'scale(1)',   opacity: '1' },
          '50%':      { transform: 'scale(1.5)', opacity: '0' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      screens: {
        'xs': '480px',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
  ],
}

export default config
```

---

## 12. Design Tokens Summary (Quick Reference)

text

```
text┌─────────────────────────────────────────────────────────────┐
│                  DESIGN TOKENS CHEAT SHEET                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  BRAND                                                      │
│  ├── Primary color: #9B1B30 (Deep Crimson Velvet)          │
│  ├── Display font: Kanit                                    │
│  ├── Body font: Inter                                       │
│  └── Default theme: Dark                                    │
│                                                             │
│  SPACING (most used)                                        │
│  ├── Card padding: 20-24px                                 │
│  ├── Section gap: 64-96px                                  │
│  ├── Element gap: 12-16px                                  │
│  └── Inline gap: 8px                                       │
│                                                             │
│  SIZES                                                      │
│  ├── Navbar height: 64px                                   │
│  ├── Sidebar width: 260px / 72px collapsed                 │
│  ├── Card min-width: 300px                                 │
│  ├── Button height: 40px (md)                              │
│  ├── Input height: 44px                                    │
│  └── Match card width: 200px                               │
│                                                             │
│  ANIMATION DURATIONS                                        │
│  ├── Micro: 100ms                                          │
│  ├── Small: 200ms                                          │
│  ├── Medium: 300ms                                         │
│  ├── Large: 500ms                                          │
│  └── Scroll reveal: 600ms                                  │
│                                                             │
│  EASING                                                     │
│  ├── Default: cubic-bezier(0.4, 0, 0.2, 1)                │
│  ├── Enter: cubic-bezier(0, 0, 0.2, 1)                    │
│  ├── Exit: cubic-bezier(0.4, 0, 1, 1)                     │
│  └── Spring: cubic-bezier(0.34, 1.56, 0.64, 1)            │
│                                                             │
│  Z-INDEX SCALE                                              │
│  ├── Dropdown: 40                                          │
│  ├── Sticky (navbar): 50                                   │
│  ├── Overlay: 60                                           │
│  ├── Modal: 70                                             │
│  ├── Toast: 80                                             │
│  └── Tooltip: 90                                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```
