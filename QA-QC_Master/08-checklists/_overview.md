# 08 — Checklists: ภาพรวม

> 143 checklist items จาก Enterprise 360 — จัดกลุ่มตาม 8 Phases
> Quality Gate: 5 เงื่อนไขที่ต้องผ่านก่อน release

---

## สารบัญไฟล์

| ไฟล์                                       | เนื้อหา                                       | Items |
| ------------------------------------------ | --------------------------------------------- | :---: |
| [quality-gate.md](quality-gate.md)         | Quality Gate — 5 เงื่อนไข PASS/FAIL           |   5   |
| [design-checklist.md](design-checklist.md) | Design/UI — Browser, Device, Responsive       |  ~25  |
| [code-checklist.md](code-checklist.md)     | Code Quality — 21 items + Anti-Bullshit Rules |  32   |
| [pre-launch.md](pre-launch.md)             | Pre-Launch — 17 items ก่อน go-live            |  17   |
| [compliance.md](compliance.md)             | Compliance — WCAG, OWASP, PDPA, PCI-DSS       |  ~50  |

---

## Enterprise 360 — 8 Phases

```
Phase 1: Planning          → design-checklist.md (บางส่วน)
Phase 2: Development       → code-checklist.md
Phase 3: Functional Test   → design-checklist.md (UI testing)
Phase 4: Performance       → 04-performance-seo/
Phase 5: Security          → compliance.md (OWASP)
Phase 6: Accessibility     → compliance.md (WCAG)
Phase 7: SEO               → 04-performance-seo/
Phase 8: Deploy & Monitor  → pre-launch.md
```

---

## Quality Gate — PASS/FAIL

ก่อน release ทุกครั้งต้องผ่าน 5 เงื่อนไข:

|  #  | เงื่อนไข         |    PASS เมื่อ     |
| :-: | ---------------- | :---------------: |
|  1  | Critical items   | 0 items unchecked |
|  2  | Security scan    |    ภายใน 7 วัน    |
|  3  | Health Score     |       >= 60       |
|  4  | Production Build |       ผ่าน        |
|  5  | Secrets Leak     |       ไม่มี       |

> **ผ่านทั้ง 5 = PASS** / ไม่ผ่านแม้ข้อเดียว = **FAIL**

ดูรายละเอียดที่ [quality-gate.md](quality-gate.md)

---

## Scoring System

| Grade | Score | ความหมาย         |
| :---: | :---: | ---------------- |
|  A+   | >= 95 | พร้อม production |
|   A   | 85-94 | ดีมาก            |
|   B   | 70-84 | ดี               |
|   C   | 60-69 | พอใช้            |
|   D   | 50-59 | ต้องปรับปรุง     |
|   F   | < 50  | ห้าม release     |

---

## Page-by-Page Deep Audit (ตรวจทีละหน้า 7 มิติ)

> **ใช้เมื่อ:** หลัง AI ทำงานเสร็จ / ก่อน release / หลัง major refactor
> **อยู่ที่:** [03-testing/page-by-page-audit.md](../03-testing/page-by-page-audit.md)

วิธีนี้แก้ปัญหา **AI ทำงานไม่เรียบร้อย** — ไล่ตรวจทีละหน้าตาม Sidebar ด้วย 7 มิติ:

| มิติ           | ตรวจอะไร                          |
| -------------- | --------------------------------- |
| D1 CRUD        | ข้อมูลเข้า DB จริงไหม?            |
| D2 API         | Frontend เรียก API จริงหรือ mock? |
| D3 Database    | Data ถูกต้อง? relation ถูก?       |
| D4 UX/UI       | Loading/empty/error state ครบ?    |
| D5 Security    | Auth guard + permission ถูก?      |
| D6 Performance | Page load ไม่เกิน 3 วินาที?       |
| D7 i18n        | TH/EN ครบ? ไม่มี hardcoded text?  |

---

## Workflow การใช้ Checklists

```
เริ่ม Sprint
     │
     ├──▶ code-checklist.md     → ระหว่าง develop
     │
     ├──▶ design-checklist.md   → หลัง UI เสร็จ
     │
     ├──▶ Page-by-Page Audit    → หลัง AI ทำงาน (ตรวจทีละหน้า 7 มิติ)
     │
     ├──▶ compliance.md         → ก่อน release (OWASP + WCAG)
     │
     ├──▶ pre-launch.md         → ก่อน deploy production
     │
     └──▶ quality-gate.md       → Gate review สุดท้าย
              │
              ├── PASS → Deploy!
              └── FAIL → แก้ไข → วน loop
```

---

## เกี่ยวข้องกับ Scripts

| Script                 | ตรวจ Checklist ไหน             |
| ---------------------- | ------------------------------ |
| `npm run quality`      | quality-gate (7 categories)    |
| `npm run security`     | compliance (OWASP items)       |
| `npm run quality:code` | code-checklist (7 dimensions)  |
| `npm run quality:deps` | code-checklist (dependencies)  |
| `npm run quality:a11y` | compliance (WCAG items)        |
| `npm run quality:perf` | design-checklist (performance) |
