# Error Tracking — Sentry

> จับ error ที่เกิดใน production แบบ real-time
> พร้อม Session Replay ดูว่า user ทำอะไรก่อน error เกิด

---

## ทำไมต้อง Sentry?

| คุณสมบัติ      | รายละเอียด                                        |
| -------------- | ------------------------------------------------- |
| ราคา           | Freemium — **5,000 events/เดือน ฟรี**             |
| Session Replay | ดู video ย้อนหลังว่า user คลิกอะไรก่อน error      |
| Source Maps    | แสดง error ใน code จริง ไม่ใช่ minified           |
| Performance    | ดู slow API, slow page load                       |
| Alerts         | แจ้งเตือนทาง email/Slack/webhook                  |
| SDK            | `@sentry/nextjs` — integrate กับ Next.js โดยเฉพาะ |
| Dashboard      | [sentry.io](https://sentry.io)                    |

---

## ติดตั้ง

### 1. Install SDK

```bash
npm install @sentry/nextjs
```

> ViberQC ติดตั้งแล้ว: `@sentry/nextjs@^10.43.0` ใน package.json

### 2. สร้าง Account + Project

1. สมัคร [sentry.io](https://sentry.io) (ใช้ GitHub/Google login ได้)
2. สร้าง Project → เลือก **Next.js**
3. Copy **DSN** (Data Source Name)
4. ใส่ใน `.env.local`:

```env
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_AUTH_TOKEN=sntrys_...
```

---

## Config Files (3 ไฟล์)

### `sentry.client.config.ts` — Client-side (Browser)

```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // ส่ง 10% ของ transactions ไป Sentry (ลด cost)
  tracesSampleRate: 0.1,

  // Replay 1% normal sessions, 100% ถ้า error
  replaysSessionSampleRate: 0.01,
  replaysOnErrorSampleRate: 1.0,

  integrations: [Sentry.replayIntegration()],

  // ไม่ส่ง error ใน development
  enabled: process.env.NODE_ENV === "production",
});
```

### `sentry.server.config.ts` — Server-side (Node.js)

```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
  enabled: process.env.NODE_ENV === "production",
});
```

### `sentry.edge.config.ts` — Edge Runtime (Middleware)

```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
  enabled: process.env.NODE_ENV === "production",
});
```

---

## Sample Rates — อธิบาย

| Setting                    |    ค่า     | ความหมาย                                 |
| -------------------------- | :--------: | ---------------------------------------- |
| `tracesSampleRate`         | 0.1 (10%)  | ส่ง performance data 10% ของ requests    |
| `replaysSessionSampleRate` | 0.01 (1%)  | บันทึก session replay 1% ของ users       |
| `replaysOnErrorSampleRate` | 1.0 (100%) | บันทึก replay **ทุกครั้ง** ที่เกิด error |

### ทำไมไม่ส่ง 100%?

- Free tier มี **5,000 events/เดือน** เท่านั้น
- ถ้าส่ง 100% จะหมดภายในไม่กี่วัน
- **10% transactions + 1% replays** = ประหยัดแต่ยังเห็นปัญหาได้

### ปรับ Sample Rate ตามจำนวน Users

| Users/เดือน  | tracesSampleRate | replaysSessionSampleRate |
| :----------: | :--------------: | :----------------------: |
|   < 1,000    |    0.5 (50%)     |        0.1 (10%)         |
| 1,000-10,000 |    0.1 (10%)     |        0.01 (1%)         |
|   > 10,000   |    0.05 (5%)     |       0.001 (0.1%)       |

---

## Dashboard — sentry.io

### หน้าหลักที่ต้องดู

| หน้า               | ดูอะไร                         | เข้าถึง                |
| ------------------ | ------------------------------ | ---------------------- |
| **Issues**         | Error ทั้งหมด จัดกลุ่มตาม type | Issues → All           |
| **Performance**    | API ที่ช้า, Page load ที่ช้า   | Performance → Overview |
| **Session Replay** | ดู video ว่า user ทำอะไร       | Session Replay → List  |
| **Alerts**         | ตั้งกฎแจ้งเตือน                | Alerts → Rules         |
| **Releases**       | ดู error ตาม deploy version    | Releases → Overview    |

### ตั้ง Alert Rules แนะนำ

| Rule        | เงื่อนไข                    | แจ้งเตือน   |
| ----------- | --------------------------- | ----------- |
| New Issue   | error ใหม่ที่ไม่เคยเห็น     | ทันที       |
| High Volume | error เดิม > 100 ครั้ง/ชม.  | ทันที       |
| Regression  | error ที่เคย resolve กลับมา | ทันที       |
| P95 Latency | API response > 3 วินาที     | ทุก 15 นาที |

---

## ใช้งานกับ ViberQC

### จับ Error แบบ Manual

```typescript
import * as Sentry from "@sentry/nextjs";

// จับ error ที่ handle แล้ว (ไม่ crash)
try {
  await riskyOperation();
} catch (error) {
  Sentry.captureException(error, {
    tags: { module: "scan-engine" },
    extra: { scanId: "123", url: targetUrl },
  });
}
```

### เพิ่ม User Context

```typescript
// หลัง login สำเร็จ
Sentry.setUser({
  id: user.id,
  email: user.email,
  subscription: user.plan, // free / pro / enterprise
});
```

### Custom Breadcrumb

```typescript
// เพิ่มข้อมูลก่อน error เกิด
Sentry.addBreadcrumb({
  category: "scan",
  message: `Started scan for ${url}`,
  level: "info",
});
```

---

## Free Tier Limits

| รายการ                   |  Free  |
| ------------------------ | :----: |
| Events/เดือน             | 5,000  |
| Session Replay/เดือน     |   50   |
| Performance Transactions | 10,000 |
| Team Members             |   1    |
| Data Retention           | 30 วัน |
| Alerts                   | 1 rule |

> ถ้าเกิน → ซื้อ Team plan ($26/mo) หรือลด sample rate ลง

---

## Checklist ก่อนใช้งาน

- [ ] สมัคร sentry.io + สร้าง Next.js project
- [ ] Copy DSN ใส่ `.env.local`
- [ ] ตรวจว่า 3 config files อยู่ที่ root
- [ ] Deploy แล้วตรวจว่า event ขึ้นบน sentry.io
- [ ] ตั้ง Alert Rule อย่างน้อย "New Issue"
- [ ] Upload source maps (SENTRY_AUTH_TOKEN)
