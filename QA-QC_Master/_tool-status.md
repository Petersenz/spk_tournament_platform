# QA-QC Tool Status Dashboard

> อัปเดตล่าสุด: 2026-04-06
> ใช้ไฟล์นี้ตรวจสอบสถานะเครื่องมือ QA-QC ทั้งหมดในโปรเจกต์

---

## สัญลักษณ์สถานะ

| สัญลักษณ์      | ความหมาย                                                                |
| -------------- | ----------------------------------------------------------------------- |
| ✅ Active      | ติดตั้งแล้ว ใช้งานได้ทันที                                              |
| ✅ สมัครแล้ว   | สมัคร subscription แล้ว — ต้องเชื่อม repo ใหม่เมื่อ copy ไปโปรเจกต์อื่น |
| ⚙️ Config แล้ว | ตั้งค่าแล้ว รอใส่ API key / เชื่อม repo                                 |
| ⬜ Optional    | ไม่บังคับ — ติดตั้งเมื่อต้องใช้จริงเท่านั้น                             |

---

## 1. Code Quality & Linting

| Tool          | หมวด                  | ค่าใช้จ่าย       | สถานะ     | วิธีใช้ใน Cursor                                           |
| ------------- | --------------------- | ---------------- | --------- | ---------------------------------------------------------- |
| ESLint        | Linter                | Free             | ✅ Active | ติดตั้ง ESLint extension → auto-lint on save               |
| Prettier      | Formatter             | Free             | ✅ Active | ติดตั้ง Prettier extension → format on save                |
| SonarQube     | Static Analysis       | Free (Community) | ✅ Active | รัน `sonar-scanner` CLI หรือดูผลใน SonarQube dashboard     |
| SonarLint     | IDE Static Analysis   | Free             | ✅ Active | ติดตั้ง SonarLint extension → real-time analysis ใน editor |
| depcheck      | Unused Dependencies   | Free             | ✅ Active | รัน `npx depcheck` ใน terminal ของ Cursor                  |
| madge         | Circular Dependencies | Free             | ✅ Active | รัน `npx madge --circular src/` ใน terminal                |
| jscpd         | Copy-Paste Detection  | Free             | ✅ Active | รัน `npx jscpd src/` ใน terminal                           |
| html-validate | HTML Validation       | Free             | ✅ Active | รัน `npx html-validate "**/*.html"` ใน terminal            |

---

## 2. AI-Powered Code Review

| Tool                  | หมวด                 | ค่าใช้จ่าย       | สถานะ        | วิธีใช้ใน Cursor                                                 |
| --------------------- | -------------------- | ---------------- | ------------ | ---------------------------------------------------------------- |
| Claude CLI            | AI Assistant         | Max Plan (fixed) | ✅ Active    | เปิด terminal → `claude` command หรือใช้ Claude Code extension   |
| CodeRabbit Pro        | MR Auto-Review       | $24/dev/mo       | ✅ สมัครแล้ว | ทำงานอัตโนมัติเมื่อเปิด MR — **ต้องเชื่อม repo ใหม่ทุกโปรเจกต์** |
| Qodo Teams (PR-Agent) | MR Review + Test Gen | $30/user/mo      | ✅ สมัครแล้ว | ติดตั้ง Qodo extension — **ต้องเชื่อม repo ใหม่ทุกโปรเจกต์**     |

> **ลบออก:** Greptile ($20/dev/mo) และ BugBot — ใช้ได้เฉพาะ GitHub ไม่รองรับ GitLab self-hosted

---

## 3. Testing

| Tool       | หมวด         | ค่าใช้จ่าย | สถานะ     | วิธีใช้ใน Cursor                                            |
| ---------- | ------------ | ---------- | --------- | ----------------------------------------------------------- |
| Vitest     | Unit Testing | Free       | ✅ Active | รัน `npm run test` ใน terminal หรือใช้ Vitest extension     |
| Playwright | E2E Testing  | Free       | ✅ Active | รัน `npx playwright test` หรือใช้ Playwright Test extension |

---

## 4. Security

