# Page-by-Page Deep Audit — ตรวจระบบทีละหน้า 7 มิติ

> **SYNERRY Full System Audit Method**
>
> แทนที่จะตรวจแบบ random — ไล่ทีละเมนู ทีละหน้า ตามลำดับ Sidebar
> แต่ละหน้าตรวจ 7 มิติ จนกว่าจะผ่านทั้งหมด
> อัปเดตล่าสุด: 2026-04-06

---

## ปัญหาที่วิธีนี้แก้

| ปัญหาเดิม                                       | Page-by-Page แก้ยังไง                                |
| ----------------------------------------------- | ---------------------------------------------------- |
| AI ตรวจผิวเผิน บอกว่า "ดี" แต่ไม่ได้กดทดสอบจริง | **บังคับตรวจ 7 มิติทุกหน้า** — ต้องกดจริง ดู DB จริง |
| ตรวจแบบ random ข้ามหน้าสำคัญ                    | **ไล่ตาม Sidebar** — ไม่มีหน้าไหนหลุด                |
| แก้จุดหนึ่งพังอีกจุด                            | **ตรวจทุกหน้าใหม่** หลังแก้ issue                    |
| บอกว่า CRUD ทำงาน แต่ data ไม่เข้า DB           | **D3 บังคับเปิด DB ดูข้อมูลจริง**                    |
| API return mock data แต่ไม่รู้                  | **D2 ตรวจ Network tab + API logs จริง**              |

---

## 7 มิติที่ตรวจทุกหน้า

|   #    | มิติ            | ตรวจอะไร                                                                      | เครื่องมือ                                    |
| :----: | --------------- | ----------------------------------------------------------------------------- | --------------------------------------------- |
| **D1** | **CRUD**        | Create/Read/Update/Delete ทำงานจริง? กด Save แล้วข้อมูลเข้า DB จริงหรือ mock? | curl, Prisma Studio / Drizzle Studio, browser |
| **D2** | **API Wiring**  | Frontend เรียก API จริง? response structure ถูก? error handling ทำงาน?        | Network tab, API logs, `curl`                 |
| **D3** | **Database**    | ข้อมูลเข้า DB จริง? relation ถูก? migration up-to-date?                       | Prisma Studio / Drizzle Studio, SQL query     |
| **D4** | **UX/UI**       | Loading state, empty state, error state, responsive, dark/light mode          | Visual inspection, Responsively               |
| **D5** | **Security**    | Auth guard, permission check, input sanitize, XSS, CSRF                       | Code review + manual test                     |
| **D6** | **Performance** | Page load time, API response time, unnecessary re-renders                     | Lighthouse, Network tab                       |
| **D7** | **i18n**        | TH/EN สลับได้? ข้อความครบทั้ง 2 ภาษา? ไม่มี hardcoded text?                   | Toggle EN/TH ทดสอบทุกหน้า                     |

### เกณฑ์ผ่าน/ไม่ผ่าน

| มิติ           | ผ่าน ✅                                        | ไม่ผ่าน ❌                                    |
| -------------- | ---------------------------------------------- | --------------------------------------------- |
| D1 CRUD        | ข้อมูลเข้า DB จริง + CRUD ครบ 4 operation      | ใช้ mock data / บาง operation พัง             |
| D2 API         | Frontend เรียก API จริง + error handling ทำงาน | เรียก API ผิด endpoint / ไม่มี error handling |
| D3 Database    | Data ตรง + relation ถูก + migration ล่าสุด     | Data หาย / relation ผิด / migration ค้าง      |
| D4 UX/UI       | ทุก state แสดงผลถูก + responsive ไม่พัง        | Empty state ไม่มี / responsive พัง            |
| D5 Security    | Auth guard ทุก route + input sanitize          | เข้าหน้า admin ได้โดยไม่ login                |
| D6 Performance | Page load < 3s + ไม่มี unnecessary re-render   | โหลดช้า / API timeout                         |
| D7 i18n        | ทั้ง TH/EN แสดงผลครบ ไม่มี hardcoded text      | มี text ภาษาเดียว / key หาย                   |

---

## 3-Step Workflow

