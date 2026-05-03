# Payment — Stripe

> Stripe สำหรับ subscriptions + credit purchases + webhooks
> ค่าธรรมเนียม: 2.2% + $0.30 ต่อ transaction

---

## Stripe Overview

| คุณสมบัติ     | รายละเอียด                                            |
| ------------- | ----------------------------------------------------- |
| **Package**   | `stripe@^20.4.1`                                      |
| **Features**  | Subscriptions, One-time payments, Credits             |
| **Webhooks**  | Real-time payment events                              |
| **Dashboard** | [dashboard.stripe.com](https://dashboard.stripe.com/) |
| **Pricing**   | 2.2% + $0.30 per successful transaction               |

---

## Environment Variables

```env
# .env.local

# Stripe Secret Key (server-side only)
STRIPE_SECRET_KEY=sk_test_...

# Stripe Publishable Key (client-side OK)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Webhook Secret (verify webhook signatures)
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Test vs Live Keys

|                 | Test                    | Live                    |
| --------------- | ----------------------- | ----------------------- |
| **Prefix**      | `sk_test_` / `pk_test_` | `sk_live_` / `pk_live_` |
| **ใช้ตอน**      | Development             | Production              |
| **ตัดเงินจริง** | ไม่                     | ใช่                     |

> Development ใช้ test keys เสมอ — ไม่ตัดเงินจริง

---

## Features ที่ใช้

### 1. Subscriptions (แบบรายเดือน)

| Plan       |  ราคา  | Features             |
| ---------- | :----: | -------------------- |
| Free       |   $0   | Basic scans, limited |
| Pro        | $19/mo | All scans, priority  |
| Enterprise | Custom | Custom features      |

### 2. Credit Purchases (One-time)

- ซื้อ credits เพื่อใช้ scan เพิ่มเติม
- ไม่ใช่ subscription — จ่ายครั้งเดียว

### 3. Webhooks

Stripe ส่ง events มาที่ app เมื่อ:

- Payment สำเร็จ
- Subscription เริ่ม/ต่ออายุ/ยกเลิก
- Payment ล้มเหลว
- Refund

Webhook endpoint: `/api/webhook/stripe`

---

## Webhook Setup

### 1. Development (Stripe CLI)

```bash
# ติดตั้ง Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks ไป local
stripe listen --forward-to localhost:3030/api/webhook/stripe
```

Stripe CLI จะให้ webhook secret: `whsec_...` → ใส่ใน `.env.local`

### 2. Production (Stripe Dashboard)

1. [dashboard.stripe.com](https://dashboard.stripe.com/) → Developers → Webhooks
2. Add endpoint: `https://viberqc.com/api/webhook/stripe`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy Signing secret → `.env.production`

---

## Cost Calculation

|       Transaction        |  Stripe Fee  |
| :----------------------: | :----------: |
|    $19 (Pro monthly)     | $0.72 (3.8%) |
| $49 (Enterprise monthly) | $1.38 (2.8%) |
|   $5 (Credit purchase)   | $0.41 (8.2%) |

> Transaction เล็ก ($5) มี fee % สูงเพราะ fixed $0.30
> Transaction ใหญ่ ($49+) fee % ต่ำลง

---

## Checklist

- [ ] สมัคร [stripe.com](https://stripe.com/) + activate account
- [ ] ตั้ง test keys ใน `.env.local`
- [ ] ติดตั้ง Stripe CLI + `stripe listen`
- [ ] สร้าง Products + Prices ใน Stripe Dashboard
- [ ] ตั้ง webhook endpoint (production)
- [ ] ทดสอบ: checkout flow ด้วย test card `4242 4242 4242 4242`
- [ ] ตั้ง live keys ใน `.env.production` ก่อน launch
