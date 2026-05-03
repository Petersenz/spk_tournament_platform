# ระบบ QA/QC แบบ 360 องศา สำหรับ SaaS & Web App

## SYNERRY AI Team — Enterprise Quality Assurance System 2026

---

## ทำไมต้องมีระบบ QA/QC

ทุก SaaS และ Web App ที่เราสร้าง เจอปัญหาเดียวกัน:

- **Bug หลุดไป production** — ลูกค้าเจอก่อนเรา
- **AI เขียน code ให้แล้วไม่ตรวจ** — ดูเหมือนทำงาน แต่ data ไม่เข้า DB จริง
- **Security ไม่เคยสแกน** — API key หลุด, SQL injection, XSS
- **Performance ช้า** — หน้าโหลด 5 วินาที ลูกค้าปิดไปเลย
- **Accessibility ไม่เคยตรวจ** — คนพิการใช้งานไม่ได้ ผิดกฎหมาย
- **Deploy แล้วพัง** — ไม่มี checklist ก่อนขึ้น production

เราจึงสร้าง **QA-QC Master** — ระบบตรวจสอบคุณภาพแบบ 360 องศา ที่ครอบคลุมทุกมิติ ตั้งแต่เขียน code จนถึง monitor หลัง deploy

---

## ภาพรวมทั้งระบบ

| ตัวเลข                | ค่า                                 |
| --------------------- | ----------------------------------- |
| **หมวดหลัก**          | 9 หมวด                              |
| **เครื่องมือทั้งหมด** | 75+ ตัว                             |
| **Checklist Items**   | 143 รายการ                          |
| **ขั้นตอน QA/QC**     | 10 ขั้นตอนครบวงจร                   |
| **Maintenance รอบ**   | 5 รอบ (วัน/สัปดาห์/เดือน/ไตรมาส/ปี) |
| **KPI ที่วัด**        | 15 ตัวชี้วัด                        |
| **ทำงานบน**           | Cursor IDE + Claude CLI             |
| **ใช้ได้กับ**         | ทุก SaaS / Web App ที่เราสร้าง      |

---

## QA/QC Pipeline — 10 ขั้นตอนครบวงจร

```
[1.วางมาตรฐาน] → [2.เขียน Code] → [3.AI Review PR] → [4.ตรวจโครงสร้าง] → [5.Testing]
       ↓                ↓                 ↓                  ↓                ↓
[6.Security] → [7.Performance] → [8.UAT] → [9.Deploy] → [10.Monitor]
```

| ขั้นตอน                  | ทำอะไร                                       | เมื่อไหร่             |
| ------------------------ | -------------------------------------------- | --------------------- |
| 1. Planning & Standards  | วาง coding standards, quality gates          | ก่อนเริ่ม project     |
| 2. Real-Time Review      | ตรวจ code ขณะเขียนใน IDE                     | ระหว่างเขียน code     |
| 3. AI Code Review        | AI review ทุก Merge Request อัตโนมัติ        | ทุก MR                |
| 4. Architecture Review   | ตรวจโครงสร้าง, circular imports, tech debt   | สัปดาห์-เดือน         |
| 5. Automated Testing     | Unit, Integration, E2E, Load Testing         | ทุก MR + ก่อน release |
| 6. Security Testing      | SAST, SCA, DAST, Secret Scan, Pentest        | ทุก MR + เดือน-ไตรมาส |
| 7. Performance Testing   | Core Web Vitals, Load Test, Bundle Size      | เดือน-ไตรมาส          |
| 8. UAT                   | User ทดสอบจริง, Usability, Accessibility     | ก่อน release          |
| 9. Deployment            | CI/CD pipeline, Feature Flags, Canary Deploy | ทุก release           |
| 10. Post-Release Monitor | Error tracking, Uptime, Metrics, Alerts      | ตลอดเวลา              |

---

## หมวดที่ 1: Code Quality & Review — ตรวจคุณภาพ Code

> **ปัญหาที่แก้:** Code ไม่เป็นมาตรฐาน, bug หลุดเข้า main, ไม่มีคน review

