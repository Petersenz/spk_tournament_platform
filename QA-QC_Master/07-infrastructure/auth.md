# Authentication — NextAuth v5

> NextAuth v5 (beta) สำหรับ authentication
> รองรับ Email Magic Link + OAuth (Google, GitHub)

---

## NextAuth v5 Overview

| คุณสมบัติ            | รายละเอียด                      |
| -------------------- | ------------------------------- |
| **Package**          | `next-auth@^5.0.0-beta.30`      |
| **Version**          | v5 (beta)                       |
| **Adapter**          | `@auth/drizzle-adapter@^1.11.1` |
| **Password Hashing** | `bcryptjs@^3.0.3`               |
| **Pricing**          | Free (open-source library)      |

---

## Authentication Methods

### 1. Email Magic Link

- User กรอก email → ได้รับ link ทาง email
- คลิก link → login สำเร็จ
- ไม่ต้องจำ password
- ส่ง email ผ่าน Resend (ดู [email.md](email.md))

### 2. Google OAuth

- "Sign in with Google" button
- ต้องสร้าง Google Cloud project + OAuth credentials

### 3. GitHub OAuth

- "Sign in with GitHub" button
- ต้องสร้าง GitHub OAuth App

---

## Environment Variables

```env
# .env.local

# --- NextAuth Core ---
NEXTAUTH_URL=http://localhost:3030
NEXTAUTH_SECRET=generate-a-random-secret-here

# --- Google OAuth ---
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# --- GitHub OAuth ---
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

### Generate Secret

```bash
openssl rand -base64 32
```

---

## Google OAuth Setup

1. เข้า [Google Cloud Console](https://console.cloud.google.com/)
2. สร้าง Project → APIs & Services → Credentials
3. Create Credentials → OAuth Client ID
4. Application type: **Web application**
5. Authorized redirect URIs:
   - Development: `http://localhost:3030/api/auth/callback/google`
   - Production: `https://viberqc.com/api/auth/callback/google`
6. Copy **Client ID** + **Client Secret** → `.env.local`

---

## GitHub OAuth Setup

1. เข้า [GitHub Developer Settings](https://github.com/settings/developers)
2. New OAuth App
3. Authorization callback URL:
   - Development: `http://localhost:3030/api/auth/callback/github`
   - Production: `https://viberqc.com/api/auth/callback/github`
4. Copy **Client ID** + **Client Secret** → `.env.local`

---

## Database Adapter

ใช้ Drizzle Adapter เก็บ user data ใน PostgreSQL:

```json
"@auth/drizzle-adapter": "^1.11.1"
```

Tables ที่สร้าง:

- `users` — ข้อมูล user
- `accounts` — OAuth accounts (Google, GitHub)
- `sessions` — Active sessions
- `verification_tokens` — Magic link tokens

---

## Password Hashing

```json
"bcryptjs": "^3.0.3"
```

สำหรับ user ที่ใช้ email + password (นอกจาก magic link):

```typescript
import bcrypt from "bcryptjs";

// Hash password
const hashed = await bcrypt.hash(password, 12);

// Verify password
const isValid = await bcrypt.compare(password, hashed);
```

---

## Security Considerations

| หัวข้อ           |        สถานะ        |
| ---------------- | :-----------------: |
| CSRF Protection  | Built-in (NextAuth) |
| Secure Cookies   |  Auto (production)  |
| Session Rotation |      Built-in       |
| Rate Limiting    |    ต้องเพิ่มเอง     |
| Account Lockout  |    ต้องเพิ่มเอง     |

---

## Production Checklist

- [ ] `NEXTAUTH_SECRET` ใช้ค่าใหม่ (ไม่ใช่ default)
- [ ] `NEXTAUTH_URL` ตั้งเป็น production URL
- [ ] Google OAuth: เพิ่ม production callback URL
- [ ] GitHub OAuth: เพิ่ม production callback URL
- [ ] ตรวจว่า cookie ใช้ `secure: true` ใน production
- [ ] ตรวจว่า database adapter ทำงานถูกต้อง
