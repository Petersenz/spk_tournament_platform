# Email — Resend

> Resend สำหรับ transactional emails
> Free tier: 100 emails/วัน

---

## Resend Overview

| คุณสมบัติ              | รายละเอียด                              |
| ---------------------- | --------------------------------------- |
| **Package**            | `resend@^6.9.3`                         |
| **ประเภท**             | Transactional email service             |
| **Free Tier**          | 100 emails/วัน, 3,000/เดือน             |
| **Dashboard**          | [resend.com](https://resend.com/)       |
| **Developer-friendly** | SDK สำหรับ Node.js, React Email support |

---

## Environment Variables

```env
# .env.local
RESEND_API_KEY=re_...
FROM_EMAIL=noreply@viberqc.com
```

---

## ตั้งค่า

### 1. สมัคร + สร้าง API Key

1. สมัคร [resend.com](https://resend.com/)
2. API Keys → Create API Key
3. Copy ใส่ `.env.local` → `RESEND_API_KEY`

### 2. ตั้ง Domain (Production)

1. Resend Dashboard → Domains → Add Domain
2. เพิ่ม `viberqc.com`
3. เพิ่ม DNS records ตามที่ Resend แสดง (SPF, DKIM, DMARC)
4. Verify domain

> Development ใช้ `onboarding@resend.dev` ได้เลย ไม่ต้องตั้ง domain

---

## ใช้งานใน Code

```typescript
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// ส่ง email
const { data, error } = await resend.emails.send({
  from: process.env.FROM_EMAIL!,
  to: "user@example.com",
  subject: "Your ViberQC Scan Report",
  html: "<h1>Scan Complete</h1><p>Score: 85/100</p>",
});
```

---

## Email Types ที่ ViberQC ส่ง

| ประเภท            | เมื่อไหร่               | ตัวอย่าง Subject            |
| ----------------- | ----------------------- | --------------------------- |
| **Magic Link**    | User login ด้วย email   | "Sign in to ViberQC"        |
| **Welcome**       | สมัครสมาชิกสำเร็จ       | "Welcome to ViberQC!"       |
| **Scan Report**   | Scan เสร็จ              | "Your scan report is ready" |
| **Subscription**  | Upgrade/Downgrade       | "Subscription updated"      |
| **Alert**         | Critical issue detected | "Critical: Site down"       |
| **Weekly Digest** | สรุปรายสัปดาห์          | "Your weekly QA summary"    |

---

## Free Tier Limits

| รายการ       |   Free    | Pro ($20/mo) |
| ------------ | :-------: | :----------: |
| Emails/วัน   |    100    |    50,000    |
| Emails/เดือน |   3,000   |    50,000    |
| Domains      |     1     |  Unlimited   |
| API Rate     |   2/sec   |   100/sec    |
| Support      | Community |    Email     |

> Free tier เพียงพอสำหรับ early stage (< 100 users)
> เมื่อ users เกิน 100 → upgrade เป็น Pro $20/mo

---

## ทำไม Resend ไม่ใช่ SendGrid / Mailgun?

|                  |     Resend     | SendGrid  |     Mailgun      |
| ---------------- | :------------: | :-------: | :--------------: |
| **Developer UX** |     ดีมาก      |  ปานกลาง  |     ปานกลาง      |
| **React Email**  |    Built-in    |   ไม่มี   |      ไม่มี       |
| **Free Tier**    |    100/วัน     |  100/วัน  | 100/วัน (30 วัน) |
| **Setup**        |     5 นาที     |  15 นาที  |     15 นาที      |
| **SDK**          | Modern, simple | เยอะ APIs |    เยอะ APIs     |

> Resend = modern, developer-friendly, SDK เรียบง่าย

---

## Checklist

- [ ] สมัคร [resend.com](https://resend.com/)
- [ ] สร้าง API Key → `.env.local`
- [ ] ทดสอบ: ส่ง email ถึงตัวเอง
- [ ] Production: เพิ่ม domain + verify DNS
- [ ] ตั้ง FROM_EMAIL เป็น `noreply@viberqc.com`