| เครื่องมือ     | ทำหน้าที่อะไร                 | ตรวจเรื่องอะไร                                | ถ้าไม่ตรวจ จะเกิดอะไร                       |
| -------------- | ----------------------------- | --------------------------------------------- | ------------------------------------------- |
| **ESLint**     | ตรวจ code patterns + bugs     | Logic errors, unused vars, complexity         | Code ยุ่งเหยิง, bug ง่ายๆ หลุดไป production |
| **Prettier**   | จัดรูปแบบ code อัตโนมัติ      | Formatting, indentation, spacing              | ทีมเขียน code คนละ style อ่านไม่รู้เรื่อง   |
| **SonarQube**  | วิเคราะห์ code quality ลึก    | Code smells, tech debt, coverage, bugs        | Tech debt สะสมจนแก้ไม่ไหว ต้องเขียนใหม่     |
| **SonarLint**  | ตรวจ real-time ขณะเขียนใน IDE | เหมือน SonarQube แต่ทำงานใน Cursor            | เจอปัญหาตอน review แทนที่จะเจอตอนเขียน      |
| **CodeRabbit** | AI review ทุก MR อัตโนมัติ    | Bugs, security, performance, line-by-line     | Bug หลุดไป production เพราะ review ไม่ทัน   |
| **Qodo**       | AI ตรวจ bug ลึก + สร้าง test  | Bug detection (อันดับ 1 โลก), test generation | Bug ที่ซับซ้อนหลุด, ไม่มี test coverage     |
| **PR-Agent**   | Auto-review MR ใน GitLab CI   | PR summary, code review, suggestions          | MR ค้างนาน ไม่มีคน review                   |
| **depcheck**   | หา dependency ที่ไม่ได้ใช้    | Unused packages                               | Bundle ใหญ่เกินจำเป็น, security risk        |
| **madge**      | หา circular imports           | Import วนรอบ                                  | App พัง, build ช้า, debug ยาก               |
| **jscpd**      | หา code ซ้ำ (copy-paste)      | Duplicate code > 5%                           | แก้ที่เดียว ไม่อัพเดตอีกที่ ทำให้ bug       |

### IDE Extensions ที่ใช้ร่วม

| Extension          | ทำหน้าที่                     | ทำไมต้องมี                         |
| ------------------ | ----------------------------- | ---------------------------------- |
| ESLint Extension   | แสดง lint errors real-time    | เห็น error ทันทีไม่ต้องรัน command |
| Prettier Extension | Auto-format เมื่อ save        | ไม่ต้องจำ format rules             |
| SonarLint          | SAST real-time ใน IDE         | จับ security issue ตั้งแต่ตอนเขียน |
| Aikido Security    | Secret scan real-time         | ป้องกัน API key หลุดเข้า git       |
| Error Lens         | แสดง error inline             | เห็น error ชัดเจนไม่ต้องเลื่อนหา   |
| GitLens            | Git blame + history ทุกบรรทัด | รู้ว่าใครแก้อะไร เมื่อไหร่ ทำไม    |

---

## หมวดที่ 2: Security Scanning — ตรวจช่องโหว่ความปลอดภัย

> **ปัญหาที่แก้:** API key หลุด, SQL injection, XSS, dependency มีช่องโหว่, Docker image ไม่ปลอดภัย

