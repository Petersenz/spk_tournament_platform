# QA-QC Master --- Command Center

> **SYNERRY AI Team --- SaaS Quality Assurance Guide 2026**
>
> ระบบควบคุมคุณภาพแบบครบวงจรสำหรับ SaaS Product
> อัปเดตล่าสุด: 2026-04-06

---

## Quick Links

| #   | เอกสาร               | คำอธิบาย                                        | ลิงก์                                                 |
| --- | -------------------- | ----------------------------------------------- | ----------------------------------------------------- |
| 1   | Credentials          | รหัสเข้าระบบ API Keys & Tokens ทั้งหมด          | [\_credentials.md](_credentials.md)                   |
| 2   | Tool Status          | สถานะเครื่องมือทุกตัว (active / expired / free) | [\_tool-status.md](_tool-status.md)                   |
| 3   | Install Guide        | วิธีติดตั้งเครื่องมือทั้งหมดตั้งแต่ต้น          | [\_install-guide.md](_install-guide.md)               |
| 4   | Maintenance Schedule | ตาราง maintenance รายสัปดาห์/เดือน/ไตรมาส       | [\_maintenance-schedule.md](_maintenance-schedule.md) |
| 5   | KPI Metrics          | เป้าหมายคุณภาพ & ตัวชี้วัดทุกด้าน               | [\_kpi-metrics.md](_kpi-metrics.md)                   |

---

## QA/QC Pipeline --- 10 Steps / 9 Folders

> ทำตามลำดับ Step 0-9 เพื่อคุณภาพสูงสุด
> แต่ละ folder มี `_overview.md` เป็นจุดเริ่มต้น

| Step | ชื่อขั้นตอน        | Folder                | เครื่องมือ | Free/Paid | ใช้เมื่อไหร่                                 |                 Overview                  |
| :--: | ------------------ | --------------------- | :--------: | :-------: | -------------------------------------------- | :---------------------------------------: |
|  0   | พื้นฐาน QA vs QC   | `00-foundation/`      |     5      |   Free    | เริ่มต้นโปรเจกต์ / onboard ทีมใหม่           |    [เปิด](00-foundation/_overview.md)     |
|  1   | คุณภาพ Code        | `01-code-quality/`    |     7      |   Mixed   | ทุกครั้งที่เขียน/review code                 |   [เปิด](01-code-quality/_overview.md)    |
|  2   | ความปลอดภัย        | `02-security/`        |     6      |   Mixed   | ก่อน deploy ทุกครั้ง / รายสัปดาห์            |     [เปิด](02-security/_overview.md)      |
|  3   | การทดสอบ           | `03-testing/`         |     7      |   Mixed   | ทุก sprint / ก่อน release                    |      [เปิด](03-testing/_overview.md)      |
|  4   | Performance & SEO  | `04-performance-seo/` |     4      |   Mixed   | หลัง deploy / รายสัปดาห์                     |  [เปิด](04-performance-seo/_overview.md)  |
|  5   | Monitoring & Alert | `05-monitoring/`      |     5      |   Mixed   | ตลอดเวลา (24/7)                              |    [เปิด](05-monitoring/_overview.md)     |
|  6   | AI Models QA       | `06-ai-models/`       |     5      |   Paid    | เมื่อใช้ AI ใน product / review architecture |     [เปิด](06-ai-models/_overview.md)     |
|  7   | Infrastructure     | `07-infrastructure/`  |     8      |   Mixed   | setup CI/CD / deploy / scale                 |  [เปิด](07-infrastructure/_overview.md)   |
|  8   | Checklists         | `08-checklists/`      |     6      |   Free    | ก่อน launch / gate review ทุกครั้ง           |    [เปิด](08-checklists/_overview.md)     |
|  9   | Enterprise 360     | Dashboard             |     1      |   Free    | ดูภาพรวมทั้งระบบ                             | [เปิด](08-checklists/enterprise-360.html) |

---

## รายละเอียดแต่ละ Folder

### Step 0 --- Foundation (`00-foundation/`)

- QA vs QC --- ความแตกต่างและหน้าที่
- 10-Step QA/QC Process --- กระบวนการทำงานทั้งหมด
- Maintenance Schedule --- ตารางดูแลระบบ
- KPIs & Metrics --- ตัวชี้วัดคุณภาพ
- Pipeline Overview --- ภาพรวม pipeline ทั้ง 10 ขั้นตอน

