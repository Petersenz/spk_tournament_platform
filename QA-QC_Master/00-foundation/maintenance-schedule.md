# Maintenance Schedule — ตาราง Maintenance ครบทุกรอบ

> อ้างอิงจาก SYNERRY Guide — ตาราง maintenance ตั้งแต่รายวันจนถึงรายปี
> ระบบที่ดีไม่ใช่แค่ deploy แล้วจบ — ต้องดูแลต่อเนื่อง

---

## ภาพรวม — 5 รอบ Maintenance

```
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────────┐  ┌──────────┐
│  Daily   │  │  Weekly  │  │ Monthly  │  │  Quarterly  │  │  Annual  │
│  6 items │  │  7 items │  │ 10 items │  │  10 items   │  │ 10 items │
│  ทุกวัน   │  │ ทุกสัปดาห์ │  │ ทุกเดือน  │  │  ทุกไตรมาส   │  │  ทุกปี    │
└──────────┘  └──────────┘  └──────────┘  └─────────────┘  └──────────┘
     ↑              ↑             ↑              ↑              ↑
   Quick          Review      Deep Scan     Strategic      Full Audit
   Health         & Tune      & Optimize     Review        & Overhaul
```

---

## Daily — ทำทุกวัน (6 รายการ)

> เป้าหมาย: ดักปัญหาให้เร็วที่สุด ก่อนที่จะลุกลาม

| #   | รายการ                  | ทำอะไร                                        | Tools                        | เวลาที่ใช้ |
| --- | ----------------------- | --------------------------------------------- | ---------------------------- | ---------- |
| 1   | **Uptime Monitoring**   | ตรวจว่าระบบ up อยู่ ทุก endpoint สำคัญ        | UptimeRobot, Better Uptime   | อัตโนมัติ  |
| 2   | **Error Log Review**    | ดู error logs + Sentry dashboard หา anomalies | Sentry, CloudWatch, Grafana  | 15 นาที    |
| 3   | **Backup Verification** | ตรวจว่า backup รันสำเร็จ + verify integrity   | Backup scripts, AWS Backup   | 5 นาที     |
| 4   | **SCA Quick Scan**      | ตรวจ dependency vulnerabilities ใหม่          | `npm audit`, Snyk monitor    | อัตโนมัติ  |
| 5   | **Alert Review**        | ตรวจ alerts ที่เข้ามา ไม่มีตกหล่น             | Lark/Slack alerts, PagerDuty | 10 นาที    |
| 6   | **Resource Monitoring** | ดู CPU, Memory, Disk usage ไม่เกินเกณฑ์       | Grafana, CloudWatch          | 5 นาที     |

### Daily Checklist Template

```
☐ Uptime: ทุก endpoint ตอบสนอง (HTTP 200)
☐ Errors: ไม่มี new critical errors ใน Sentry
☐ Backup: ล่าสุดสำเร็จเมื่อ ___
☐ Security: ไม่มี critical vulnerability ใหม่
☐ Alerts: ตรวจสอบ + acknowledge ทุก alert
☐ Resources: CPU < 70%, Memory < 80%, Disk < 85%
```

---

## Weekly — ทำทุกสัปดาห์ (7 รายการ)

> เป้าหมาย: ปรับปรุงและ optimize ต่อเนื่อง

| #   | รายการ                   | ทำอะไร                                               | Tools                                | เวลาที่ใช้ |
| --- | ------------------------ | ---------------------------------------------------- | ------------------------------------ | ---------- |
| 1   | **Dependency Updates**   | อัปเดต patch/minor versions ที่ปลอดภัย               | `npm outdated`, Renovate, Dependabot | 30 นาที    |
| 2   | **Code Quality Review**  | ตรวจ SonarQube dashboard, แก้ issues ใหม่            | SonarQube, ESLint reports            | 30 นาที    |
| 3   | **Sprint Retrospective** | ทบทวนสัปดาห์ที่ผ่านมา: อะไรดี อะไรต้องปรับ           | Team meeting                         | 30 นาที    |
| 4   | **Test Coverage Check**  | ดู coverage trends ไม่ลดลง                           | Vitest coverage, Codecov             | 15 นาที    |
| 5   | **Cloud Cost Review**    | ตรวจค่าใช้จ่าย cloud ไม่มี anomaly                   | AWS Cost Explorer, billing alerts    | 15 นาที    |
| 6   | **Staging Sync**         | ตรวจว่า staging environment ตรงกับ production config | Manual check + scripts               | 20 นาที    |
| 7   | **Broken Links Check**   | สแกนหา broken links ใน application                   | Link checker tools, Playwright       | 15 นาที    |

### Weekly Review Template