| Tool        | หมวด                     | ค่าใช้จ่าย       | สถานะ       | วิธีใช้ใน Cursor                                            |
| ----------- | ------------------------ | ---------------- | ----------- | ----------------------------------------------------------- |
| npm audit   | Dependency Vulnerability | Free             | ✅ Active   | รัน `npm audit` ใน terminal                                 |
| Snyk CLI    | Vulnerability Scanner    | Free (CLI)       | ✅ Active   | รัน `snyk test` หรือ `snyk monitor` ใน terminal             |
| Gitleaks    | Secret Detection         | Free             | ✅ Active   | รัน `gitleaks detect` ใน terminal — ผูกกับ pre-commit hook  |
| GitGuardian | Secret Detection (Cloud) | Free (25 devs)   | ✅ Active   | ทำงานอัตโนมัติเมื่อ push — ดูผลใน GitGuardian dashboard     |
| OWASP ZAP   | Web App Security Scan    | Free             | ⬜ Optional | ติดตั้งเมื่อต้อง DAST scan: `docker run zaproxy/zap-stable` |
| testssl.sh  | SSL/TLS Testing          | Free             | ⬜ Optional | ติดตั้งเมื่อ deploy HTTPS: `brew install testssl`           |
| Sentry      | Error Tracking           | Free (Developer) | ✅ Active   | ติดตั้ง Sentry SDK ใน app → ดูผลใน sentry.io dashboard      |

---

## 5. Performance & SEO

