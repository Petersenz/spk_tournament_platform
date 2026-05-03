# กระบวนการ QA/QC 10 ขั้นตอน (Full Pipeline)

> อ้างอิงจาก SYNERRY Guide — ครอบคลุมตั้งแต่ planning จนถึง post-release monitoring
> แต่ละขั้นตอนระบุ: ทำอะไร, ใช้ tools อะไร, ทำเมื่อไหร่

---

## Visual Pipeline — ภาพรวมทั้ง 10 ขั้นตอน

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    QA/QC 10-Step Pipeline                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │ 1.Plan & │→ │ 2.Code & │→ │ 3.AI     │→ │ 4.Archi- │→ │ 5.Auto   │ │
│  │ Standards│  │ Real-Time│  │ Code     │  │ tecture  │  │ Testing  │ │
│  │          │  │ Review   │  │ Review   │  │ Review   │  │          │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘ │
│       ↓              ↓             ↓             ↓             ↓       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │ 6.Secu-  │→ │ 7.Perf   │→ │ 8.UAT    │→ │ 9.Deploy │→ │10.Post-  │ │
│  │ rity     │  │ Testing  │  │          │  │          │  │ Release  │ │
│  │ Testing  │  │          │  │          │  │          │  │ Monitor  │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘ │
│                                                                         │
│  ◄── Prevention (QA) ──────────────►  ◄── Detection (QC) ──────────►  │
│  ◄── Shift Left: ยิ่งเจอเร็ว ยิ่งแก้ถูก ──────────────────────────►  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Step 1: Planning & Standards — วางมาตรฐานก่อนเขียน code

### ทำอะไร

- กำหนด coding standards ให้ทั้งทีม
- ตั้ง linting rules และ formatting rules
- สร้าง Quality Gates ที่ code ต้องผ่านก่อน merge
- กำหนด branching strategy (GitFlow, trunk-based)
- เขียน Definition of Done (DoD)

### Tools ที่ใช้

| Tool              | หน้าที่                               | การตั้งค่า                          |
| ----------------- | ------------------------------------- | ----------------------------------- |
| **ESLint**        | ตรวจ code quality + best practices    | `.eslintrc` หรือ `eslint.config.js` |
| **Prettier**      | Format code ให้เหมือนกันทั้งทีม       | `.prettierrc`                       |
| **.cursorrules**  | กำหนดกฎให้ AI assistant ปฏิบัติตาม    | `.cursorrules` ที่ root             |
| **Quality Gates** | เงื่อนไขที่ต้องผ่านก่อน merge         | CI/CD pipeline config               |
| **Husky**         | Git hooks สำหรับ pre-commit, pre-push | `.husky/` directory                 |
| **commitlint**    | ตรวจ commit message format            | `commitlint.config.js`              |

### ทำเมื่อไหร่

- **ก่อนเริ่ม project** — ตั้งค่าครั้งเดียว
- **ทบทวนทุกไตรมาส** — ปรับ rules ตาม lessons learned

### Quality Gate ตัวอย่าง

```
Pre-merge Checklist:
☐ ESLint ผ่าน (0 errors)
☐ Prettier formatted
☐ Unit test coverage >= 70%
☐ No critical/high vulnerabilities
☐ PR reviewed by >= 1 person
☐ No TODO/FIXME in production code
```

---

## Step 2: Code Writing & Real-Time Review — เขียน code พร้อมตรวจแบบ real-time

### ทำอะไร

- เขียน code ตาม standards ที่กำหนด
- ใช้ IDE extensions ตรวจ code ระหว่างเขียน
- AI assistant ช่วยเขียนและตรวจ real-time
- ดัก bug ตั้งแต่ยังอยู่ใน editor (ก่อน commit)

### Tools ที่ใช้

| Tool                             | หน้าที่                             | ทำงานอย่างไร                       |
| -------------------------------- | ----------------------------------- | ---------------------------------- |
| **SonarLint**                    | ตรวจ code quality + security ใน IDE | ขีดเส้นใต้ปัญหาแบบ real-time       |
| **Qodo Gen** (เดิมชื่อ CodiumAI) | AI สร้าง test + review code         | แนะนำ test cases จาก code ที่เขียน |
| **ESLint IDE Extension**         | ตรวจ linting rules ใน editor        | แสดง errors/warnings ทันที         |
| **Prettier IDE Extension**       | Auto-format เมื่อ save              | Format on Save                     |
| **GitHub Copilot / Cursor AI**   | AI ช่วยเขียน code                   | Autocomplete + chat                |