```
สัปดาห์ที่: ___

Dependencies:
☐ Patch updates ทำแล้ว: ___ packages
☐ Minor updates ทำแล้ว: ___ packages
☐ Major updates pending: ___ (ใส่ backlog)

Code Quality:
☐ New SonarQube issues: ___ (fixed: ___)
☐ Test coverage: ___% (เป้า >= 70%)
☐ Lint errors: 0

Operations:
☐ Cloud cost: $___ (vs last week: $___)
☐ Staging synced: ☐ Yes ☐ No
☐ Broken links found: ___
```

---

## Monthly — ทำทุกเดือน (10 รายการ)

> เป้าหมาย: Deep dive หาปัญหาที่มองไม่เห็นในรอบ daily/weekly

| #   | รายการ                    | ทำอะไร                                      | Tools                          | เวลาที่ใช้ |
| --- | ------------------------- | ------------------------------------------- | ------------------------------ | ---------- |
| 1   | **Deep Security Scan**    | Full SAST + SCA scan ทั้ง codebase          | SonarQube, Semgrep, Snyk       | 2 ชม.      |
| 2   | **Performance Testing**   | Load test + stress test ด้วย k6             | k6, Artillery                  | 2 ชม.      |
| 3   | **Core Web Vitals Audit** | วัด LCP, FID, CLS, INP ทุกหน้าสำคัญ         | PageSpeed Insights, Lighthouse | 1 ชม.      |
| 4   | **Database Maintenance**  | Optimize queries, vacuum, index analysis    | pg_stat, EXPLAIN ANALYZE       | 2 ชม.      |
| 5   | **SSL/TLS Check**         | ตรวจ certificate expiry + configuration     | SSL Labs, certbot              | 15 นาที    |
| 6   | **Accessibility Audit**   | ตรวจ WCAG 2.1 AA compliance                 | axe, Lighthouse a11y, WAVE     | 2 ชม.      |
| 7   | **Architecture Review**   | ตรวจ circular deps, unused code, complexity | madge, depcheck, SonarQube     | 2 ชม.      |
| 8   | **Backup Drill**          | ทดสอบ restore จาก backup จริง               | Restore scripts                | 1 ชม.      |
| 9   | **Documentation Update**  | อัปเดต technical docs ให้ตรงกับ code        | Manual review                  | 1 ชม.      |
| 10  | **User Feedback Review**  | รวบรวม + จัดลำดับ feedback จาก users        | Survey tools, support tickets  | 1 ชม.      |

### Monthly Report Template

```
เดือน: ___

Security:
├── Critical vulnerabilities: ___
├── High vulnerabilities: ___
├── Fixed this month: ___
└── Remaining: ___

Performance:
├── Lighthouse Score: ___ (เป้า >= 90)
├── LCP: ___s (เป้า < 2.5s)
├── CLS: ___ (เป้า < 0.1)
├── k6 Load Test: ___req/s (เป้า ___)
└── p95 Response Time: ___ms

Infrastructure:
├── Uptime: ___% (เป้า 99.9%)
├── Backup restore test: ☐ Pass ☐ Fail
├── SSL expiry: ___ days remaining
└── Cloud cost: $___ (budget: $___)
```

---

## Quarterly — ทำทุกไตรมาส (10 รายการ)

> เป้าหมาย: Strategic review + ปรับ direction

| #   | รายการ                          | ทำอะไร                                   | Tools/Method                    | เวลาที่ใช้  |
| --- | ------------------------------- | ---------------------------------------- | ------------------------------- | ----------- |
| 1   | **Penetration Testing**         | จ้าง pentest หรือทำ internal pentest     | Burp Suite, pentest vendor      | 1-2 สัปดาห์ |
| 2   | **DAST Full Scan**              | Dynamic security scan ทั้ง application   | OWASP ZAP, StackHawk            | 1 วัน       |
| 3   | **Major Dependency Upgrades**   | อัปเดต major versions (breaking changes) | Changelog review + testing      | 2-3 วัน     |
| 4   | **Disaster Recovery Test**      | จำลอง disaster + ทดสอบ recovery plan     | DR runbook                      | 1 วัน       |
| 5   | **Conversion Audit**            | ตรวจ user flows + conversion rates       | Analytics, A/B test results     | 1 วัน       |
| 6   | **Infrastructure Right-Sizing** | ปรับขนาด server/resources ให้เหมาะสม     | Cloud monitoring, cost analysis | 1 วัน       |
| 7   | **Compliance Review**           | ตรวจ PDPA, GDPR, industry standards      | Compliance checklist            | 1-2 วัน     |
| 8   | **Tech Debt Sprint**            | อุทิศ 1 sprint สำหรับแก้ tech debt       | Team planning                   | 1-2 สัปดาห์ |
| 9   | **SLA Review**                  | ทบทวน SLA metrics vs actual performance  | Monitoring dashboards           | 0.5 วัน     |
| 10  | **QA Process Improvement**      | ทบทวน + ปรับปรุงกระบวนการ QA/QC          | Retrospective, metrics          | 0.5 วัน     |

