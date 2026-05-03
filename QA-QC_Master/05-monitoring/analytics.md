# Product Analytics — PostHog

> ติดตามพฤติกรรม user: ใครทำอะไร, ที่ไหน, เมื่อไหร่
> ต่างจาก Sentry: PostHog = ดู "user ทำอะไร", Sentry = ดู "อะไรพัง"

---

## PostHog vs Sentry — ต่างกันยังไง?

| คุณสมบัติ           |               PostHog               |                  Sentry                  |
| ------------------- | :---------------------------------: | :--------------------------------------: |
| **วัตถุประสงค์**    |          Product analytics          |             Error monitoring             |
| **ดูอะไร**          |  User behavior, funnel, retention   |       Crashes, errors, performance       |
| **ตัวอย่าง**        | "user 60% drop-off ที่หน้า pricing" | "TypeError ใน scan engine 500 ครั้ง/ชม." |
| **Session Replay**  |        มี (product-focused)         |            มี (error-focused)            |
| **Feature Flags**   |                 มี                  |                  ไม่มี                   |
| **A/B Testing**     |                 มี                  |                  ไม่มี                   |
| **Funnel Analysis** |                 มี                  |                  ไม่มี                   |
| **ราคา**            |         Free (1M events/mo)         |           Free (5K events/mo)            |

> **สรุป**: PostHog บอกว่า "product ดีไหม", Sentry บอกว่า "product พังไหม"

---

## PostHog Free Tier

| รายการ             |    Free     |
| ------------------ | :---------: |
| Events/เดือน       |  1,000,000  |
| Session Recordings | 5,000/เดือน |
| Feature Flags      |  Unlimited  |
| Users              |  Unlimited  |
| Data Retention     |    1 ปี     |

> 1M events ฟรีเยอะมาก — สำหรับ startup/SaaS เล็กๆ แทบไม่ต้องจ่ายเลย

---

## ติดตั้ง

### 1. สมัคร + สร้าง Project

1. สมัคร [posthog.com](https://posthog.com/) (Cloud — ฟรี)
2. สร้าง Project → Copy **API Key**
3. ใส่ใน `.env.local`:

```env
NEXT_PUBLIC_POSTHOG_KEY=phc_xxxxxxxxxxxxx
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

### 2. Install SDK

```bash
npm install posthog-js
```

### 3. Initialize ใน Next.js

```typescript
// lib/posthog.ts
import posthog from "posthog-js";

export function initPostHog() {
  if (typeof window !== "undefined" && process.env.NODE_ENV === "production") {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      capture_pageview: true,
      capture_pageleave: true,
    });
  }
}
```

---

## Use Cases สำหรับ ViberQC

### 1. Funnel Analysis — ดู Conversion

```typescript
// Track แต่ละ step ของ funnel
posthog.capture("signup_started");
posthog.capture("signup_completed");
posthog.capture("first_scan_started");
posthog.capture("first_scan_completed");
posthog.capture("upgrade_to_pro");
```

Funnel: Sign Up → First Scan → Upgrade = ดูว่า drop-off ที่ไหน

### 2. Feature Usage — ดูว่าใช้ feature ไหนบ่อย

```typescript
posthog.capture("feature_used", {
  feature: "security-scan",
  plan: "free",
  scan_type: "full",
});
```

### 3. User Identification

```typescript
// หลัง login
posthog.identify(user.id, {
  email: user.email,
  plan: user.subscription,
  company: user.companyName,
});
```

### 4. Feature Flags

```typescript
// ตรวจว่า user เห็น feature ใหม่ไหม
if (posthog.isFeatureEnabled("new-dashboard")) {
  showNewDashboard();
} else {
  showOldDashboard();
}
```

---

## Dashboard ที่ควรสร้าง

| Dashboard         | ดูอะไร                  | เมตริก                |
| ----------------- | ----------------------- | --------------------- |
| **Acquisition**   | user ใหม่มาจากไหน       | Signups/day, Source   |
| **Activation**    | user ใหม่ใช้งานครั้งแรก | Time to first scan    |
| **Retention**     | user กลับมาใช้ไหม       | Weekly retention rate |
| **Revenue**       | upgrade rate            | Free → Pro conversion |
| **Feature Usage** | feature ไหนได้ใช้บ่อย   | Feature count by type |

---

## PostHog vs Google Analytics

| คุณสมบัติ      |        PostHog         |      Google Analytics       |
| -------------- | :--------------------: | :-------------------------: |
| Open Source    |  ใช่ (self-host ได้)   |             ไม่             |
| Event-based    |          ใช่           |          ใช่ (GA4)          |
| Session Replay |           มี           |            ไม่มี            |
| Feature Flags  |           มี           |            ไม่มี            |
| Privacy        | ดีกว่า (self-host ได้) |    ข้อมูลอยู่กับ Google     |
| Free Tier      |       1M events        | Unlimited (แต่ sample data) |

> สำหรับ SaaS product → PostHog เหมาะกว่า GA เพราะเน้น product analytics

---

## Checklist

- [ ] สมัคร PostHog Cloud
- [ ] Install `posthog-js` + initialize
- [ ] Track signup funnel events
- [ ] Track feature usage events
- [ ] สร้าง Retention dashboard
- [ ] ตั้ง Feature Flag สำหรับ feature ใหม่