### ทำเมื่อไหร่

- **ทุกครั้งที่เขียน code** — real-time ตลอด
- **ก่อน commit** — ตรวจสอบรอบสุดท้ายว่า clean

### Best Practices

1. เปิด **Format on Save** ใน IDE เสมอ
2. ตั้ง ESLint เป็น **error** (ไม่ใช่ warning) สำหรับ rules สำคัญ
3. ใช้ SonarLint ดัก security issues ตั้งแต่ใน editor
4. ให้ AI ช่วย review code ก่อน push — ถามว่า "code นี้มี bug ไหม?"

---

## Step 3: AI Code Review — ให้ AI ตรวจ code อัตโนมัติเมื่อเปิด PR

### ทำอะไร

- AI bot review PR อัตโนมัติเมื่อเปิด pull request
- ตรวจ code quality, security, performance, best practices
- แนะนำการปรับปรุง + ให้ score
- ลดภาระ human reviewer

### Tools ที่ใช้

| Tool                               | หน้าที่                            | ราคา                        |
| ---------------------------------- | ---------------------------------- | --------------------------- |
| **CodeRabbit**                     | AI review PR แบบละเอียด ทุก commit | Free tier มี / Pro ~$12/mo  |
| **Qodo Merge** (เดิมชื่อ PR-Agent) | AI review + suggest improvements   | Open source / Cloud version |
| **PR-Agent**                       | GitHub bot ตรวจ PR อัตโนมัติ       | Open source                 |
| **GitHub Copilot PR Review**       | Copilot review ใน PR               | รวมกับ Copilot subscription |

### ทำเมื่อไหร่

- **ทุกครั้งที่เปิด PR** — trigger อัตโนมัติ
- **ทุกครั้งที่ push commit ใหม่** — review ซ้ำ

### AI Review ตรวจอะไรบ้าง

```
CodeRabbit Review Checklist:
├── Code Quality        — ซ้ำซ้อน, complexity, naming
├── Security            — SQL injection, XSS, hardcoded secrets
├── Performance         — N+1 queries, unnecessary re-renders
├── Best Practices      — Error handling, type safety
├── Test Coverage       — มี test สำหรับ logic ใหม่ไหม
└── Documentation       — Comments, JSDoc, README updates
```

### ข้อควรระวัง

- AI review ไม่ได้แทน human review — ใช้เป็น **first pass**
- Human reviewer ดู business logic, architecture decisions
- AI อาจ false positive — ทีมต้อง calibrate rules

---

## Step 4: Architecture Review — ตรวจโครงสร้าง code ในระดับ macro

### ทำอะไร

- ตรวจ dependency graph ว่ามี circular dependencies ไหม
- ตรวจ unused dependencies
- วิเคราะห์ code complexity ทั้ง project
- ตรวจ architectural patterns (separation of concerns, SOLID)

### Tools ที่ใช้

| Tool                     | หน้าที่                                           | วิธีใช้                       |
| ------------------------ | ------------------------------------------------- | ----------------------------- |
| **Claude Code**          | AI วิเคราะห์ architecture ทั้ง project            | ถามเรื่อง structure, patterns |
| **depcheck**             | หา unused dependencies                            | `npx depcheck`                |
| **madge**                | สร้าง dependency graph + หา circular deps         | `npx madge --circular src/`   |
| **SonarQube**            | วิเคราะห์ code quality + complexity แบบ dashboard | Self-hosted หรือ Cloud        |
| **Compodoc / Storybook** | Document components + architecture                | Generate docs อัตโนมัติ       |

### ทำเมื่อไหร่

- **ทุกสัปดาห์** — quick scan ด้วย depcheck + madge
- **ทุก sprint** — deep review ด้วย SonarQube
- **ก่อน major release** — full architecture review

### สิ่งที่ต้องตรวจ

```
Architecture Review Checklist:
☐ ไม่มี circular dependencies
☐ ไม่มี unused dependencies (ลดขนาด bundle)
☐ Code complexity ไม่เกินเกณฑ์ (cyclomatic < 15)
☐ Separation of concerns ชัดเจน
☐ ไม่มี god files (ไฟล์เดียว > 500 บรรทัด)
☐ API contracts ตรงกับ documentation
☐ Database schema สอดคล้องกับ business requirements
```

