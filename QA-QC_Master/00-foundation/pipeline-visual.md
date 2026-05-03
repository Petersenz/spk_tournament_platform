# QA/QC Pipeline — แผนภาพ Visual ทั้งระบบ

> แผนภาพ pipeline พร้อม tools ที่ใช้ในแต่ละขั้นตอน
> ใช้เป็น reference เวลาตั้งค่า CI/CD หรืออธิบายให้ทีม

---

## Full Pipeline — จาก Code สู่ Production

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         QA/QC Full Pipeline                                  │
│                                                                              │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐               │
│  │  Code    │    │    PR    │    │    AI    │    │  Human   │               │
│  │ Writing  │ →  │ Created  │ →  │  Review  │ →  │  Review  │               │
│  │          │    │          │    │          │    │          │               │
│  └────┬─────┘    └────┬─────┘    └────┬─────┘    └────┬─────┘               │
│       │               │               │               │                     │
│  ESLint           Git hooks       CodeRabbit      Team members              │
│  Prettier         Husky           Qodo Merge      Architecture              │
│  SonarLint        commitlint      PR-Agent        Business logic            │
│  Qodo Gen         lint-staged                                               │
│                                                                              │
│       ↓               ↓               ↓               ↓                     │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐               │
│  │  Merge   │    │  Build   │    │  Test &  │    │Production│               │
│  │ to Main  │ →  │ & Deploy │ →  │  Verify  │ →  │  Deploy  │               │
│  │          │    │          │    │          │    │          │               │
│  └────┬─────┘    └────┬─────┘    └────┬─────┘    └────┬─────┘               │
│       │               │               │               │                     │
│  Quality Gates    Docker          Unit Tests      Canary/B-G                │
│  All checks      CI/CD pipeline   Integration     Feature flags             │
│  pass            Build artifacts   E2E Tests       Rollback ready            │
│                                   Security scan                             │
│                                   Perf test                                 │
│                                                                              │
│       ↓               ↓               ↓               ↓                     │
│  ┌──────────────────────────────────────────────────────────┐               │
│  │                    Monitoring                              │               │
│  │  Sentry (errors) + Grafana (metrics) + UptimeRobot (up)  │               │
│  │  Lark/Slack alerts → Feedback Loop → กลับไป Code Writing  │               │
│  └──────────────────────────────────────────────────────────┘               │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## แต่ละ Stage — Tools Map

### Stage 1: Code Writing (Local Development)

```
Developer's IDE
├── ESLint              — ตรวจ code quality rules
├── Prettier            — Format code อัตโนมัติ
├── SonarLint           — ตรวจ security + quality real-time
├── Qodo Gen            — AI สร้าง test cases
└── GitHub Copilot      — AI ช่วยเขียน code
```

### Stage 2: PR Created (Pre-Review Gates)

```
Git Push → PR Opened
├── Husky pre-commit    — รัน lint + format ก่อน commit
├── commitlint          — ตรวจ commit message format
├── lint-staged         — รัน linter เฉพาะไฟล์ที่เปลี่ยน
└── CI Pipeline starts  — trigger automated checks
```

### Stage 3: AI Review (Automated)

```
PR Opened → AI Bot Review
├── CodeRabbit          — Full PR review + suggestions
├── Qodo Merge          — AI review + improvement tips
└── PR-Agent            — Automated review comments
```

### Stage 4: Human Review (Manual)

```
AI Review Done → Human Review
├── Code correctness    — logic ถูกไหม?
├── Architecture fit    — เข้ากับ architecture ไหม?
├── Business logic      — ตรง requirements ไหม?
└── Approve / Request changes
```

### Stage 5: Merge & Build

```
Approved → Merge to Main → CI/CD Pipeline
├── Docker build        — สร้าง container image
├── Unit Tests          — Vitest/Jest
├── Integration Tests   — Supertest
├── E2E Tests           — Playwright
├── SAST Scan           — SonarQube + Semgrep
├── SCA Scan            — Snyk + npm audit
├── Secret Scan         — Gitleaks
├── Lighthouse          — Performance score
└── Build artifacts     — Ready for deploy
```

### Stage 6: Production Deploy

```
All Tests Pass → Deploy
├── Staging deploy      — ทดสอบบน staging ก่อน
├── UAT                 — Manual testing on staging
├── Canary deploy       — ส่ง 5-25% traffic ไป version ใหม่
├── Health check        — ตรวจว่าระบบปกติ
├── Full rollout        — ถ้า canary OK → 100% traffic
└── Rollback ready      — กดปุ่มเดียวกลับ version เก่า
```

### Stage 7: Monitoring (Continuous)

```
Production Running → 24/7 Monitoring
├── Sentry              — Error tracking + alerting
├── Grafana + Prometheus — Metrics dashboard
├── UptimeRobot         — Uptime monitoring
├── Lark/Slack alerts   — แจ้งทีมทันที
├── LogRocket           — Session replay
└── Feedback Loop       → กลับไปแก้ใน Code Writing
```

---

## ลำดับการ Adopt — เริ่มจากอะไรก่อน

```
Phase 1: Foundation (สัปดาห์แรก)
├── ESLint + Prettier
├── Husky + commitlint
├── Basic CI (lint + build)
└── npm audit

Phase 2: Testing (สัปดาห์ที่ 2-3)
├── Vitest (unit tests)
├── Playwright (E2E basics)
├── Code coverage tracking
└── CodeRabbit (AI review)

Phase 3: Security (สัปดาห์ที่ 4)
├── Snyk (SCA)
├── Gitleaks (secret scan)
├── SonarQube/SonarLint (SAST)
└── Security headers

Phase 4: Monitoring (สัปดาห์ที่ 5)
├── Sentry (error tracking)
├── UptimeRobot (uptime)
├── Basic Grafana dashboard
└── Alert channels (Lark/Slack)

Phase 5: Advanced (เดือนที่ 2+)
├── k6 (load testing)
├── OWASP ZAP (DAST)
├── Canary deployments
└── Full KPI dashboard
```

---

## Quick Reference — เลือก Tool ตามงาน

| ต้องการ              | Tool               | ฟรี?         |
| -------------------- | ------------------ | ------------ |
| ตรวจ code quality    | ESLint + SonarLint | ใช่          |
| Format code          | Prettier           | ใช่          |
| AI review PR         | CodeRabbit         | Free tier มี |
| Unit test            | Vitest             | ใช่          |
| E2E test             | Playwright         | ใช่          |
| Security scan (code) | Semgrep            | ใช่          |
| Security scan (deps) | npm audit + Snyk   | Free tier มี |
| Secret scan          | Gitleaks           | ใช่          |
| Error tracking       | Sentry             | Free tier มี |
| Uptime monitor       | UptimeRobot        | Free tier มี |
| Performance test     | Lighthouse + k6    | ใช่          |
| Metrics dashboard    | Grafana            | ใช่          |

---

_กลับไปอ่าน [\_overview.md](./_overview.md) สำหรับภาพรวม_
_หรือ [10-step-process.md](./10-step-process.md) สำหรับรายละเอียดแต่ละขั้นตอน_