| เครื่องมือ              | ประเภท            | ตรวจเรื่องอะไร                                       | ถ้าไม่ตรวจ จะเกิดอะไร                               |
| ----------------------- | ----------------- | ---------------------------------------------------- | --------------------------------------------------- |
| **Gitleaks**            | Secret Scanning   | API keys, passwords, tokens ใน git history           | Hacker เจอ API key → เข้าระบบได้ → ข้อมูลรั่ว       |
| **GitGuardian**         | Secret Monitoring | เหมือน Gitleaks แต่ monitor ตลอดเวลา (500+ patterns) | Key หลุดแล้วไม่รู้ จนมีคนเอาไปใช้                   |
| **SonarQube SAST**      | Static Analysis   | SQL injection, XSS, insecure crypto ใน source code   | Hacker exploit ช่องโหว่ใน code ที่เขียน             |
| **Semgrep**             | Custom SAST Rules | OWASP Top 10 + กฎที่เขียนเอง (3,000+ rules)          | ช่องโหว่เฉพาะทางที่ tool ทั่วไปจับไม่ได้            |
| **Snyk**                | SCA (Dependency)  | ช่องโหว่ใน npm packages + container + license        | Package ที่ใช้มี CVE → ระบบถูก hack ผ่าน dependency |
| **npm audit**           | Dependency Audit  | ช่องโหว่ critical/high ใน npm packages               | ใช้ package เก่าที่มีช่องโหว่รู้แล้ว                |
| **OWASP ZAP**           | DAST              | สแกน app ที่รันอยู่จริง หาช่องโหว่ runtime           | ช่องโหว่ที่เกิดเฉพาะตอน app ทำงาน (SAST จับไม่ได้)  |
| **Trivy**               | Container Scan    | ช่องโหว่ใน Docker image                              | Deploy Docker image ที่มี malware                   |
| **Hadolint**            | Dockerfile Lint   | Best practices ใน Dockerfile                         | Docker image ใหญ่เกินไป, ไม่ปลอดภัย                 |
| **testssl.sh**          | SSL/TLS Test      | SSL certificate, cipher suites, protocols            | SSL หมดอายุ = เว็บใช้ไม่ได้, ข้อมูลไม่เข้ารหัส      |
| **Mozilla Observatory** | Security Headers  | CSP, HSTS, X-Frame-Options, Referrer-Policy          | ถูก clickjacking, XSS, data sniffing                |

### ประเภท Security Scan

| ประเภท                               | ย่อ     | ตรวจอะไร                      | เมื่อไหร่       |
| ------------------------------------ | ------- | ----------------------------- | --------------- |
| Static Application Security Testing  | SAST    | อ่าน source code หาช่องโหว่   | ทุก MR          |
| Software Composition Analysis        | SCA     | ตรวจ dependencies + licenses  | ทุกวัน          |
| Dynamic Application Security Testing | DAST    | สแกน app ที่รันอยู่จริง       | รายเดือน-ไตรมาส |
| Secret Scanning                      | —       | หา API keys/passwords ที่หลุด | ทุก commit      |
| Penetration Testing                  | Pentest | จ้างผู้เชี่ยวชาญเจาะระบบจริง  | ปีละ 1-2 ครั้ง  |

---

## หมวดที่ 3: Testing — ทดสอบระบบทุกระดับ

> **ปัญหาที่แก้:** Feature ใหม่พัง feature เก่า, ไม่รู้ว่าแก้ code แล้วอะไรพัง, ไม่มี test coverage

| เครื่องมือ         | ประเภท Test          | ตรวจเรื่องอะไร                         | ถ้าไม่ตรวจ จะเกิดอะไร                         |
| ------------------ | -------------------- | -------------------------------------- | --------------------------------------------- |
| **Vitest**         | Unit Test            | แต่ละ function/component ทำงานถูก?     | แก้ function นึง พัง 10 ที่ ไม่รู้ตัว         |
| **Supertest**      | Integration Test     | API + Database ทำงานร่วมกันถูก?        | API return 200 แต่ data ผิด                   |
| **Testcontainers** | Integration Test     | ทดสอบกับ DB/Redis จริง (ไม่ใช่ mock)   | Test ผ่านแต่ production พัง เพราะ mock ≠ real |
| **Playwright**     | E2E Test             | จำลอง user จริง กดปุ่ม กรอกฟอร์ม       | User flow สำคัญ (login, payment) พัง          |
| **axe-core**       | Accessibility        | WCAG 2.1 AA compliance อัตโนมัติ       | คนพิการใช้งานไม่ได้ ผิด PDPA/ADA              |
| **Pa11y**          | Accessibility CLI    | ตรวจ a11y ผ่าน command line            | เหมือน axe-core แต่ใช้ใน CI ได้               |
| **WAVE**           | Accessibility Visual | เห็นภาพว่า element ไหนมีปัญหา          | ไม่รู้ว่า element ไหน accessible ไหนไม่       |
| **k6**             | Load/Stress Test     | ระบบรับ 100-500 users พร้อมกันได้?     | วันที่ traffic สูง ระบบล่ม                    |
| **BrowserStack**   | Cross-Browser        | ทำงานบน Chrome, Firefox, Safari, Edge? | ลูกค้าใช้ Safari แล้วพัง ไม่รู้               |
| **Responsively**   | Responsive Test      | Mobile, Tablet, Desktop แสดงผลถูก?     | หน้าจอมือถือพัง ปุ่มกดไม่ได้                  |
| **Bruno**          | API Test             | ทดสอบ API endpoint ตรงๆ                | API return error แต่ไม่รู้เพราะไม่เคยทดสอบ    |