---

## Step 5: Automated Testing — ทดสอบอัตโนมัติ 3 ระดับ

### ทำอะไร

- เขียนและรัน test อัตโนมัติทั้ง 3 ระดับของ Testing Pyramid
- ตั้ง test coverage threshold
- รัน tests ใน CI/CD pipeline

### Tools ที่ใช้

| ระดับ           | Tool                 | ทดสอบอะไร                          | ความเร็ว     |
| --------------- | -------------------- | ---------------------------------- | ------------ |
| **Unit**        | Vitest / Jest        | Function เดียว, logic เดียว        | เร็วมาก (ms) |
| **Integration** | Supertest            | API endpoints, module interactions | ปานกลาง (s)  |
| **E2E**         | Playwright / Cypress | Full user flow บน browser          | ช้า (min)    |

### ทำเมื่อไหร่

| ประเภท            | Trigger                      | ที่ไหน      |
| ----------------- | ---------------------------- | ----------- |
| Unit Tests        | ทุก commit (pre-commit hook) | Local + CI  |
| Integration Tests | ทุก PR                       | CI pipeline |
| E2E Tests         | ก่อน merge to main           | CI pipeline |
| Full Suite        | ก่อน release                 | CI pipeline |

### Coverage Targets

```
Minimum Coverage Thresholds:
├── Statements  : >= 70%
├── Branches    : >= 65%
├── Functions   : >= 70%
└── Lines       : >= 70%

Ideal Coverage (เป้าหมาย):
├── Statements  : >= 85%
├── Branches    : >= 80%
├── Functions   : >= 85%
└── Lines       : >= 85%
```

### Best Practices

1. **Test ที่ดี = อิสระจากกัน** — test หนึ่งพังไม่กระทบอีก test
2. **ตั้งชื่อ test ให้อ่านรู้เรื่อง** — `should return error when email is invalid`
3. **Test edge cases** — null, undefined, empty string, boundary values
4. **อย่าเขียน test ที่ test implementation** — test behavior/output แทน
5. **Mock external dependencies** — API, database, file system

---

## Step 6: Security Testing — ทดสอบความปลอดภัย 4 ด้าน

### ทำอะไร

- สแกน code หา vulnerabilities (SAST)
- ตรวจ dependencies หาช่องโหว่ (SCA)
- ทดสอบ running application (DAST)
- สแกนหา secrets ที่หลุดเข้า code

### Tools ที่ใช้ (4 ด้าน)

#### 6.1 SAST — Static Application Security Testing

| Tool          | หน้าที่                         | วิธีใช้                   |
| ------------- | ------------------------------- | ------------------------- |
| **SonarQube** | สแกน security rules ใน code     | CI pipeline / self-hosted |
| **Semgrep**   | Pattern-based security scanning | `semgrep --config auto`   |

#### 6.2 SCA — Software Composition Analysis

| Tool          | หน้าที่                              | วิธีใช้     |
| ------------- | ------------------------------------ | ----------- |
| **Snyk**      | ตรวจ vulnerabilities ใน dependencies | `snyk test` |
| **npm audit** | Built-in dependency audit            | `npm audit` |

#### 6.3 DAST — Dynamic Application Security Testing

| Tool          | หน้าที่                     | วิธีใช้                        |
| ------------- | --------------------------- | ------------------------------ |
| **OWASP ZAP** | สแกน running app หาช่องโหว่ | Proxy mode หรือ automated scan |
| **StackHawk** | DAST ใน CI/CD               | GitHub Actions integration     |

#### 6.4 Secret Scanning

| Tool            | หน้าที่                     | วิธีใช้                     |
| --------------- | --------------------------- | --------------------------- |
| **Gitleaks**    | สแกน git history หา secrets | `gitleaks detect`           |
| **GitGuardian** | Real-time secret detection  | GitHub App / CI integration |

### ทำเมื่อไหร่

| ประเภท      | ความถี่                   | Trigger                  |
| ----------- | ------------------------- | ------------------------ |
| SAST        | ทุก PR                    | CI pipeline              |
| SCA         | ทุกวัน                    | Scheduled CI + pre-merge |
| DAST        | ทุกสัปดาห์ + ก่อน release | Staging environment      |
| Secret Scan | ทุก commit                | Pre-commit hook + CI     |

