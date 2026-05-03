# Alerting — แจ้งเตือนเมื่อมีปัญหา

> เมื่อ monitoring ตรวจพบปัญหา ต้องแจ้งคนให้รู้
> ViberQC ใช้ AlertManager + Lark Webhook เป็นหลัก

---

## เครื่องมือ Alerting

| เครื่องมือ       | ประเภท               |    ราคา     | เหมาะกับ                                |
| ---------------- | -------------------- | :---------: | --------------------------------------- |
| **AlertManager** | Prometheus ecosystem |    Free     | Alert จาก metrics (CPU, memory, uptime) |
| **Lark Webhook** | Chat notification    |    Free     | แจ้งเตือนทีมไทย (ใช้ Lark อยู่แล้ว)     |
| **PagerDuty**    | On-call management   | $21/user/mo | ทีมใหญ่ที่ต้องเวร on-call 24/7          |

---

## 1. AlertManager (Prometheus Ecosystem)

### หน้าที่

- รับ alert จาก Prometheus เมื่อ metric เกินเกณฑ์
- จัดกลุ่ม alert ที่คล้ายกัน (ไม่ส่งซ้ำ 100 ครั้ง)
- ส่งต่อไป email, webhook, Lark

### Docker

อยู่ใน `viberqc-central/monitoring/docker-compose.yml`:

```yaml
alertmanager:
  image: prom/alertmanager:latest
  container_name: viberqc-alertmanager
  restart: unless-stopped
  volumes:
    - ./alertmanager/alertmanager.yml:/etc/alertmanager/alertmanager.yml
  ports:
    - "9093:9093"
```

**URL**: `http://localhost:9093`

### Config: alertmanager.yml

```yaml
global:
  resolve_timeout: 5m

route:
  receiver: "lark-webhook"
  group_by: ["alertname", "severity"]
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 4h

  routes:
    - match:
        severity: critical
      receiver: "lark-webhook"
      repeat_interval: 1h

receivers:
  - name: "lark-webhook"
    webhook_configs:
      - url: "http://host.docker.internal:8080/alert"
        send_resolved: true
```

### Prometheus Alert Rules

เพิ่มใน `prometheus/alert-rules.yml`:

```yaml
groups:
  - name: viberqc-alerts
    rules:
      - alert: ServiceDown
        expr: up == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Service {{ $labels.job }} is down"

      - alert: HighMemoryUsage
        expr: process_resident_memory_bytes > 512 * 1024 * 1024
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Memory usage > 512MB"

      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "Error rate > 10%"

      - alert: SlowResponses
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 3
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "P95 response time > 3 seconds"
```

---

## 2. Lark Webhook (Thai-Friendly)

### ทำไม Lark?

- ทีม ViberQC ใช้ Lark เป็น chat หลัก
- Webhook ฟรี ไม่จำกัดจำนวนข้อความ
- รองรับ Rich Card (สี, icon, markdown)
- Script พร้อมใช้: `scripts/lark-notify.sh`

### ตั้งค่า Lark Webhook

1. เปิด Lark → Group Chat ที่ต้องการ
2. Settings → Bots → Add Bot → Custom Bot
3. Copy Webhook URL
4. ใส่ใน `.env`:

```env
LARK_WEBHOOK_URL=https://open.larksuite.com/open-apis/bot/v2/hook/xxxxx
```

### ใช้งาน lark-notify.sh

```bash
# Syntax
bash scripts/lark-notify.sh <level> <title> <message>

# ตัวอย่าง
bash scripts/lark-notify.sh critical "Server Down" "ViberQC production ล่ม!"
bash scripts/lark-notify.sh warning "High CPU" "CPU usage 85%"
bash scripts/lark-notify.sh success "Deploy OK" "v1.2.0 deploy สำเร็จ"
bash scripts/lark-notify.sh report "Daily Report" "Uptime 99.9%, 0 errors"
```

| Level      |   สี    | ใช้เมื่อ                     |
| ---------- | :-----: | ---------------------------- |
| `critical` |   แดง   | ระบบล่ม, data loss           |
| `warning`  | เหลือง  | metric เกินเกณฑ์             |
| `success`  |  เขียว  | deploy สำเร็จ, issue แก้แล้ว |
| `report`   | น้ำเงิน | รายงานประจำวัน/สัปดาห์       |

### Integration กับ Quality Scripts

Quality scripts (`scripts/quality-gate.sh`, `scripts/security-scan.sh`) รองรับ `--notify` flag:

```bash
# Quality gate + ส่งผลไป Lark
bash scripts/quality-gate.sh --notify

# Security scan + ส่งผลไป Lark
bash scripts/security-scan.sh --notify
```

GitLab CI/CD ก็ใช้ `--notify`:

```yaml
quality-gate:
  script:
    - bash scripts/quality-gate.sh --notify
    - bash scripts/security-scan.sh --notify
```

---

## 3. PagerDuty (Upgrade Path)

### เมื่อไหร่ควรใช้?

- ทีม > 5 คน ที่ต้องเวร on-call
- ต้องการ escalation policy (ถ้าคน A ไม่รับ → ส่งต่อคน B)
- ต้องการ incident management workflow
- **ตอนนี้ ViberQC ยังไม่ต้องใช้** — Lark เพียงพอ

### ราคา

| Plan         |    ราคา     | คุณสมบัติ                      |
| ------------ | :---------: | ------------------------------ |
| Free         |     $0      | สูงสุด 5 users, basic alerting |
| Professional | $21/user/mo | On-call scheduling, escalation |
| Business     | $41/user/mo | Analytics, AIOps               |

---

## Alert Priority Matrix

|  Priority   | ตัวอย่าง                             |     แจ้งเตือนทาง     | ตอบภายใน  |
| :---------: | ------------------------------------ | :------------------: | :-------: |
| P1 Critical | Server down, data loss               |  Lark + Email + โทร  |  15 นาที  |
|   P2 High   | Error rate > 10%, API ช้า            |     Lark + Email     | 1 ชั่วโมง |
|  P3 Medium  | Memory > 80%, disk > 90%             |         Lark         | 4 ชั่วโมง |
|   P4 Low    | Deprecated warning, cert expire soon | Email (daily digest) |   1 วัน   |

---

## Checklist

- [ ] สร้าง Lark Webhook + ใส่ URL ใน `.env`
- [ ] ทดสอบ `bash scripts/lark-notify.sh success "Test" "ทดสอบ"`
- [ ] ตั้ง AlertManager alert rules
- [ ] ตั้ง quality scripts ให้ใช้ `--notify`
- [ ] ทดสอบ: หยุด service → ดูว่า alert ส่งมาถูก level