```
Step 1: Automated Scan           Step 2: Page-by-Page           Step 3: Fix & Report
(รันรอบเดียว ได้ภาพรวม)          (ไล่ทีละหน้า 7 มิติ)           (แก้ + สรุป)
┌─────────────────────┐     ┌─────────────────────┐     ┌─────────────────────┐
│ npm run lint         │     │ เปิดหน้าจริง        │     │ Zone 1: เสี่ยง      │
│ npm test             │ →   │ ตรวจ D1-D7          │ →   │ Zone 2: แก้ได้เลย   │
│ npm run build        │     │ บันทึก Report       │     │ Score Before/After  │
│ npm run security     │     │ หน้าถัดไป...        │     │ สรุป issues ทั้งหมด  │
│ Claude อ่าน code     │     │                     │     │                     │
└─────────────────────┘     └─────────────────────┘     └─────────────────────┘
     ~10 นาที                    ~15-30 นาที/หน้า            ~สรุปตอนจบ
```

---

## Step 1: Automated Scan

รันทีเดียวได้ภาพรวมทั้ง project — ไม่ต้องดูทีละหน้า:

```bash
# === รัน commands ทั้งหมด ===

# 1. Lint errors
npm run lint

# 2. TypeScript errors
npx tsc --noEmit

# 3. Unit tests
npm test

# 4. Build test
npm run build

# 5. Security scan
npm run security

# 6. Dependency audit
npm audit --audit-level=high

# 7. Unused dependencies
npx depcheck

# 8. Circular imports
npx madge --circular src/

# 9. Duplicate code
npx jscpd src/ --min-lines 10

# 10. Dead code (optional — ติดตั้ง: npm i -D knip)
# npx knip
```

### Claude CLI Prompt — Automated Scan

```
สั่งใน Claude CLI:

"รัน Automated Scan ให้:
1. npm run lint — นับ errors/warnings
2. npx tsc --noEmit — นับ type errors
3. npm test — ดู coverage %
4. npm run build — build ผ่านไหม
5. npm audit — vulnerabilities กี่ตัว
6. npx depcheck — unused deps กี่ตัว
7. npx madge --circular src/ — circular imports กี่จุด

สรุปผลเป็นตาราง:
| Check | ผล | จำนวน issues |
แล้วจัดลำดับ: Critical → High → Medium → Low"
```

---

## Step 2: Page-by-Page Audit

### วิธีทำ

1. **เปิด app จริงใน browser** (localhost:3030)
2. **ไล่ตาม Sidebar** เมนูบนสุด → เมนูล่างสุด
3. **แต่ละหน้า ตรวจ 7 มิติ** ใช้ template ด้านล่าง
4. **บันทึกผล** ก่อนไปหน้าถัดไป

### Audit Report Template

Copy template นี้ใช้กับทุกหน้า:

```markdown
## Audit Report: [ชื่อเมนู] > [ชื่อหน้า]

|  #  | มิติ        |  ผล   | รายละเอียด                              |
| :-: | ----------- | :---: | --------------------------------------- |
| D1  | CRUD        | ✅/❌ |                                         |
| D2  | API Wiring  | ✅/❌ | mock หรือ real? endpoint ถูกไหม?        |
| D3  | Database    | ✅/❌ | data เข้า DB จริงไหม? เปิด Studio ดู    |
| D4  | UX/UI       | ✅/❌ | loading/empty/error state? responsive?  |
| D5  | Security    | ✅/❌ | auth guard? permission? input sanitize? |
| D6  | Performance | ✅/❌ | load time? API response time?           |
| D7  | i18n        | ✅/❌ | TH/EN ครบ? hardcoded text?              |

**Score: X/7**
**Issues:**

- [ ] issue 1
- [ ] issue 2
```

### Claude CLI Prompt — Page Audit

```
สั่งใน Claude CLI:

"ตรวจหน้า [ชื่อหน้า] ตาม Page-by-Page Audit 7 มิติ:

D1 CRUD: อ่าน code ของหน้านี้ ดูว่า Create/Read/Update/Delete
   เรียก API จริงหรือ mock? ดู fetch/axios calls
D2 API Wiring: ตรวจว่า API endpoint ที่เรียกมีจริงใน route handlers ไหม?
   response type ตรงกับ frontend expects ไหม?
D3 Database: ตรวจ route handler ว่า query DB จริงหรือ return hardcoded?
   ดู Drizzle/Prisma query ว่า schema ตรงไหม?
D4 UX/UI: ตรวจว่ามี loading state, empty state, error state ครบไหม?
D5 Security: ตรวจ middleware auth guard, permission check, input validation
D6 Performance: ตรวจ query ว่ามี N+1? มี unnecessary re-fetch?
D7 i18n: ตรวจว่า text ใช้ translation key หรือ hardcoded?

สรุปเป็น Report Template ตาม format ใน page-by-page-audit.md"
```

---

## Step 3: Fix & Report