| Tool               | หมวด               | ค่าใช้จ่าย      | สถานะ       | วิธีใช้ใน Cursor                                               |
| ------------------ | ------------------ | --------------- | ----------- | -------------------------------------------------------------- |
| Lighthouse         | Performance Audit  | Free            | ✅ Active   | รัน `npx lighthouse <URL> --output html` ใน terminal           |
| k6                 | Load Testing       | Free (CLI)      | ✅ Active   | รัน `k6 run script.js` ใน terminal                             |
| PageSpeed Insights | Online Performance | Free            | ✅ Active   | เปิด [pagespeed.web.dev](https://pagespeed.web.dev/) → ใส่ URL |
| Screaming Frog     | SEO Crawler        | Free (500 URLs) | ⬜ Optional | ติดตั้งเมื่อต้อง SEO audit: ดาวน์โหลด desktop app              |

---

## 6. Accessibility (a11y)

| Tool                    | หมวด                 | ค่าใช้จ่าย | สถานะ     | วิธีใช้ใน Cursor                                                                           |
| ----------------------- | -------------------- | ---------- | --------- | ------------------------------------------------------------------------------------------ |
| axe-core                | a11y Testing Library | Free       | ✅ Active | ใช้ร่วมกับ Playwright: `@axe-core/playwright` ใน test                                      |
| Pa11y                   | a11y CLI Scanner     | Free       | ✅ Active | รัน `pa11y <URL>` ใน terminal                                                              |
| WAVE                    | Online a11y Checker  | Free       | ✅ Active | เปิด [wave.webaim.org](https://wave.webaim.org/) → ใส่ URL                                 |
| WebAIM Contrast Checker | Color Contrast       | Free       | ✅ Active | เปิด [webaim.org/resources/contrastchecker](https://webaim.org/resources/contrastchecker/) |

---

## 7. Monitoring & Uptime

| Tool        | หมวด                 | ค่าใช้จ่าย         | สถานะ          | วิธีใช้ใน Cursor                                                  |
| ----------- | -------------------- | ------------------ | -------------- | ----------------------------------------------------------------- |
| Prometheus  | Metrics Collection   | Free               | ⚙️ Config แล้ว | รันผ่าน Docker → ดูผลที่ `localhost:9090`                         |
| Grafana     | Metrics Dashboard    | Free               | ⚙️ Config แล้ว | รันผ่าน Docker → ดูผลที่ `localhost:3000`                         |
| Loki        | Log Aggregation      | Free               | ⚙️ Config แล้ว | รันผ่าน Docker → query ผ่าน Grafana                               |
| UptimeRobot | Uptime Monitoring    | Free (50 monitors) | ✅ Active      | ตั้งค่าผ่าน [uptimerobot.com](https://uptimerobot.com/) dashboard |
| Uptime Kuma | Uptime (Self-hosted) | Free               | ⬜ Optional    | ติดตั้งเมื่อต้องการ self-hosted: `docker compose`                 |

---

## 8. API Testing

| Tool  | หมวด       | ค่าใช้จ่าย | สถานะ       | วิธีใช้ใน Cursor                                       |
| ----- | ---------- | ---------- | ----------- | ------------------------------------------------------ |
| Bruno | API Client | Free       | ⬜ Optional | ติดตั้งเมื่อต้อง test API: `brew install --cask bruno` |

---

## 9. Online Tools (ไม่ต้องติดตั้ง)

| Tool                    | หมวด              | ค่าใช้จ่าย | สถานะ     | URL                                                                                   |
| ----------------------- | ----------------- | ---------- | --------- | ------------------------------------------------------------------------------------- |
| Mozilla Observatory     | Security Headers  | Free       | ✅ Active | [observatory.mozilla.org](https://observatory.mozilla.org/)                           |
| SSL Labs                | SSL/TLS Grade     | Free       | ✅ Active | [ssllabs.com/ssltest](https://www.ssllabs.com/ssltest/)                               |
| PageSpeed Insights      | Performance Score | Free       | ✅ Active | [pagespeed.web.dev](https://pagespeed.web.dev/)                                       |
| WebAIM Contrast Checker | Color Contrast    | Free       | ✅ Active | [webaim.org/resources/contrastchecker](https://webaim.org/resources/contrastchecker/) |
| WAVE                    | Accessibility     | Free       | ✅ Active | [wave.webaim.org](https://wave.webaim.org/)                                           |
| Nu HTML Checker         | HTML Validation   | Free       | ✅ Active | [validator.w3.org/nu](https://validator.w3.org/nu/)                                   |
| Google Search Console   | SEO Monitoring    | Free       | ✅ Active | [search.google.com/search-console](https://search.google.com/search-console/)         |

---

## 10. Git Hooks & CI/CD

| Tool       | หมวด                | ค่าใช้จ่าย | สถานะ     | วิธีใช้ใน Cursor                                      |
| ---------- | ------------------- | ---------- | --------- | ----------------------------------------------------- |
| Husky      | Git Hooks Manager   | Free       | ✅ Active | ทำงานอัตโนมัติเมื่อ commit/push — config ใน `.husky/` |
| commitlint | Commit Message Lint | Free       | ✅ Active | ทำงานอัตโนมัติผ่าน Husky pre-commit hook              |

---

## สรุปภาพรวม

| สถานะ                 | จำนวน  | ความหมาย                                        |
| --------------------- | :----: | ----------------------------------------------- |
| ✅ Active / สมัครแล้ว |   30   | ใช้งานได้ทันที                                  |
| ⚙️ Config แล้ว        |   4    | ตั้งค่าแล้ว รอเชื่อม repo ใหม่                  |
| ⬜ Optional           |   5    | ติดตั้งเมื่อต้องใช้จริง                         |
| **รวมทั้งหมด**        | **39** | (ลบ Greptile + BugBot ที่ไม่รองรับ GitLab แล้ว) |

### ค่าใช้จ่ายจริง (ณ April 2026)

| รายการ                 | ค่าใช้จ่าย/เดือน | หมายเหตุ                             |
| ---------------------- | :--------------: | ------------------------------------ |
| Claude Code (Max Plan) |  รวมใน Max Plan  | ไม่ใช่ usage-based                   |
| CodeRabbit Pro         |     $24/dev      | สมัครแล้ว — ใช้ได้ทุก repo ที่เชื่อม |
| Qodo Teams             |     $30/user     | สมัครแล้ว — ใช้ได้ทุก repo ที่เชื่อม |
| **Paid fixed total**   |    **$54/mo**    | ไม่รวม Max Plan                      |
| Free tools (33 ตัว)    |        $0        | —                                    |

> **เมื่อ copy ไปโปรเจกต์ใหม่:** ค่าใช้จ่ายไม่เพิ่ม — แค่เชื่อม CodeRabbit + Qodo เข้า repo ใหม่

---

> **หมายเหตุ:** อัปเดตสถานะเมื่อมีการเปลี่ยนแปลง เช่น ติดตั้ง tool ใหม่ หรือยกเลิก subscription
> **ลบแล้ว:** Greptile + BugBot (ไม่รองรับ GitLab self-hosted)