### Page-by-Page Deep Audit — ตรวจทีละหน้า 7 มิติ

เมื่อ AI ทำงานเสร็จ ต้องตรวจทุกหน้าด้วย 7 มิติ:

| มิติ               | ตรวจอะไร                                     | เครื่องมือ            | ถ้าไม่ตรวจ จะเกิดอะไร                  |
| ------------------ | -------------------------------------------- | --------------------- | -------------------------------------- |
| **D1 CRUD**        | Create/Read/Update/Delete ทำงานจริง?         | Drizzle Studio, curl  | กด Save แล้ว data ไม่เข้า DB           |
| **D2 API Wiring**  | Frontend เรียก API จริงหรือยังเป็น mock?     | Network tab           | หน้าจอแสดง mock data ไม่ใช่ข้อมูลจริง  |
| **D3 Database**    | ข้อมูลเข้า DB จริง? relation ถูก?            | Prisma/Drizzle Studio | Data หาย, relation ผิด, migration ค้าง |
| **D4 UX/UI**       | Loading state, empty state, error state ครบ? | Visual inspection     | หน้าจอว่างเปล่าไม่มีข้อความบอก user    |
| **D5 Security**    | Auth guard, permission check ถูก?            | Code review           | เข้าหน้า admin ได้โดยไม่ login         |
| **D6 Performance** | Page load time, API response time            | Lighthouse            | หน้าโหลด 5 วินาที ลูกค้าปิดไป          |
| **D7 i18n**        | TH/EN สลับได้ครบ?                            | Toggle ทดสอบ          | ลูกค้าต่างชาติเห็นภาษาไทยอย่างเดียว    |

---

## หมวดที่ 4: Performance & SEO — ตรวจความเร็วและ SEO

> **ปัญหาที่แก้:** เว็บช้า, Google จัดอันดับต่ำ, Core Web Vitals ไม่ผ่าน

| เครื่องมือ                | ตรวจเรื่องอะไร                             | เกณฑ์ผ่าน                         | ถ้าไม่ตรวจ จะเกิดอะไร                |
| ------------------------- | ------------------------------------------ | --------------------------------- | ------------------------------------ |
| **Lighthouse**            | Performance, A11y, SEO, Best Practices     | Score >= 90 ทุกหมวด               | เว็บช้า, SEO ต่ำ, Google ลดอันดับ    |
| **PageSpeed Insights**    | Core Web Vitals จาก user จริง              | LCP<2.5s, INP<200ms, CLS<0.1      | User experience แย่ ลูกค้าหนีไป      |
| **WebPageTest**           | Waterfall analysis, TTFB, network requests | TTFB < 800ms                      | ไม่รู้ว่าอะไรทำให้ช้า แก้ไม่ถูกจุด   |
| **k6**                    | Load test — ระบบรับ traffic ได้เท่าไหร่    | 100 concurrent users, p95 < 200ms | วัน launch traffic สูง ระบบล่ม       |
| **Bundle Analyzer**       | วิเคราะห์ขนาด JavaScript bundle            | Bundle < 500KB gzipped            | App โหลดช้า เพราะ JS ใหญ่เกินไป      |
| **Ahrefs**                | Backlinks, Domain Authority, Keywords      | —                                 | ไม่รู้คู่แข่งทำอะไร, SEO ไม่มีทิศทาง |
| **Screaming Frog**        | Crawl เว็บหา broken links, missing meta    | 0 broken links                    | Link เสีย, meta หาย, Google ลดอันดับ |
| **Google Search Console** | Search performance, indexing, errors       | 0 errors                          | หน้าสำคัญไม่ถูก index, search ไม่เจอ |

### Core Web Vitals — เกณฑ์ที่ Google วัด