หลังตรวจทุกหน้า สรุปเป็น 2 Zone:

### Zone 1 — เสี่ยง (ต้อง backup/test staging ก่อน)

| #   | หน้า | Issue | ทำไมเสี่ยง | วิธีแก้ที่ปลอดภัย | Effort |
| --- | ---- | ----- | ---------- | ----------------- | ------ |
| 1   |      |       |            |                   |        |

### Zone 2 — แก้ได้เลย (ไม่กระทบระบบ)

| #   | หน้า | Issue | วิธีแก้ | ผลที่ได้ | Effort |
| --- | ---- | ----- | ------- | -------- | ------ |
| 1   |      |       |         |          |        |

### Score Summary

```
Before: XX% → After: XX% (+XX%)
Critical issues: X ข้อ
Quick wins: X ข้อ (แก้ง่าย ผลชัด)
```

---

## Claude CLI Prompt — Full Page-by-Page Audit (ทุกหน้า)

```
สั่งใน Claude CLI:

"อ่าน QA-QC_Master/03-testing/page-by-page-audit.md

ทำ Full System Audit ให้ project นี้:

Step 1 — Automated Scan:
รัน npm run lint, npx tsc --noEmit, npm test, npm run build
สรุปผลเป็นตาราง

Step 2 — Page-by-Page:
อ่าน app router structure (src/app/) ไล่ทุก route
แต่ละ route ตรวจ 7 มิติ (D1-D7)
สร้าง Audit Report ทุกหน้า

Step 3 — Fix & Report:
แยก Zone 1 (เสี่ยง) กับ Zone 2 (แก้ได้เลย)
จัดลำดับ Critical → High → Medium → Low
สรุป Score Before/After"
```

---

## Tools ที่ใช้

### มีอยู่แล้ว (ไม่ต้องติดตั้ง)

| เครื่องมือ       | ทำอะไร                                   | คำสั่ง                                      |
| ---------------- | ---------------------------------------- | ------------------------------------------- |
| Browser DevTools | Network tab, Console errors, Performance | F12                                         |
| Lighthouse       | Performance + Accessibility score        | Chrome DevTools > Lighthouse                |
| curl             | ทดสอบ API ตรงๆ                           | `curl -X GET http://localhost:3030/api/...` |
| Drizzle Studio   | ดู DB ตรงๆ (Root app)                    | `npm run db:studio`                         |
| Prisma Studio    | ดู DB ตรงๆ (Central app)                 | `npx prisma studio`                         |
| ESLint           | ตรวจ lint errors                         | `npm run lint`                              |
| TypeScript       | ตรวจ type errors                         | `npx tsc --noEmit`                          |
| Vitest           | Run unit tests                           | `npm test`                                  |

### แนะนำเพิ่ม (optional)

| เครื่องมือ  | ทำอะไร                                     | ติดตั้ง                                                     | ฟรี? |
| ----------- | ------------------------------------------ | ----------------------------------------------------------- | :--: |
| **Knip**    | หา dead code, unused exports/dependencies  | `npm i -D knip` แล้วรัน `npx knip`                          |  ✅  |
| **Semgrep** | Static security analysis — หา OWASP Top 10 | `brew install semgrep` แล้วรัน `semgrep --config auto src/` |  ✅  |

---

## เมื่อไหร่ควรทำ Page-by-Page Audit

| สถานการณ์                  | ทำไม                                        |
| -------------------------- | ------------------------------------------- |
| **หลัง AI ทำงานเสร็จ**     | ป้องกัน AI ทำไม่เรียบร้อย — ตรวจด้วย 7 มิติ |
| **ก่อน release / deploy**  | ด่านสุดท้ายก่อนขึ้น production              |
| **หลัง major refactor**    | แก้จุดหนึ่งอาจพังอีกจุด                     |
| **รายเดือน (maintenance)** | จับ regression bugs ที่สะสม                 |
| **หลัง merge MR ใหญ่**     | ตรวจว่า merge ไม่พัง existing features      |

---

## แผน Branch สำหรับ Audit

```bash
# สร้าง branch สำหรับ audit + fix
git checkout -b qaqc/full-system-audit

# ทำ Automated Scan + Page-by-Page
# แก้ issues ที่เจอ

# Commit ทีละ zone
git commit -m "fix: resolve Zone 2 quick wins from system audit"
git commit -m "fix: resolve Zone 1 critical issues (tested in staging)"

# Push + MR
git push -u origin qaqc/full-system-audit
# เปิด MR → CodeRabbit + Qodo review → Merge
```