### Step 1 --- Code Quality (`01-code-quality/`)

- ESLint --- static analysis & linting rules
- Prettier --- code formatting
- SonarQube --- deep code analysis (bugs, smells, coverage)
- CodeRabbit --- AI-powered code review (PR review)
- Qodo (ex-CodiumAI) --- AI test generation & code integrity
- Code Analysis --- metrics & complexity analysis
- IDE Extensions --- Cursor / VS Code extensions ที่แนะนำ

### Step 2 --- Security (`02-security/`)

- Secret Scanning --- ตรวจจับ API keys / passwords ที่หลุด
- SAST --- Static Application Security Testing
- SCA --- Software Composition Analysis (dependency vulnerabilities)
- DAST --- Dynamic Application Security Testing
- Docker Security --- container image scanning
- Pentest --- penetration testing checklist & tools

### Step 3 --- Testing (`03-testing/`)

- Unit Test --- Vitest (fast, Vite-native)
- Integration Test --- API & service integration
- E2E Test --- Playwright (cross-browser)
- Accessibility Test --- WCAG compliance
- Cross-Browser Test --- compatibility matrix
- Load Test --- k6 (performance under load)
- UAT --- User Acceptance Testing process

### Step 4 --- Performance & SEO (`04-performance-seo/`)

- Lighthouse --- Core Web Vitals audit
- PageSpeed Insights --- Google performance scoring
- Performance Monitoring --- runtime metrics & budgets
- SEO Tools --- technical SEO audit & sitemap

### Step 5 --- Monitoring (`05-monitoring/`)

- Sentry --- error tracking & crash reporting
- Uptime Monitoring --- availability & SLA tracking
- Prometheus + Grafana + Loki --- metrics, dashboards, logs
- Alerting --- notification rules & escalation
- Analytics --- user behavior & product analytics

### Step 6 --- AI Models QA (`06-ai-models/`)

- Claude Opus 4.6 --- Anthropic (primary AI, code & review)
- OpenAI GPT --- ChatGPT / GPT-4o (backup & comparison)
- Gemini --- Google AI (multimodal tasks)
- OpenRouter --- unified API gateway (model switching)
- Architecture Review --- AI-assisted architecture analysis

### Step 7 --- Infrastructure (`07-infrastructure/`)

- GitLab CI/CD --- pipeline configuration & runners
- Git Hooks --- pre-commit, commit-msg, pre-push
- Docker --- containerization & compose setup
- Database --- migration, backup, monitoring
- Auth --- authentication & authorization (JWT, OAuth)
- Payment --- payment gateway integration & PCI compliance
- Email --- transactional email service
- Deployment --- staging / production deploy process

### Step 8 --- Checklists (`08-checklists/`)

- Enterprise 360 Checklist --- 143 items ครอบคลุมทุกด้าน
- Quality Gate --- criteria ที่ต้องผ่านก่อน deploy
- Design Checklist --- UI/UX review points
- Code Checklist --- code review standards
- Pre-Launch Checklist --- go-live readiness
- Compliance Checklist --- PDPA, GDPR, security compliance

---

## Budget --- สถานะจริง (ณ April 2026)

> **สำคัญ:** ตารางนี้คือสิ่งที่สมัคร+จ่ายจริงแล้ว ไม่ใช่ประมาณการ

### Subscriptions ที่ใช้อยู่

| เครื่องมือ             | Plan         | ค่าใช้จ่ายจริง |   สถานะ   | หมายเหตุ                                                          |
| ---------------------- | ------------ | :------------: | :-------: | ----------------------------------------------------------------- |
| Claude Code (Opus 4.6) | **Max Plan** | รวมใน Max Plan | ✅ Active | ไม่ใช่ usage-based --- ใช้ได้ไม่จำกัดใน Max Plan                  |
| CodeRabbit             | **Pro**      |   $24/dev/mo   | ✅ Active | สมัครแล้ว --- ต้องเชื่อม repo ใหม่ทุกครั้งที่ copy ไปโปรเจกต์อื่น |
| Qodo (PR-Agent)        | **Teams**    |  $30/user/mo   | ✅ Active | สมัครแล้ว --- ต้องเชื่อม repo ใหม่ทุกครั้งที่ copy ไปโปรเจกต์อื่น |