| Metric                    | ย่อ  | เกณฑ์ดี | เกณฑ์แย่ | ผลกระทบ          |
| ------------------------- | ---- | :-----: | :------: | ---------------- |
| Largest Contentful Paint  | LCP  | < 2.5s  |  > 4.0s  | ความเร็วโหลดหน้า |
| Interaction to Next Paint | INP  | < 200ms | > 500ms  | ความเร็วตอบสนอง  |
| Cumulative Layout Shift   | CLS  |  < 0.1  |  > 0.25  | Layout กระโดด    |
| Time to First Byte        | TTFB | < 800ms |  > 1.8s  | ความเร็ว server  |
| First Contentful Paint    | FCP  | < 1.8s  |  > 3.0s  | เห็นเนื้อหาแรก   |

---

## หมวดที่ 5: Monitoring & Alerting — เฝ้าระวังหลัง Deploy

> **ปัญหาที่แก้:** เว็บล่มไม่รู้, error เกิดขึ้นลูกค้าเจอก่อน, ไม่มี dashboard ดูภาพรวม

| เครื่องมือ       | ตรวจเรื่องอะไร                                  | ถ้าไม่ตรวจ จะเกิดอะไร                              |
| ---------------- | ----------------------------------------------- | -------------------------------------------------- |
| **Sentry**       | จับ error ที่เกิดใน production + Session Replay | Bug เกิดแล้วไม่รู้ ลูกค้าแจ้งก่อน                  |
| **UptimeRobot**  | เว็บ online อยู่ไหม? (ทุก 5 นาที)               | เว็บล่ม 2 ชม. ไม่มีใครรู้                          |
| **Uptime Kuma**  | Self-hosted uptime monitoring                   | เหมือน UptimeRobot แต่ควบคุมเองได้                 |
| **Prometheus**   | เก็บ metrics: CPU, memory, request count        | ไม่รู้ว่า server ใกล้เต็มจนล่ม                     |
| **Grafana**      | Dashboard แสดงผล metrics สวยงาม                 | มี data แต่ดูไม่รู้เรื่อง                          |
| **Loki**         | เก็บ logs รวมศูนย์                              | ต้อง SSH เข้า server ไปอ่าน log ทีละตัว            |
| **AlertManager** | ส่ง alert เมื่อ metrics ผิดปกติ                 | CPU 95% แต่ไม่มีใครรู้จนระบบล่ม                    |
| **Lark Webhook** | แจ้งเตือนทีมผ่าน Lark Chat                      | Alert มาแต่ไม่มีใครเห็น                            |
| **PostHog**      | Product analytics — user ทำอะไรในเว็บ           | ไม่รู้ว่า user ติดตรงไหน, conversion ต่ำไม่รู้เหตุ |

---

## หมวดที่ 6: AI Models & Automation — AI ที่ใช้ทำงาน

> **ปัญหาที่แก้:** ทำงาน manual ช้า, review ไม่ทัน, ต้องการ AI ช่วยเขียน code + test + review

| เครื่องมือ                | ทำหน้าที่อะไร                                                    | ใช้เมื่อไหร่                |
| ------------------------- | ---------------------------------------------------------------- | --------------------------- |
| **Claude CLI (Opus 4.6)** | AI หลัก — review, เขียน code, สร้าง test, วิเคราะห์ architecture | ทุกวัน ทุกงาน               |
| **CodeRabbit**            | AI review ทุก MR อัตโนมัติ + Fix with AI + จำ feedback           | ทุก MR                      |
| **Qodo**                  | AI ตรวจ bug ลึก (อันดับ 1 โลก) + สร้าง test อัตโนมัติ            | ระหว่างเขียน code + ทุก MR  |
| **PR-Agent**              | Auto-review MR ใน GitLab CI (describe, review, improve)          | ทุก MR ใน CI/CD             |
| **OpenAI GPT**            | AI สำรองเมื่อต้องการมุมมองต่าง                                   | เมื่อต้องการ second opinion |
| **Google Gemini**         | AI สำรองเมื่อต้องการความเร็ว                                     | เมื่อต้องการ response เร็ว  |
| **OpenRouter**            | Gateway เลือก AI model ใน CI/CD                                  | PR-Agent ใน GitLab CI       |

