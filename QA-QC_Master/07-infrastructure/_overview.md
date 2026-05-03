# 07 — Infrastructure: ภาพรวม

> ระบบ infrastructure ทั้งหมดของ ViberQC
> CI/CD, Docker, Database, Auth, Payment, Email, Deployment

---

## สารบัญไฟล์

| ไฟล์                                                 | เนื้อหา                           |
| ---------------------------------------------------- | --------------------------------- |
| [cicd-pipeline.md](cicd-pipeline.md)                 | GitLab CI/CD Pipeline (5 stages)  |
| [git-hooks.md](git-hooks.md)                         | Husky Git Hooks (4 hooks)         |
| [docker.md](docker.md)                               | Docker Services ทั้งหมด           |
| [database.md](database.md)                           | PostgreSQL + Redis + ORM          |
| [auth.md](auth.md)                                   | NextAuth v5 (OAuth + Magic Link)  |
| [payment.md](payment.md)                             | Stripe (Subscriptions + Credits)  |
| [email.md](email.md)                                 | Resend (Transactional Emails)     |
| [deployment-strategies.md](deployment-strategies.md) | Canary, Blue-Green, Feature Flags |

---

## Infrastructure Pipeline

```
Developer (local)
     │
     ├──▶ Git Hooks (Husky)     → lint, secret scan, quality gate
     │
     ▼
GitLab (remote)
     │
     ├──▶ CI/CD Pipeline        → security → build → test → review → deploy
     │
     ▼
VPS (production)
     │
     ├──▶ Docker Services       → DB, Redis, Monitoring
     ├──▶ NextAuth              → Authentication
     ├──▶ Stripe                → Payments
     ├──▶ Resend                → Emails
     └──▶ Sentry/Monitoring     → Error tracking
```

---

## ตาราง Services ทั้งหมด

| Service       | ประเภท         | Port |        ราคา         |
| ------------- | -------------- | :--: | :-----------------: |
| PostgreSQL 16 | Database       | 5434 |    Free (Docker)    |
| Redis 7       | Cache/Session  | 6381 |    Free (Docker)    |
| SonarQube CE  | Code Quality   | 9000 |    Free (Docker)    |
| Prometheus    | Metrics        | 9090 |    Free (Docker)    |
| Grafana       | Dashboard      | 3003 |    Free (Docker)    |
| Loki          | Logging        | 3100 |    Free (Docker)    |
| AlertManager  | Alerting       | 9093 |    Free (Docker)    |
| Uptime Kuma   | Uptime Monitor | 3004 |    Free (Docker)    |
| NextAuth v5   | Authentication |  —   |   Free (library)    |
| Stripe        | Payment        |  —   |  2.2% + $0.30/txn   |
| Resend        | Email          |  —   |   Free (100/day)    |
| Sentry        | Error Tracking |  —   | Free (5K events/mo) |
| GitLab CI/CD  | Pipeline       |  —   |  Free (400 min/mo)  |

---

## ค่าใช้จ่ายรวม Infrastructure

| รายการ                      | ค่าใช้จ่าย/เดือน |
| --------------------------- | :--------------: |
| VPS (Docker host)           |      ~$5-15      |
| Domain + SSL                |      ~$1-2       |
| Stripe                      | 2.2% + $0.30/txn |
| Resend (over 100/day)       |      $20/mo      |
| อื่นๆ (free tier)           |        $0        |
| **รวม (ไม่รวม Stripe txn)** |    **~$6-37**    |