---

## Step 7: Performance Testing — ทดสอบประสิทธิภาพ

### ทำอะไร

- วัด page load speed และ Core Web Vitals
- ทำ load testing (รับ traffic ได้เท่าไหร่)
- ทำ stress testing (พังที่จุดไหน)
- Monitor performance ต่อเนื่อง

### Tools ที่ใช้

| Tool                   | หน้าที่                                    | เหมาะกับ             |
| ---------------------- | ------------------------------------------ | -------------------- |
| **Lighthouse**         | วัด performance, a11y, SEO, best practices | Frontend / Web pages |
| **k6**                 | Load testing + stress testing              | Backend / API        |
| **PageSpeed Insights** | วัด Core Web Vitals จาก Google             | Production URLs      |
| **WebPageTest**        | Deep performance analysis                  | Production / Staging |

### ทำเมื่อไหร่

| ประเภท             | ความถี่      | เป้าหมาย                 |
| ------------------ | ------------ | ------------------------ |
| Lighthouse         | ทุก PR (CI)  | Score >= 90              |
| k6 Load Test       | ก่อน release | รับ expected traffic ได้ |
| k6 Stress Test     | ทุกเดือน     | รู้จุด breaking point    |
| PageSpeed Insights | ทุกสัปดาห์   | Core Web Vitals ผ่าน     |

### Core Web Vitals เป้าหมาย

```
LCP (Largest Contentful Paint)  : < 2.5s   (หน้าโหลดเร็ว)
FID (First Input Delay)         : < 100ms  (ตอบสนองเร็ว)
CLS (Cumulative Layout Shift)   : < 0.1    (ไม่กระตุก)
INP (Interaction to Next Paint) : < 200ms  (interact ได้ลื่น)
```

---

## Step 8: UAT — User Acceptance Testing

### ทำอะไร

- ทดสอบด้วยคนจริง (ไม่ใช่ automation)
- ตรวจว่า feature ตรงกับ business requirements
- ทดสอบ usability — ใช้งานง่ายไหม?
- ทดสอบ accessibility — คนพิการใช้ได้ไหม?

### กิจกรรมหลัก

| กิจกรรม                   | ทำอะไร                                | ใครทำ                    |
| ------------------------- | ------------------------------------- | ------------------------ |
| **Manual Testing**        | ทดสอบ happy path + edge cases ด้วยมือ | QA Team                  |
| **Usability Testing**     | ให้ user จริงลองใช้ สังเกตปัญหา       | UX Team + Real Users     |
| **Accessibility Audit**   | ตรวจตาม WCAG 2.1 AA                   | QA + Accessibility Tools |
| **Cross-browser Testing** | ทดสอบบน Chrome, Firefox, Safari, Edge | QA Team                  |
| **Cross-device Testing**  | ทดสอบบน Desktop, Tablet, Mobile       | QA Team                  |

### ทำเมื่อไหร่

- **ก่อน release ทุกครั้ง** — mandatory
- **หลัง major feature เสร็จ** — feature-specific UAT
- **Staging environment** — ไม่ทำบน production

### UAT Checklist

```
UAT Sign-off Criteria:
☐ ทุก user story ทดสอบผ่าน
☐ ไม่มี critical/high bugs ค้าง
☐ Usability feedback ถูก address
☐ Cross-browser ผ่าน (Chrome, Firefox, Safari)
☐ Mobile responsive ทำงานถูกต้อง
☐ Accessibility score >= 90 (Lighthouse)
☐ Business owner approve
```

---

## Step 9: Deployment — นำขึ้น production อย่างปลอดภัย

### ทำอะไร

- ใช้ CI/CD pipeline อัตโนมัติ
- Container deployment ด้วย Docker
- Feature flags ควบคุม feature ใหม่
- Canary deployment ลดความเสี่ยง

### Tools ที่ใช้

