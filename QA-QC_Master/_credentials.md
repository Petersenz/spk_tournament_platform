# QA-QC Credentials & API Keys

> **ห้าม commit — ไฟล์นี้อยู่ใน .gitignore**

---

## เมื่อ copy ไปโปรเจกต์ใหม่ --- ทำทันที

1. **เพิ่มใน `.gitignore` ของโปรเจกต์ใหม่:** `QA-QC_Master/_credentials.md`
2. ตรวจสอบด้วย `git status` ว่าไฟล์นี้ **ไม่** อยู่ใน tracked files
3. เปลี่ยนค่า `YOUR_xxx_HERE` เป็นค่าจริง
4. เก็บ backup ใน password manager (1Password, Bitwarden)

> **คำเตือน:** ถ้าไม่เพิ่มใน .gitignore → API keys จะรั่วเมื่อ commit

---

## 1. AI Models

API keys สำหรับ AI ที่ใช้ใน code review, chatbot, และ AI-assisted QA

| Service            | Variable                | Value                          | หาได้จาก                                                                    |
| ------------------ | ----------------------- | ------------------------------ | --------------------------------------------------------------------------- |
| Claude (Anthropic) | `ANTHROPIC_API_KEY`     | `YOUR_ANTHROPIC_API_KEY_HERE`  | [console.anthropic.com](https://console.anthropic.com/) → API Keys          |
| OpenAI             | `OPENAI_API_KEY`        | `YOUR_OPENAI_API_KEY_HERE`     | [platform.openai.com](https://platform.openai.com/api-keys) → API Keys      |
| Google Gemini      | `GOOGLE_GEMINI_API_KEY` | `YOUR_GEMINI_API_KEY_HERE`     | [aistudio.google.com](https://aistudio.google.com/app/apikey) → Get API Key |
| OpenRouter         | `OPENROUTER_API_KEY`    | `YOUR_OPENROUTER_API_KEY_HERE` | [openrouter.ai](https://openrouter.ai/keys) → Keys                          |

### หมายเหตุ AI Models

- Claude ใช้เป็น primary model สำหรับ code review + generation
- OpenRouter ใช้เป็น fallback / เข้าถึง model อื่นผ่าน unified API
- Gemini ใช้สำหรับ long-context analysis (1M tokens)

---

## 2. Code Review Tools

เครื่องมือ review code อัตโนมัติที่ทำงานร่วมกับ GitLab MR

| Service         | Variable             | Value                          | หาได้จาก                                                         |
| --------------- | -------------------- | ------------------------------ | ---------------------------------------------------------------- |
| CodeRabbit      | `CODERABBIT_API_KEY` | `YOUR_CODERABBIT_API_KEY_HERE` | [app.coderabbit.ai](https://app.coderabbit.ai/) → Settings → API |
| Qodo (PR-Agent) | `QODO_API_KEY`       | `YOUR_QODO_API_KEY_HERE`       | [app.qodo.ai](https://app.qodo.ai/) → Settings → API Key         |

### Plan & Pricing (สถานะจริง)

| Tool       | Plan  | ราคา        |    สถานะ     | รายละเอียด                      |
| ---------- | ----- | ----------- | :----------: | ------------------------------- |
| CodeRabbit | Pro   | $24/dev/mo  | ✅ สมัครแล้ว | ต้องเชื่อม repo ใหม่ทุกโปรเจกต์ |
| Qodo Teams | Teams | $30/user/mo | ✅ สมัครแล้ว | ต้องเชื่อม repo ใหม่ทุกโปรเจกต์ |

### การตั้งค่า CodeRabbit กับ GitLab

1. เพิ่ม `CODERABBIT_API_KEY` ใน GitLab → Settings → CI/CD → Variables
2. สร้างไฟล์ `.coderabbit.yaml` ที่ root ของ project
3. เปิดใช้ webhook ใน GitLab → Settings → Webhooks

### การตั้งค่า Qodo กับ GitLab

1. ติดตั้ง PR-Agent ผ่าน Docker หรือ GitLab CI
2. เพิ่ม `QODO_API_KEY` ใน CI/CD variables
3. config ใน `.pr_agent.toml`

---

## 3. Security Tools

เครื่องมือสแกน vulnerability, error tracking, และ secret detection

| Service           | Variable            | Value                         | หาได้จาก                                                                 |
| ----------------- | ------------------- | ----------------------------- | ------------------------------------------------------------------------ |
| Snyk              | `SNYK_TOKEN`        | `YOUR_SNYK_TOKEN_HERE`        | [app.snyk.io](https://app.snyk.io/) → Account Settings → Auth Token      |
| Sentry DSN        | `SENTRY_DSN`        | `YOUR_SENTRY_DSN_HERE`        | [sentry.io](https://sentry.io/) → Project → Settings → Client Keys (DSN) |
| Sentry Auth Token | `SENTRY_AUTH_TOKEN` | `YOUR_SENTRY_AUTH_TOKEN_HERE` | [sentry.io](https://sentry.io/) → Settings → Auth Tokens                 |

### หมายเหตุ Security

- Snyk ใช้สแกน dependency vulnerabilities + container images
- Sentry DSN ใช้ฝั่ง client สำหรับ error reporting
- Sentry Auth Token ใช้สำหรับ release tracking + source maps upload

---

## 4. Payment (Stripe)

ระบบชำระเงินสำหรับ subscription management

| Service                | Variable                 | Value                              | หาได้จาก                                                                       |
| ---------------------- | ------------------------ | ---------------------------------- | ------------------------------------------------------------------------------ |
| Stripe Secret Key      | `STRIPE_SECRET_KEY`      | `YOUR_STRIPE_SECRET_KEY_HERE`      | [dashboard.stripe.com](https://dashboard.stripe.com/apikeys) → Secret key      |
| Stripe Publishable Key | `STRIPE_PUBLISHABLE_KEY` | `YOUR_STRIPE_PUBLISHABLE_KEY_HERE` | [dashboard.stripe.com](https://dashboard.stripe.com/apikeys) → Publishable key |
| Stripe Webhook Secret  | `STRIPE_WEBHOOK_SECRET`  | `YOUR_STRIPE_WEBHOOK_SECRET_HERE`  | [dashboard.stripe.com](https://dashboard.stripe.com/webhooks) → Signing secret |

### หมายเหตุ Stripe

- ใช้ **test keys** (ขึ้นต้นด้วย `sk_test_` / `pk_test_`) ตอน development
- เปลี่ยนเป็น **live keys** (ขึ้นต้นด้วย `sk_live_` / `pk_live_`) ตอน production
- Webhook secret ต้องตรงกับ endpoint ที่ลงทะเบียนใน Stripe Dashboard

---

## 5. Email (Resend)

ระบบส่งอีเมล transactional (verification, notification, invoice)

| Service        | Variable         | Value                      | หาได้จาก                                                            |
| -------------- | ---------------- | -------------------------- | ------------------------------------------------------------------- |
| Resend API Key | `RESEND_API_KEY` | `YOUR_RESEND_API_KEY_HERE` | [resend.com](https://resend.com/api-keys) → API Keys                |
| From Email     | `FROM_EMAIL`     | `YOUR_FROM_EMAIL_HERE`     | ใช้ domain ที่ verify แล้วใน Resend (เช่น `noreply@yourdomain.com`) |

### หมายเหตุ Email

- ต้อง verify domain ใน Resend ก่อนส่งอีเมลจริง (เพิ่ม DNS records)
- Free tier: 3,000 emails/mo, 100 emails/day
- `FROM_EMAIL` ต้องตรงกับ domain ที่ verify แล้ว

---

## 6. Authentication (OAuth)

Social login สำหรับ user authentication

### Google OAuth

| Service              | Variable               | Value                            | หาได้จาก                                                                                             |
| -------------------- | ---------------------- | -------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Google Client ID     | `GOOGLE_CLIENT_ID`     | `YOUR_GOOGLE_CLIENT_ID_HERE`     | [console.cloud.google.com](https://console.cloud.google.com/apis/credentials) → OAuth 2.0 Client IDs |
| Google Client Secret | `GOOGLE_CLIENT_SECRET` | `YOUR_GOOGLE_CLIENT_SECRET_HERE` | เดียวกับด้านบน → Client Secret                                                                       |

### GitHub OAuth

| Service              | Variable               | Value                            | หาได้จาก                                                                                          |
| -------------------- | ---------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------- |
| GitHub Client ID     | `GITHUB_CLIENT_ID`     | `YOUR_GITHUB_CLIENT_ID_HERE`     | [github.com/settings/developers](https://github.com/settings/developers) → OAuth Apps → Client ID |
| GitHub Client Secret | `GITHUB_CLIENT_SECRET` | `YOUR_GITHUB_CLIENT_SECRET_HERE` | เดียวกับด้านบน → Client Secret                                                                    |

### หมายเหตุ OAuth

- Google: ต้องตั้ง Authorized redirect URIs ให้ตรงกับ callback URL ของ app
- GitHub: ต้องตั้ง Authorization callback URL ใน OAuth App settings
- ทั้งสองต้องมี redirect URI สำหรับ localhost (dev) และ production domain

---

## 7. Database

Connection strings สำหรับ primary database และ cache

| Service    | Variable       | Value                    | หาได้จาก                                              |
| ---------- | -------------- | ------------------------ | ----------------------------------------------------- |
| PostgreSQL | `DATABASE_URL` | `YOUR_DATABASE_URL_HERE` | รูปแบบ: `postgresql://user:password@host:5432/dbname` |
| Redis      | `REDIS_URL`    | `YOUR_REDIS_URL_HERE`    | รูปแบบ: `redis://user:password@host:6379/0`           |

### หมายเหตุ Database

- Development: ใช้ Docker Compose สำหรับ PostgreSQL + Redis ใน local
- Production: ใช้ managed service เช่น Supabase, Neon (PostgreSQL), Upstash (Redis)
- `DATABASE_URL` ต้องรวม SSL parameter สำหรับ production: `?sslmode=require`

---

## 8. GitLab

Token และ API endpoint สำหรับ GitLab self-hosted

| Service        | Variable                       | Value                                         | หาได้จาก                                                                                           |
| -------------- | ------------------------------ | --------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| GitLab PAT     | `GITLAB_PERSONAL_ACCESS_TOKEN` | `YOUR_GITLAB_PAT_HERE`                        | GitLab → User Settings → Access Tokens → สร้าง token ที่มี scope: `api, read_api, read_repository` |
| GitLab API URL | `GITLAB_API_URL`               | `https://gitlab.dev.jigsawgroups.work/api/v4` | URL ของ GitLab instance + `/api/v4`                                                                |

### หมายเหตุ GitLab

- ใช้ GitLab self-hosted ที่ `gitlab.dev.jigsawgroups.work`
- PAT ต้องมี scope: `api`, `read_api`, `read_repository` เป็นอย่างน้อย
- สำหรับ CI/CD ควรใช้ Project Access Token แทน Personal Access Token
- Token มีอายุ — ตั้ง expiry date แล้วใส่ปฏิทินเตือน

---

## 9. Monitoring & Alerts

ระบบแจ้งเตือนและ uptime monitoring

| Service             | Variable              | Value                           | หาได้จาก                                                                                |
| ------------------- | --------------------- | ------------------------------- | --------------------------------------------------------------------------------------- |
| Lark Webhook        | `LARK_WEBHOOK_URL`    | `YOUR_LARK_WEBHOOK_URL_HERE`    | Lark → Group → Settings → Bots → Custom Bot → Webhook URL                               |
| UptimeRobot API Key | `UPTIMEROBOT_API_KEY` | `YOUR_UPTIMEROBOT_API_KEY_HERE` | [uptimerobot.com](https://uptimerobot.com/) → My Settings → API Settings → Main API Key |

### หมายเหตุ Monitoring

- Lark webhook ใช้ส่ง alert ไปยัง group chat (deployment, error, uptime)
- UptimeRobot free tier: 50 monitors, 5-minute interval
- ถ้าใช้ Uptime Kuma (self-hosted) ไม่ต้องใช้ API key — ตั้งค่าผ่าน web UI

---

## 10. Subscription Tracker (สถานะจริง April 2026)

| Tool           | Plan               | ราคา/เดือน     |     สถานะ      | หมายเหตุ                      |
| -------------- | ------------------ | -------------- | :------------: | ----------------------------- |
| Claude Code    | Max Plan           | รวมใน Max Plan |   ✅ Active    | ไม่ใช่ usage-based            |
| CodeRabbit Pro | Pro                | $24/dev        |  ✅ สมัครแล้ว  | ใช้ได้ทุก repo ที่เชื่อม      |
| Qodo Teams     | Teams              | $30/user       |  ✅ สมัครแล้ว  | ใช้ได้ทุก repo ที่เชื่อม      |
| Snyk           | Free               | $0             |   ✅ Active    | —                             |
| Sentry         | Developer (free)   | $0             |   ✅ Active    | —                             |
| UptimeRobot    | Free               | $0             |   ✅ Active    | —                             |
| OpenAI API     | Usage-based        | ตาม usage      | ⚙️ ตามต้องการ  | ใช้เมื่อต้องเปรียบเทียบ model |
| Gemini API     | Free / Usage-based | $0             | ⚙️ ตามต้องการ  | —                             |
| Stripe         | Usage-based        | 2.9% + ฿10/txn | ⚙️ Config แล้ว | เปิดใช้เมื่อมี payment        |
| Resend         | Free               | $0             | ⚙️ Config แล้ว | เปิดใช้เมื่อมี email          |

### สรุปค่าใช้จ่ายจริง

- **Paid subscriptions:** $54/mo (CodeRabbit $24 + Qodo $30) — สมัครแล้ว ใช้ได้ทุก repo
- **Claude Code:** รวมใน Max Plan (ไม่มีค่าใช้จ่ายเพิ่ม)
- **Free tools:** 33 ตัว ($0)
- **เมื่อ copy ไปโปรเจกต์ใหม่:** ค่าใช้จ่ายไม่เพิ่ม แค่เชื่อม repo ใหม่

---

## วิธีใช้ไฟล์นี้เมื่อ copy ไปโปรเจกต์ใหม่

1. **ก่อนอื่นเลย:** เพิ่ม `QA-QC_Master/_credentials.md` ใน `.gitignore` ของโปรเจกต์ใหม่
2. ตรวจสอบ: `git status` → ไฟล์นี้ต้อง **ไม่** โผล่เป็น untracked/modified
3. เปลี่ยนค่า `YOUR_xxx_HERE` เป็นค่าจริง
4. เก็บ backup ไว้ใน password manager (1Password, Bitwarden)
5. สำหรับ CI/CD ให้ใช้ GitLab CI/CD Variables แทนการใส่ค่าตรงในไฟล์

> **ข้อควรระวัง:**
>
> - ห้าม commit ไฟล์นี้เด็ดขาด — ต้องอยู่ใน .gitignore ก่อนทำอะไรอื่น
> - ห้าม share ผ่าน chat, email หรือ channel ที่ไม่ encrypt
> - ใช้ password manager หรือ secret management tool เท่านั้น