### AI ทำงานร่วมกันยังไง

```
ขณะเขียน Code (ใน Cursor)
├── Claude CLI         → สั่ง review, สร้าง test, แก้ bug
├── Qodo Gen           → สร้าง unit test อัตโนมัติ
├── SonarLint          → ตรวจ security real-time
└── CodeRabbit Ext.    → review ก่อน push
         ↓
เปิด Merge Request (GitLab)
├── CodeRabbit         → line-by-line review + Fix with AI
├── Qodo Merge         → deep bug detection (F1: 64.3%)
├── PR-Agent           → describe + improve
└── GitLab SAST        → security scan
         ↓
ทุก AI comment ใน MR → อ่าน + แก้ → Merge เข้า main
```

---

## หมวดที่ 7: Infrastructure — โครงสร้างพื้นฐาน

> **ปัญหาที่แก้:** Deploy แล้วพัง, ไม่มี CI/CD, database ไม่มี backup, git hooks ไม่ครบ

| เครื่องมือ       | ทำหน้าที่อะไร                                                          | ถ้าไม่มี จะเกิดอะไร                           |
| ---------------- | ---------------------------------------------------------------------- | --------------------------------------------- |
| **GitLab CI/CD** | Pipeline อัตโนมัติ 5 stages: Security → Build → Test → Review → Deploy | ต้อง deploy มือ ทุกครั้ง, ลืมรัน test         |
| **Husky**        | Git hooks: ตรวจก่อน commit/push                                        | Push code มี bug ไป main                      |
| **lint-staged**  | Auto-format เฉพาะไฟล์ที่แก้                                            | Code format ไม่ตรง ต้อง fix ทีหลัง            |
| **commitlint**   | บังคับ commit message เป็น conventional                                | Commit message มั่ว อ่าน history ไม่รู้เรื่อง |
| **Docker**       | Container สำหรับ DB, Redis, SonarQube, Monitoring                      | ติดตั้ง services ยาก ทำซ้ำไม่ได้              |
| **PostgreSQL**   | Database หลัก                                                          | —                                             |
| **Redis**        | Cache layer + sessions                                                 | App ช้า เพราะ query DB ทุกครั้ง               |
| **Drizzle ORM**  | Type-safe database ORM                                                 | SQL injection, type mismatch                  |
| **NextAuth**     | Authentication (login, OAuth)                                          | สร้าง auth เอง มีช่องโหว่                     |
| **Stripe**       | Payment processing                                                     | รับเงินไม่ได้                                 |
| **Resend**       | Transactional email                                                    | ลูกค้าไม่ได้รับ email ยืนยัน                  |

### Git Hooks — ด่านป้องกัน 4 ชั้น

| Hook            | ทำงานเมื่อไหร่            | ตรวจอะไร                                     |  Block ได้?  |
| --------------- | ------------------------- | -------------------------------------------- | :----------: |
| **pre-commit**  | ก่อนทุก commit            | lint + format + secret scan + console.log    |      ✅      |
| **commit-msg**  | เมื่อเขียน commit message | ต้องเป็น conventional commits                |      ✅      |
| **post-commit** | หลัง commit               | เตือนถ้ายังไม่ update tracking docs          | ❌ เตือนเฉยๆ |
| **pre-push**    | ก่อน push                 | security scan (block) + quality gate (เตือน) |  ✅ บางส่วน  |

---

## หมวดที่ 8: Checklists — รายการตรวจสอบ 143 ข้อ

> **ปัญหาที่แก้:** ลืมตรวจก่อน deploy, ไม่มีเกณฑ์ชัดเจนว่า "พร้อม release" แปลว่าอะไร

### 8 Phases ของ Enterprise 360 Checklist

