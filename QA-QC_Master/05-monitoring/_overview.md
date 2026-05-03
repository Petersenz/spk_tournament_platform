# 05 — Monitoring & Alerting: ภาพรวม

> Shift-Right Testing: ตรวจสอบระบบ **หลัง** deploy ขึ้น production
> เพราะบางปัญหาเห็นได้เฉพาะตอน user ใช้งานจริงเท่านั้น

---

## Shift-Right Testing คืออะไร?

**Shift-Left** = ตรวจก่อน deploy (unit test, lint, SAST)
**Shift-Right** = ตรวจหลัง deploy (monitoring, error tracking, analytics)

```
Development          Production
    │                    │
    ▼                    ▼
┌────────┐         ┌────────────┐
│ Testing │ ──────▶ │ Monitoring  │
│ (Left)  │         │ (Right)    │
└────────┘         └────────────┘
                        │
          ┌─────────────┼─────────────┐
          ▼             ▼             ▼
     Error Track    Uptime      Analytics
     (Sentry)       (Kuma)      (PostHog)
```

ViberQC ใช้ Shift-Right ด้วย 5 หมวด monitoring ด้านล่าง

---

## สารบัญไฟล์

| ไฟล์                                     | หมวด              | เครื่องมือ                 |
| ---------------------------------------- | ----------------- | -------------------------- |
| [error-tracking.md](error-tracking.md)   | Error Tracking    | Sentry                     |
| [uptime.md](uptime.md)                   | Uptime Monitoring | UptimeRobot, Uptime Kuma   |
| [metrics-logging.md](metrics-logging.md) | Metrics & Logging | Prometheus, Grafana, Loki  |
| [alerting.md](alerting.md)               | Alerting          | AlertManager, Lark Webhook |
| [analytics.md](analytics.md)             | Product Analytics | PostHog                    |

---

## ตาราง Comparison ทุกเครื่องมือ

| เครื่องมือ       | หมวด              | ราคา                    | Host   | Port |
| ---------------- | ----------------- | ----------------------- | ------ | :--: |
| **Sentry**       | Error Tracking    | Freemium (5K events/mo) | Cloud  |  —   |
| **UptimeRobot**  | Uptime            | Free (50 monitors)      | Cloud  |  —   |
| **Uptime Kuma**  | Uptime            | Free (self-hosted)      | Docker | 3004 |
| **Prometheus**   | Metrics           | Free (self-hosted)      | Docker | 9090 |
| **Grafana**      | Dashboard         | Free (self-hosted)      | Docker | 3003 |
| **Loki**         | Log Aggregation   | Free (self-hosted)      | Docker | 3100 |
| **AlertManager** | Alerting          | Free (self-hosted)      | Docker | 9093 |
| **Lark Webhook** | Notification      | Free                    | Cloud  |  —   |
| **PostHog**      | Product Analytics | Freemium                | Cloud  |  —   |

---

## Monitoring Pipeline

```
Production App
     │
     ├──▶ Sentry         → จับ error + session replay
     ├──▶ Prometheus      → เก็บ metrics (CPU, memory, latency)
     ├──▶ Loki            → เก็บ logs (structured logging)
     ├──▶ Uptime Kuma     → ตรวจว่าเว็บยังเปิดอยู่ไหม
     └──▶ PostHog         → ติดตาม user behavior
              │
              ▼
         Grafana Dashboard   → แสดงผลรวมทุกอย่าง
              │
              ▼
     AlertManager + Lark    → แจ้งเตือนเมื่อมีปัญหา
```

---

## Docker Stack — สั่งเปิดทั้งหมด

```bash
# เปิด monitoring stack ทั้งหมด
cd viberqc-central/monitoring
docker compose up -d

# ตรวจสถานะ
docker compose ps
```

ไฟล์: `viberqc-central/monitoring/docker-compose.yml`
ดูรายละเอียด Docker ทุก service ที่ [07-infrastructure/docker.md](../07-infrastructure/docker.md)

---

## ค่าใช้จ่ายรวม

| รายการ                               | ค่าใช้จ่าย/เดือน |
| ------------------------------------ | :--------------: |
| Sentry Free                          |        $0        |
| UptimeRobot Free                     |        $0        |
| Uptime Kuma (Docker)                 |        $0        |
| Prometheus + Grafana + Loki (Docker) |        $0        |
| PostHog Free                         |        $0        |
| **รวม**                              |      **$0**      |

> ทุกเครื่องมือใน monitoring stack ใช้ได้ฟรี
> ค่าใช้จ่ายจริงคือ VPS ที่รัน Docker (~$5-15/mo)