| Tool                                     | หน้าที่                            | ข้อดี                         |
| ---------------------------------------- | ---------------------------------- | ----------------------------- |
| **GitLab CI/CD** / **GitHub Actions**    | Automated build + deploy pipeline  | ตั้งค่าง่าย, ฟรี              |
| **Docker**                               | Container deployment               | ทำงานเหมือนกันทุก environment |
| **Feature Flags** (LaunchDarkly/Unleash) | เปิด/ปิด feature โดยไม่ต้อง deploy | ลดความเสี่ยง                  |
| **Kubernetes** / **Docker Compose**      | Orchestration                      | Scale ได้, self-healing       |

### Deployment Strategies

```
1. Rolling Update (ค่อยๆ เปลี่ยน)
   [v1][v1][v1][v1] → [v2][v1][v1][v1] → [v2][v2][v1][v1] → [v2][v2][v2][v2]

2. Canary Deploy (ทดลองบางส่วน)
   [v1][v1][v1][v1] → [v2][v1][v1][v1]  ← 25% traffic ไป v2
   ถ้า OK → [v2][v2][v2][v2]
   ถ้าพัง → [v1][v1][v1][v1]  ← rollback ทันที

3. Blue-Green (สลับ environment)
   Blue [v1] ← traffic     Green [v2] (standby)
   Blue [v1] (standby)     Green [v2] ← traffic  ← สลับ
```

### ทำเมื่อไหร่

- **ทุก merge to main** — auto deploy to staging
- **Manual trigger** — deploy to production (หลัง UAT ผ่าน)
- **Hotfix** — fast-track pipeline สำหรับ critical bugs

### Deployment Checklist

```
Pre-deploy:
☐ ทุก test ผ่านใน CI
☐ Security scan ผ่าน
☐ Performance baseline OK
☐ Database migration ready
☐ Rollback plan documented

Post-deploy:
☐ Health check ผ่าน
☐ Smoke test ผ่าน
☐ Monitoring alerts active
☐ Stakeholder notified
```

---

## Step 10: Post-Release Monitoring — เฝ้าระวังหลัง deploy

### ทำอะไร

- Monitor errors แบบ real-time
- ตรวจ uptime และ performance
- เก็บ user feedback
- แจ้งเตือนทีมทันทีเมื่อมีปัญหา

### Tools ที่ใช้

| Tool                                | หน้าที่                          | ข้อดี                       |
| ----------------------------------- | -------------------------------- | --------------------------- |
| **Sentry**                          | Error tracking + crash reporting | ดู stack trace, user impact |
| **Grafana** + **Prometheus**        | Metrics dashboard + alerting     | เห็นภาพรวมระบบ real-time    |
| **UptimeRobot** / **Better Uptime** | Uptime monitoring                | แจ้งเตือนเมื่อ down         |
| **Lark Alerts** / **Slack Alerts**  | ส่ง notification ให้ทีม          | รู้ปัญหาทันที               |
| **LogRocket** / **Hotjar**          | Session replay + heatmap         | เข้าใจ user behavior        |

### ทำเมื่อไหร่

- **ตลอดเวลา** — 24/7 monitoring
- **หลัง deploy ทุกครั้ง** — เฝ้าระวังพิเศษ 1-2 ชม.
- **Review ทุกสัปดาห์** — ดู trends, anomalies

### Alert Levels

| Level           | เงื่อนไข                | Action                          |
| --------------- | ----------------------- | ------------------------------- |
| **P0 Critical** | System down / data loss | แจ้งทีมทันที, แก้ใน 15 นาที     |
| **P1 High**     | Major feature broken    | แจ้งทีมใน 30 นาที, แก้ใน 2 ชม.  |
| **P2 Medium**   | Minor feature broken    | แจ้ง next business day          |
| **P3 Low**      | Cosmetic / nice-to-have | ใส่ backlog, แก้ใน sprint ถัดไป |

### Monitoring Dashboard ควรมีอะไร

```
Essential Metrics:
├── Uptime %           — เป้าหมาย 99.9%+
├── Error Rate         — เป้าหมาย < 0.1%
├── Response Time p95  — เป้าหมาย < 500ms
├── Active Users       — เทียบกับ baseline
├── CPU / Memory       — เป้าหมาย < 70%
└── Deploy Frequency   — track velocity
```

---

> ดูภาพรวม pipeline ทั้งหมดแบบ visual ได้ที่ [pipeline-visual.md](./pipeline-visual.md)
> หรือดูตาราง maintenance ที่ [maintenance-schedule.md](./maintenance-schedule.md)