| Phase | ชื่อ                   |  Items  | ตรวจเรื่องอะไร                                             |
| :---: | ---------------------- | :-----: | ---------------------------------------------------------- |
|   1   | **Planning**           |   10    | Browser matrix, performance budget, test strategy          |
|   2   | **Development**        |   21    | ESLint 0 errors, test coverage >= 80%, no secrets in code  |
|   3   | **Functional Testing** |   19    | E2E flows, cross-browser, responsive, error pages          |
|   4   | **Performance**        |   19    | LCP < 2.5s, load test 100 users, bundle < 500KB            |
|   5   | **Security**           |   20    | OWASP ZAP 0 critical, SQL injection, XSS, SSL A+           |
|   6   | **Accessibility**      |   16    | axe 0 critical, keyboard nav, screen reader, contrast      |
|   7   | **SEO & Standards**    |   21    | Lighthouse SEO >= 90, sitemap, structured data, HTML valid |
|   8   | **Deploy & Monitor**   |   17    | Production build, env vars, smoke test, backup, rollback   |
|       | **รวม**                | **143** |                                                            |

### Quality Gate — 5 เงื่อนไข PASS/FAIL ก่อน Release

|  #  | เงื่อนไข         |      PASS เมื่อ       | ถ้าไม่ผ่าน         |
| :-: | ---------------- | :-------------------: | ------------------ |
|  1  | Critical items   | 0 items ที่ยังไม่ผ่าน | ห้าม release       |
|  2  | Security scan    |    สแกนภายใน 7 วัน    | อาจมีช่องโหว่ใหม่  |
|  3  | Health Score     |      >= 60 คะแนน      | คุณภาพต่ำเกินไป    |
|  4  | Production Build |  build ผ่าน 0 errors  | Deploy ไปก็พัง     |
|  5  | Secrets Leak     |  ไม่มี secrets หลุด   | API key ถูก expose |

---

## หมวดที่ 9: Foundation — พื้นฐาน QA/QC

> **ปัญหาที่แก้:** ไม่รู้ว่าต้องทำอะไรบ้าง, ไม่มี process ชัดเจน, ไม่มี KPI วัดผล

### Maintenance Schedule — ตารางงาน 5 รอบ

| รอบ            | ทำอะไร (ตัวอย่าง)                                       | จำนวนงาน |
| -------------- | ------------------------------------------------------- | :------: |
| **รายวัน**     | ตรวจ uptime, error logs, backup, dependency scan        |  6 งาน   |
| **รายสัปดาห์** | Update dependencies, code quality, test coverage        |  7 งาน   |
| **รายเดือน**   | Deep security scan, performance test, DB maintenance    |  10 งาน  |
| **รายไตรมาส**  | Pentest, DAST, major upgrades, disaster recovery test   |  10 งาน  |
| **รายปี**      | Full audit, tech stack review, compliance certification |  10 งาน  |

### KPI ที่วัด — 4 หมวด 15 ตัวชี้วัด

| หมวด            | KPI                    |      เป้าหมาย      |
| --------------- | ---------------------- | :----------------: |
| **Development** | Code Coverage          |       >= 70%       |
|                 | Defect Escape Rate     |   ยิ่งต่ำยิ่งดี    |
|                 | PR Review Time         |    < 24 ชั่วโมง    |
|                 | Code Churn             |       < 15%        |
| **Operations**  | Uptime                 |       99.9%+       |
|                 | MTTR (เวลาแก้ bug)     |   ยิ่งน้อยยิ่งดี   |
|                 | Deploy Frequency       |   สัปดาห์-เดือน    |
| **Security**    | Vulnerability Fix Time | < 7 วัน (critical) |
|                 | Open Vulnerabilities   |     0 critical     |
|                 | Dependency Freshness   |  > 90% up-to-date  |
| **Business**    | Customer-Reported Bugs |   ยิ่งน้อยยิ่งดี   |
|                 | Reopen Rate            |        < 5%        |

---

## ทั้งหมดทำงานบน Cursor + Claude CLI

ระบบ QA-QC Master ทั้ง 9 หมวดทำงานใน environment เดียวกัน:

