# Uptime Monitoring

> ตรวจว่าเว็บยังเปิดอยู่ไหม — ถ้าล่มจะแจ้งเตือนทันที
> ใช้ 2 เครื่องมือเพื่อครอบคลุมทั้ง cloud และ self-hosted

---

## เปรียบเทียบ 2 เครื่องมือ

| คุณสมบัติ          |                 UptimeRobot                 |                                Uptime Kuma                                 |
| ------------------ | :-----------------------------------------: | :------------------------------------------------------------------------: |
| **ประเภท**         |                 Cloud SaaS                  |                            Self-hosted (Docker)                            |
| **ราคา**           |             Free (50 monitors)              |                              Free (unlimited)                              |
| **ตรวจทุกๆ**       |        5 นาที (free) / 1 นาที (paid)        |                            1 นาที (ตั้งเองได้)                             |
| **จำนวน monitors** |                  50 (free)                  |                                 Unlimited                                  |
| **Status Page**    |              มี (สร้างได้ฟรี)               |                               มี (built-in)                                |
| **แจ้งเตือน**      |            Email, Slack, Webhook            |                    Email, Telegram, Webhook, Line, etc.                    |
| **Setup**          |              สมัคร + เพิ่ม URL              |                             Docker compose up                              |
| **ข้อเสีย**        |             5 นาทีใน free tier              |                          ต้องมี server รัน Docker                          |
| **URL**            | [uptimerobot.com](https://uptimerobot.com/) | [github.com/louislam/uptime-kuma](https://github.com/louislam/uptime-kuma) |

---

## เมื่อไหร่ใช้ตัวไหน?

| สถานการณ์                |      เลือก      | เหตุผล                                  |
| ------------------------ | :-------------: | --------------------------------------- |
| เริ่มต้น ยังไม่มี server | **UptimeRobot** | สมัครแล้วใช้ได้เลย                      |
| มี VPS อยู่แล้ว          | **Uptime Kuma** | Unlimited, ตั้ง interval 1 นาที         |
| ต้องการ external check   | **UptimeRobot** | เช็คจากนอก network                      |
| ต้องการ internal check   | **Uptime Kuma** | เช็ค Docker containers ภายใน            |
| **แนะนำ**                |  **ใช้ทั้ง 2**  | UptimeRobot = external, Kuma = internal |

---

## 1. UptimeRobot (Cloud)

### สมัคร + ตั้งค่า

1. เข้า [uptimerobot.com](https://uptimerobot.com/) → Sign Up (ฟรี)
2. Add New Monitor:
   - **Monitor Type**: HTTP(s)
   - **Friendly Name**: ViberQC Production
   - **URL**: `https://viberqc.com`
   - **Monitoring Interval**: 5 minutes (free tier)
3. ตั้ง Alert Contact:
   - Email (default)
   - Webhook → Lark (ดู [alerting.md](alerting.md))

### Monitors แนะนำ

| Monitor    | URL                              | Type    | ตรวจอะไร               |
| ---------- | -------------------------------- | ------- | ---------------------- |
| Homepage   | `https://viberqc.com`            | HTTP(s) | เว็บหลักเปิดไหม        |
| API Health | `https://viberqc.com/api/health` | HTTP(s) | API ทำงานไหม           |
| Login Page | `https://viberqc.com/login`      | HTTP(s) | Auth system ทำงานไหม   |
| SSL Cert   | `https://viberqc.com`            | SSL     | SSL จะหมดอายุเมื่อไหร่ |

### API Integration

```bash
# ตรวจสถานะ monitors ผ่าน API
curl -X POST "https://api.uptimerobot.com/v2/getMonitors" \
  -H "Content-Type: application/json" \
  -d '{"api_key":"YOUR_API_KEY","format":"json"}'
```

API Key: ตั้งค่าใน `.env` → `UPTIMEROBOT_API_KEY`

### Free Tier Limits

| รายการ         |  Free   | Pro ($7/mo) |
| -------------- | :-----: | :---------: |
| Monitors       |   50    |     50+     |
| Check Interval | 5 นาที  |   1 นาที    |
| Status Pages   |    1    |  Unlimited  |
| Alert Contacts |    5    |  Unlimited  |
| Log Retention  | 2 เดือน |    1 ปี     |

---

## 2. Uptime Kuma (Self-hosted Docker)

### Docker Compose

อยู่ใน `viberqc-central/monitoring/docker-compose.yml`:

```yaml
uptime-kuma:
  image: louislam/uptime-kuma:latest
  container_name: viberqc-uptime-kuma
  restart: unless-stopped
  volumes:
    - uptime_data:/app/data
  ports:
    - "3004:3001"
```

### เปิดใช้งาน

```bash
# เปิดเฉพาะ Uptime Kuma
cd viberqc-central/monitoring
docker compose up -d uptime-kuma

# เข้า Dashboard
# http://localhost:3004
```

### ตั้งค่าครั้งแรก

1. เปิด `http://localhost:3004`
2. สร้าง admin account (username + password)
3. Add Monitor:
   - **Monitor Type**: HTTP(s)
   - **URL**: URL ที่จะตรวจ
   - **Heartbeat Interval**: 60 seconds (1 นาที)
   - **Retries**: 3
   - **Accepted Status Codes**: 200-299

### Monitors แนะนำ

| Monitor     | URL                     | Type     | Interval |
| ----------- | ----------------------- | -------- | :------: |
| ViberQC App | `http://localhost:3030` | HTTP(s)  |   60s    |
| PostgreSQL  | `localhost:5434`        | TCP Port |   60s    |
| Redis       | `localhost:6381`        | TCP Port |   60s    |
| SonarQube   | `http://localhost:9000` | HTTP(s)  |   300s   |
| Prometheus  | `http://localhost:9090` | HTTP(s)  |   60s    |
| Grafana     | `http://localhost:3003` | HTTP(s)  |   60s    |

### Notification Setup

Uptime Kuma รองรับ 90+ notification services:

| Service          | ตั้งค่า                        |
| ---------------- | ------------------------------ |
| **Email (SMTP)** | Settings → Notification → SMTP |
| **Telegram**     | Bot Token + Chat ID            |
| **Line Notify**  | Access Token                   |
| **Lark/Feishu**  | Webhook URL                    |
| **Webhook**      | Custom URL (ใช้กับ script ได้) |

### Status Page (Public)

1. Status Pages → Add
2. เลือก monitors ที่จะแสดง
3. ตั้งชื่อ เช่น "ViberQC Status"
4. แชร์ URL ให้ลูกค้าดูสถานะ

---

## Docker Ports สรุป

| Service     | Container Port | Host Port | URL                     |
| ----------- | :------------: | :-------: | ----------------------- |
| Uptime Kuma |      3001      | **3004**  | `http://localhost:3004` |

---

## Checklist

- [ ] สมัคร UptimeRobot + เพิ่ม monitor (external check)
- [ ] เปิด Uptime Kuma via Docker (internal check)
- [ ] ตั้ง notification ทั้ง 2 ตัว (email + Lark/Telegram)
- [ ] สร้าง Status Page สำหรับลูกค้า
- [ ] ทดสอบ: หยุด service แล้วดูว่าแจ้งเตือนภายใน 5 นาที