### Free Tools (ไม่มีค่าใช้จ่าย)

| เครื่องมือ          | หมวด                            |
| ------------------- | ------------------------------- |
| Snyk CLI            | SCA + container scan            |
| SonarQube Community | self-hosted code analysis       |
| ESLint + Prettier   | linting + formatting            |
| Playwright          | E2E testing                     |
| Vitest              | unit testing                    |
| k6                  | load testing                    |
| Sentry (Developer)  | error tracking (5K events/mo)   |
| Lighthouse          | performance audit               |
| Gitleaks            | secret detection                |
| UptimeRobot         | uptime monitoring (50 monitors) |

### เมื่อ copy ไปโปรเจกต์ใหม่ --- ต้องทำเพิ่ม

| เครื่องมือ | สิ่งที่ต้องทำ                                                                 |
| ---------- | ----------------------------------------------------------------------------- |
| CodeRabbit | เพิ่ม repo ใหม่ใน app.coderabbit.ai + สร้าง `.coderabbit.yaml` + ตั้ง webhook |
| Qodo       | เพิ่ม repo ใหม่ใน app.qodo.ai + เพิ่ม `QODO_API_KEY` ใน CI/CD Variables       |
| Sentry     | สร้าง project ใหม่ใน sentry.io + ใส่ DSN ใหม่                                 |
| Snyk       | รัน `snyk monitor` ใน repo ใหม่                                               |

---

## Setup ของระบบ

### Development Environment

| Component      | รายละเอียด                                |
| -------------- | ----------------------------------------- |
| **IDE**        | Cursor IDE (VS Code-based, AI-native)     |
| **AI CLI**     | Claude Code CLI --- Opus 4.6 (1M context) |
| **Git Server** | GitLab Self-Hosted (full CI/CD pipeline)  |
| **OS**         | macOS / Linux                             |
| **Runtime**    | Node.js 20 LTS + pnpm                     |

### AI Integration Stack

```
Cursor IDE
    |
    +-- Claude Code CLI (Opus 4.6)
    |       |-- Code generation & review
    |       |-- Architecture analysis
    |       |-- Debug & refactor
    |       +-- Documentation
    |
    +-- CodeRabbit Pro (✅ สมัครแล้ว)
    |       +-- Auto PR/MR review
    |
    +-- Qodo Teams (✅ สมัครแล้ว)
            +-- Auto test generation
```

### GitLab CI/CD Pipeline

```
Push --> Lint --> Test --> Security Scan --> Build --> Deploy Staging --> Gate Review --> Deploy Production
                                                                            |
                                                            Enterprise 360 Checklist (143 items)
```

---

## Enterprise 360 Dashboard

> Dashboard แบบ HTML ที่รวมผลตรวจสอบทั้ง 143 รายการไว้ในหน้าเดียว

[เปิด Enterprise 360 Dashboard](08-checklists/enterprise-360.html)

ครอบคลุม 8 หมวด:

1. Code Quality Score
2. Security Posture
3. Test Coverage
4. Performance Metrics
5. Monitoring Status
6. AI Model Health
7. Infrastructure Readiness
8. Compliance Status

---

## Copy ไปโปรเจกต์ใหม่ --- ทำ 7 ขั้นตอนนี้

> **ทำตามนี้ทุกครั้ง** เมื่อ copy folder `QA-QC_Master/` ไปโปรเจกต์อื่น