```
┌──────────────────────────────────────────────────────┐
│                    Cursor IDE                         │
│                                                       │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐ │
│  │ Claude CLI   │  │ Extensions  │  │ Terminal      │ │
│  │ (Opus 4.6)  │  │ SonarLint   │  │ npm scripts  │ │
│  │             │  │ Qodo Gen    │  │ git hooks    │ │
│  │ สั่ง AI     │  │ CodeRabbit  │  │ docker       │ │
│  │ ทำงานทุกอย่าง│  │ Aikido      │  │ k6, curl     │ │
│  └─────────────┘  └─────────────┘  └──────────────┘ │
│                          │                            │
│                    ┌─────▼─────┐                      │
│                    │  GitLab   │                      │
│                    │  CI/CD    │                      │
│                    └─────┬─────┘                      │
│                          │                            │
│              ┌───────────▼───────────┐                │
│              │ Auto Review Every MR  │                │
│              │ CodeRabbit + Qodo +   │                │
│              │ PR-Agent + SAST       │                │
│              └───────────────────────┘                │
└──────────────────────────────────────────────────────┘
```

### วิธีใช้กับ SaaS / Web App ทุกงาน

1. **Copy `QA-QC_Master/` folder** เข้า project ใหม่ (มี script ช่วย)
2. **เปิด `Start.md`** ใน Cursor — เป็น Command Center ของทุกอย่าง
3. **สั่ง Claude CLI** อ่านไฟล์ในแต่ละหมวด → AI ทำงานตาม
4. **ทุก MR** → CodeRabbit + Qodo review อัตโนมัติ
5. **ก่อน Release** → ตรวจ Quality Gate 5 เงื่อนไข + 143 Checklist Items

ระบบนี้ออกแบบมาให้ **portable** — ใช้ได้กับทุก project ที่เราสร้าง ไม่ว่าจะเป็น Next.js, React, Vue, หรือ plain HTML

---

## สรุปทั้งหมดในตารางเดียว

| หมวด                     | เครื่องมือหลัก                                       | ตรวจเรื่อง                                     | ถ้าไม่ทำ                                          |
| ------------------------ | ---------------------------------------------------- | ---------------------------------------------- | ------------------------------------------------- |
| **1. Code Quality**      | ESLint, Prettier, SonarQube, CodeRabbit, Qodo        | Code standards, bugs, tech debt                | Code ยุ่ง, bug หลุด, technical debt สะสม          |
| **2. Security**          | Gitleaks, Snyk, OWASP ZAP, Semgrep, Trivy            | Secrets, vulnerabilities, OWASP Top 10         | ถูก hack, data breach, ค่าเสียหายเฉลี่ย $4.88M    |
| **3. Testing**           | Vitest, Playwright, k6, axe-core, Page-by-Page Audit | Unit, E2E, Load, Accessibility, ทุกหน้า 7 มิติ | Bug หลุด, feature เก่าพัง, ระบบล่มตอน traffic สูง |
| **4. Performance & SEO** | Lighthouse, PageSpeed, WebPageTest, Ahrefs           | Core Web Vitals, SEO, bundle size              | เว็บช้า, Google ลดอันดับ, conversion ตก           |
| **5. Monitoring**        | Sentry, Grafana, Prometheus, UptimeRobot             | Errors, uptime, metrics, alerts                | เว็บล่มไม่รู้, bug เกิดลูกค้าเจอก่อน              |
| **6. AI & Automation**   | Claude CLI, CodeRabbit, Qodo, PR-Agent               | AI review, test gen, architecture              | Review ไม่ทัน, ไม่มี test, ตรวจ manual ช้า        |
| **7. Infrastructure**    | GitLab CI/CD, Husky, Docker, PostgreSQL              | CI/CD, git hooks, database, auth               | Deploy มือ, push code มี bug, ไม่มี backup        |
| **8. Checklists**        | Enterprise 360 (143 items), Quality Gate             | 8 phases ครบ, 5 เงื่อนไขก่อน release           | ลืมตรวจ, release ไม่พร้อม, incident หลัง deploy   |
| **9. Foundation**        | 10-step process, Maintenance, KPIs                   | กระบวนการ, ตาราง maintenance, ตัวชี้วัด        | ไม่รู้ต้องทำอะไร, ไม่มี process, วัดผลไม่ได้      |

---

_SYNERRY AI Team — QA-QC Master v1.0_
_ระบบตรวจสอบคุณภาพแบบ 360 องศา สำหรับทุก SaaS & Web App_
_ทำงานบน Cursor IDE + Claude CLI — ใช้ได้กับทุก project_
_เมษายน 2026_