### Quarterly Review Template

```
ไตรมาส: Q___

Security:
├── Pentest findings: ___ critical, ___ high, ___ medium
├── DAST findings: ___
├── Remediation status: ___% fixed
└── Compliance status: ☐ PDPA ☐ GDPR ☐ Other: ___

Technical Health:
├── Major upgrades completed: ___
├── Tech debt items resolved: ___
├── Tech debt items remaining: ___
└── Architecture changes: ___

Business:
├── Uptime this quarter: ___%
├── SLA met: ☐ Yes ☐ No
├── DR test result: ☐ Pass ☐ Fail (RTO: ___, RPO: ___)
└── Infrastructure cost trend: ☐ Stable ☐ Increasing ☐ Decreasing
```

---

## Annual — ทำทุกปี (10 รายการ)

> เป้าหมาย: Full audit + วางแผนปีถัดไป

| #   | รายการ                     | ทำอะไร                                         | วิธีการ                          | เวลาที่ใช้  |
| --- | -------------------------- | ---------------------------------------------- | -------------------------------- | ----------- |
| 1   | **Full System Audit**      | Audit ทั้งระบบ: code, infra, security, process | Internal + external auditors     | 2-4 สัปดาห์ |
| 2   | **Tech Stack Review**      | ประเมิน tech stack ยังเหมาะสมไหม               | Team discussion, market research | 2-3 วัน     |
| 3   | **Architecture Overhaul**  | วางแผน architecture changes สำหรับปีหน้า       | Architecture decision records    | 1 สัปดาห์   |
| 4   | **Tooling Review**         | ประเมิน tools ทั้งหมดที่ใช้ — ยังคุ้มไหม       | Cost/benefit analysis            | 2 วัน       |
| 5   | **Team Skill Assessment**  | ประเมิน skills ของทีม + วางแผน training        | Skills matrix, 1-on-1            | 1 สัปดาห์   |
| 6   | **Comprehensive Pentest**  | Full penetration test โดย external vendor      | Certified pentest firm           | 2-4 สัปดาห์ |
| 7   | **BCP Review**             | ทบทวน Business Continuity Plan                 | BCP document review + drill      | 2-3 วัน     |
| 8   | **Data Retention Audit**   | ตรวจ data retention policies + cleanup         | Data inventory, PDPA/GDPR        | 2-3 วัน     |
| 9   | **Performance Baseline**   | สร้าง performance baseline ใหม่สำหรับปีหน้า    | Load test + benchmark            | 2-3 วัน     |
| 10  | **Legal & License Review** | ตรวจ software licenses + legal compliance      | License audit tools, legal team  | 2-3 วัน     |

### Annual Report Template

```
ปี: ___

Overall Health:
├── System Uptime: ___%
├── Total Incidents: ___ (P0: ___, P1: ___, P2: ___)
├── MTTR Average: ___
├── Customer Satisfaction: ___/5
└── Security Score: ___/100

Year-over-Year Comparison:
├── Uptime: ___% → ___%  (☐ Better ☐ Same ☐ Worse)
├── Incidents: ___ → ___  (☐ Better ☐ Same ☐ Worse)
├── Deploy Frequency: ___/mo → ___/mo
├── Test Coverage: ___% → ___%
└── Infra Cost: $___ → $___

Plan for Next Year:
├── Architecture changes: ___
├── Major upgrades planned: ___
├── New tools to adopt: ___
├── Training plan: ___
└── Budget request: $___
```

---

## Automation Targets — อะไรควร automate

| รายการ              | Automate ได้ | วิธี                           |
| ------------------- | ------------ | ------------------------------ |
| Uptime monitoring   | ✅ เต็มที่   | UptimeRobot + alerts           |
| Error tracking      | ✅ เต็มที่   | Sentry + Lark/Slack            |
| SCA scan            | ✅ เต็มที่   | Snyk monitor + CI              |
| Dependency updates  | ✅ บางส่วน   | Renovate/Dependabot (auto-PR)  |
| Backup verification | ✅ เต็มที่   | Cron + health check script     |
| Performance test    | ✅ บางส่วน   | k6 ใน CI (scheduled)           |
| Security scan       | ✅ บางส่วน   | SAST ใน CI, DAST scheduled     |
| Documentation       | ❌ ต้องทำมือ | Manual review + AI assist      |
| Architecture review | ❌ ต้องทำมือ | Team discussion + tools assist |
| Compliance          | ❌ ต้องทำมือ | Checklist + legal review       |

---

_อ่านเสร็จแล้ว → ดู [kpi-metrics.md](./kpi-metrics.md) สำหรับตัวชี้วัดที่ใช้วัดผล_