| #   | ทำอะไร                                  | คำสั่ง / วิธี                                                                                          | ⏱️      |
| --- | --------------------------------------- | ------------------------------------------------------------------------------------------------------ | ------- |
| 1   | เพิ่ม `_credentials.md` ใน `.gitignore` | เพิ่มบรรทัด `QA-QC_Master/_credentials.md` ใน `.gitignore` ของโปรเจกต์ใหม่                             | 1 นาที  |
| 2   | ใส่ค่า API Keys จริง                    | เปิด `_credentials.md` → เปลี่ยน `YOUR_xxx_HERE` ทุกตัว                                                | 10 นาที |
| 3   | เชื่อม CodeRabbit เข้า repo ใหม่        | [app.coderabbit.ai](https://app.coderabbit.ai/) → Add Repository → เลือก repo → ตั้ง webhook ใน GitLab | 5 นาที  |
| 4   | เชื่อม Qodo เข้า repo ใหม่              | [app.qodo.ai](https://app.qodo.ai/) → Add Repository → เพิ่ม `QODO_API_KEY` ใน CI/CD Variables         | 5 นาที  |
| 5   | สร้าง Sentry project ใหม่               | [sentry.io](https://sentry.io/) → Create Project → copy DSN ใส่ `_credentials.md`                      | 5 นาที  |
| 6   | รัน Snyk ใน repo ใหม่                   | `cd <project> && snyk test && snyk monitor`                                                            | 2 นาที  |
| 7   | ตรวจสอบ \_tool-status.md                | เปิด[\_tool-status.md](_tool-status.md) → อัปเดตสถานะให้ตรงกับโปรเจกต์ใหม่                             | 5 นาที  |

### Optional Tools (ติดตั้งเมื่อต้องการ)

5 tools ด้านล่างนี้ **ไม่จำเป็นต้องติดตั้งทุกโปรเจกต์** — ติดตั้งเมื่อถึงขั้นตอนที่ต้องใช้จริง

| Tool           | ใช้ทำอะไร                       | ติดตั้งยังไง                    | ต้องการเมื่อไหร่                    |
| -------------- | ------------------------------- | ------------------------------- | ----------------------------------- |
| OWASP ZAP      | สแกน web vulnerabilities        | `docker run zaproxy/zap-stable` | ก่อน launch production              |
| testssl.sh     | ตรวจ SSL/TLS                    | `brew install testssl`          | เมื่อ deploy HTTPS แล้ว             |
| Screaming Frog | SEO crawler                     | ดาวน์โหลด desktop app           | เมื่อต้องการ SEO audit              |
| Uptime Kuma    | uptime monitoring (self-hosted) | `docker compose`                | เมื่อต้องการ self-hosted monitoring |
| Bruno          | API client                      | `brew install --cask bruno`     | เมื่อต้องการ test API               |

---

## วิธีใช้งาน (เมื่อ setup เสร็จแล้ว)

1. **เริ่มต้น** --- อ่าน [00-foundation/\_overview.md](00-foundation/_overview.md) เข้าใจ QA vs QC
2. **ทำตาม Pipeline** --- ไล่ทำ Step 0-8 ตามตารางด้านบน
3. **ก่อน Launch** --- เปิด [08-checklists/\_overview.md](08-checklists/_overview.md) ตรวจทุกข้อ
4. **หลัง Launch** --- ดู Dashboard [Enterprise 360](08-checklists/enterprise-360.html) ทุกสัปดาห์

---

## Prompt สำหรับ Scan อัตโนมัติ

> **วิธีใช้:** Copy ข้อความตั้งแต่บรรทัด `คุณคือ QA Engineer` ถึง `เริ่มเลย ห้ามถาม` → Paste ให้ Claude Code / Cursor → ไปนอนได้ → เช้ามาอ่าน report ที่ `QA-QC_Master/nightwatch/results/summary.md`

---

คุณคือ QA Engineer อัตโนมัติ ทำงานตาม QA-QC_Master framework ที่อยู่ใน project นี้

## กฎเหล็ก

1. ห้ามถาม user — ทำงานอัตโนมัติทั้งหมด ถ้าไม่แน่ใจให้เลือกทางที่ safe ที่สุด
2. ห้ามข้าม — ทำทีละ phase ครบทุก check ก่อนไป phase ถัดไป
3. ห้ามโกหก — ทุก check ต้องรันจริง แสดง output จริง ห้ามเขียนว่า "ผ่าน" โดยไม่ได้รัน
4. ห้ามสร้างไฟล์/folder ใหม่ — ยกเว้น report สรุปผล 1 ไฟล์ตอนท้าย
5. tool ไม่ได้ติดตั้ง = skip + บันทึกเหตุผล — ไม่ error ไม่หยุด ข้ามแล้วไป check ถัดไป

## เริ่มต้น

1. หา path ของ project จาก package.json ที่อยู่ใกล้สุด
2. ตรวจว่า project ใช้ framework อะไร (Next.js / Vite / Nuxt / อื่นๆ)
3. ตรวจว่ามี tools อะไรติดตั้งบ้าง (eslint, prettier, vitest, playwright, gitleaks, snyk)
4. แจ้งสั้นๆ 1 บรรทัด: "เริ่ม scan [ชื่อ project] — [framework] — [จำนวน tools ที่พร้อม]"

## Scan 8 Phases ตามลำดับ

### Phase 1: Code Quality

- [ ] รัน `npx eslint .` → นับ errors + warnings
- [ ] รัน `npx prettier --check .` → นับไฟล์ที่ไม่ format
- [ ] รัน `npx depcheck` → นับ unused dependencies
- [ ] รัน `npx madge --circular src/` → นับ circular imports
- [ ] รัน `npx jscpd src/` → ดู % duplication
- [ ] ตรวจ tsconfig.json → strict mode เปิดไหม
- [ ] grep `: any` ใน src/ → นับจำนวน
- [ ] grep `TODO|FIXME` ใน src/ → นับจำนวน
- [ ] grep `console.log` ใน src/ (ไม่นับ test files) → นับจำนวน
- [ ] หาไฟล์ที่เกิน 500 บรรทัดใน src/
- [ ] ตรวจ commitlint config มีไหม
- [ ] ตรวจ eslint config มีไหม

- สรุป Phase 1: กี่ข้อผ่าน / กี่ข้อไม่ผ่าน / score

### Phase 2: Security

- [ ] รัน `gitleaks detect` → มี secret leak ไหม
- [ ] รัน `gitleaks detect --log-opts="--all"` → มี leak ใน history ไหม
- [ ] รัน `npm audit` → นับ critical + high
- [ ] รัน `snyk test` (ถ้ามี) → นับ critical
- [ ] ตรวจ .env ไม่อยู่ใน git: `git ls-files .env`
- [ ] ตรวจ .env.example มีไหม
- [ ] grep hardcoded API keys ใน src/ (pattern: sk*live, AKIA, ghp*, glpat-)
- [ ] grep `eval(` ใน src/
- [ ] grep `dangerouslySetInnerHTML|innerHTML` ใน src/
- [ ] grep CORS wildcard `origin.*\*` ใน src/
- [ ] ตรวจ .gitignore มี .env, node_modules, .next

- สรุป Phase 2: กี่ข้อผ่าน / กี่ข้อไม่ผ่าน / score

### Phase 3: Dependencies

- [ ] รัน `npm audit` → สรุป vulnerabilities ทั้งหมด
- [ ] รัน `npx depcheck` → unused + missing dependencies
- [ ] ตรวจ package-lock.json มีและ synced
- [ ] รัน `npm outdated` → นับ major + minor ที่ outdated
- [ ] รัน `npx license-checker --production` → มี GPL ไหม

- สรุป Phase 3

### Phase 4: Testing

- [ ] รัน `npx vitest run` หรือ `npx jest` → ผ่าน/ไม่ผ่าน + จำนวน tests
- [ ] ดู coverage → กี่ %
- [ ] grep `.skip(` ใน test files → มี skipped tests ไหม
- [ ] grep `.only(` ใน test files → มี .only ไหม
- [ ] ตรวจ playwright config + test files มีไหม
- [ ] รัน `npx playwright test` (ถ้ามี) → ผ่าน/ไม่ผ่าน
- [ ] นับ test files vs src files → ratio เท่าไหร่
- [ ] ตรวจ vitest.config หรือ jest.config มีไหม

- สรุป Phase 4

### Phase 5: Performance (ต้องเปิด dev server)

- [ ] เปิด dev server: `npm run dev` (background) → รอจน ready (curl localhost)
- [ ] รัน `npx lighthouse http://localhost:<port> --output=json --chrome-flags="--headless --no-sandbox"` → อ่าน Performance, Best Practices, FCP, LCP, CLS, TBT
- [ ] ตรวจ bundle size: `du -sh .next/` หรือ `dist/`
- [ ] หา images > 500KB ที่ไม่ optimized
- [ ] ปิด dev server ที่เปิดไว้

- สรุป Phase 5

### Phase 6: Accessibility (ใช้ dev server เดียวกับ Phase 5)

- [ ] ตรวจ axe-core packages มีใน node_modules ไหม
- [ ] grep `<img` ใน src/ → ทุกตัวมี alt ไหม
- [ ] grep `<input` ใน src/ → มี label หรือ aria-label ไหม
- [ ] grep `aria-` ใน src/ → ใช้ ARIA attributes ไหม
- [ ] รัน `npx pa11y http://localhost:<port>` (ถ้ามี) → นับ issues
- [ ] ตรวจ heading hierarchy (h1-h6) ใน src/

- สรุป Phase 6

### Phase 7: Documentation

- [ ] README.md มีและไม่ว่าง (> 10 บรรทัด)
- [ ] CHANGELOG.md หรือ git tags มีไหม
- [ ] .env.example มี keys ครบเทียบกับ .env
- [ ] package.json มี name, version, description, scripts (dev/build/test)
- [ ] ถ้ามี src/app/api/ → มี documentation ไหม

- สรุป Phase 7

### Phase 8: Infrastructure

- [ ] .husky/ มีไหม + executable
- [ ] CI/CD config (.gitlab-ci.yml หรือ .github/workflows/) มีไหม
- [ ] Docker config มีไหม (skip ถ้า project ไม่ต้องการ)
- [ ] .env กับ .env.example keys ตรงกันไหม
- [ ] Node version specified (.nvmrc หรือ engines ใน package.json)
- [ ] รัน `npm run build` → ผ่านไหม (timeout 120s)
- [ ] ไม่มี .env files ใน git: `git ls-files '*.env*'` → ต้องเป็น 0

- สรุป Phase 8

## สร้าง Report สรุป

เมื่อ scan ครบทั้ง 8 phases → สร้างไฟล์ `QA-QC_Master/nightwatch/results/summary.md`:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  QA NIGHT WATCH — SCAN REPORT
  Project: [ชื่อ project]
  Framework: [framework]
  Scan: [วันเวลา]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## HEALTH SCORE

    [████████████████████░░░░░]  XX / 100  Grade: X

## PHASE SUMMARY

| # | Phase | Score | Grade | Pass | Warn | Fail | Skip |
|---|-------|:-----:|:-----:|:----:|:----:|:----:|:----:|
| 1 | Code Quality | XX | X | X | X | X | X |
| 2 | Security | XX | X | X | X | X | X |
| 3 | Dependencies | XX | X | X | X | X | X |
| 4 | Testing | XX | X | X | X | X | X |
| 5 | Performance | XX | X | X | X | X | X |
| 6 | Accessibility | XX | X | X | X | X | X |
| 7 | Documentation | XX | X | X | X | X | X |
| 8 | Infrastructure | XX | X | X | X | X | X |

## CRITICAL — ต้องแก้ทันที
(ลิสต์ issues ที่ severity = critical + location + วิธีแก้)

## HIGH — แก้ใน sprint นี้
(ลิสต์ issues ที่ severity = high)

## MEDIUM — แก้เมื่อว่าง
(ลิสต์ issues ที่ severity = medium)

## DECISION TEMPLATE
- [ ] Phase 1: Code Quality — Score XX (X)
- [ ] Phase 2: Security — Score XX (X)
- [ ] Phase 3: Dependencies — Score XX (X)
- [ ] Phase 4: Testing — Score XX (X)
- [ ] Phase 5: Performance — Score XX (X)
- [ ] Phase 6: Accessibility — Score XX (X)
- [ ] Phase 7: Documentation — Score XX (X)
- [ ] Phase 8: Infrastructure — Score XX (X)

Phase ไหน reject → บอก AI: "rescan phase X แบบละเอียด"
```

## Grading

- A+ (95+): Ship ได้เลย
- A (85-94): Ship ได้ + แก้ minor
- B (70-84): Ship ได้ + plan improvements
- C (60-69): ขั้นต่ำ + ต้องแก้เร็ว
- D (50-59): BLOCKED — แก้ก่อน ship
- F (<50): BLOCKED — ปัญหาหนัก

## คำนวณ Score

- pass = 100, warn = 50, fail = 0, skip = ไม่นับ
- Score = ผลรวมคะแนน / จำนวน checks ที่ไม่ skip

เริ่มเลย ห้ามถาม

---

> **SYNERRY AI Team** | QA-QC Master v1.1 | April 2026
> แก้ไขให้ตรงกับสถานะจริง — ไม่ใช่ template ทฤษฎี
