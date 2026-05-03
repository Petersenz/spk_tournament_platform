# Accessibility Testing --- axe-core + Pa11y + WAVE

> **SYNERRY AI Team --- Accessibility Testing Guide 2026**
>
> ทดสอบ WCAG 2.1 AA compliance ด้วย 3 เครื่องมือที่ overlap < 80%
> อัปเดตล่าสุด: 2026-04-06

---

## 3 เครื่องมือ --- ทำไมต้องใช้ 3 ตัว

| เครื่องมือ   | ประเภท          | จุดเด่น                                         | ราคา |
| ------------ | --------------- | ----------------------------------------------- | :--: |
| **axe-core** | Library (CI/CD) | Automated ใน pipeline, integrate กับ Playwright | Free |
| **Pa11y**    | CLI             | Quick check จาก terminal, สร้าง report          | Free |
| **WAVE**     | Online tool     | Visual overlay --- เห็นปัญหาบนหน้าจริง          | Free |

### ทำไมไม่ใช้ตัวเดียว?

- **axe-core** เก่งเรื่อง automated rules ใน CI แต่ไม่เห็นภาพ
- **Pa11y** เก่งเรื่อง CLI quick check + HTML report แต่ rules ต่างจาก axe
- **WAVE** เห็นปัญหาแบบ visual บน page จริง แต่ทำ automate ไม่ได้

3 ตัวรวมกันครอบคลุม WCAG 2.1 AA ได้ดีที่สุด

---

## 1. axe-core + @axe-core/playwright

> ใช้ใน CI/CD pipeline --- ทดสอบ accessibility อัตโนมัติทุก PR

### ติดตั้ง

```bash
npm i -D @axe-core/playwright
```

### ใช้กับ Playwright Tests

```typescript
// e2e/accessibility/a11y.spec.ts
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Accessibility Tests", () => {
  const pages = [
    { name: "Home", path: "/" },
    { name: "Login", path: "/login" },
    { name: "Dashboard", path: "/dashboard" },
    { name: "Projects", path: "/projects" },
    { name: "Settings", path: "/settings" },
  ];

  for (const page of pages) {
    test(`${page.name} page ผ่าน WCAG 2.1 AA`, async ({ page: p }) => {
      await p.goto(page.path);

      const results = await new AxeBuilder({ page: p })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();

      expect(results.violations).toEqual([]);
    });
  }
});
```

### ตรวจเฉพาะส่วนที่ต้องการ

```typescript
test("Form มี labels ครบ", async ({ page }) => {
  await page.goto("/contact");

  const results = await new AxeBuilder({ page })
    .include('[data-testid="contact-form"]') // ตรวจเฉพาะ form
    .withRules(["label", "form-field-multiple-labels"])
    .analyze();

  expect(results.violations).toEqual([]);
});
```

---

## 2. Pa11y --- CLI Quick Check

> ใช้ตรวจเร็วๆ จาก terminal --- เหมาะตอน develop

### ติดตั้ง

```bash
npm i -D pa11y pa11y-ci
```

### ใช้งาน CLI

```bash
# ตรวจหน้าเดียว
npx pa11y http://localhost:3030

# ตรวจหน้าเดียว --- WCAG 2.1 AA
npx pa11y --standard WCAG2AA http://localhost:3030

# สร้าง HTML report
npx pa11y --reporter html http://localhost:3030 > a11y-report.html
```

### Pa11y CI --- ตรวจหลายหน้า

```json
// .pa11yci.json
{
  "defaults": {
    "standard": "WCAG2AA",
    "timeout": 30000
  },
  "urls": [
    "http://localhost:3030/",
    "http://localhost:3030/login",
    "http://localhost:3030/dashboard",
    "http://localhost:3030/projects",
    "http://localhost:3030/settings"
  ]
}
```

```bash
npx pa11y-ci --config .pa11yci.json
```

---

## 3. WAVE --- Online Visual Tool

> ใช้ตรวจแบบ visual --- เห็นปัญหาซ้อนบน page จริง

### วิธีใช้

1. ไปที่: **https://wave.webaim.org/**
2. ใส่ URL ของ page ที่ต้องการตรวจ
3. WAVE จะแสดง overlay: errors (แดง), alerts (เหลือง), features (เขียว)

### เมื่อไหร่ควรใช้ WAVE

- ตอน review UI ใหม่ --- เห็นปัญหา visual ได้ทันที
- ก่อน release --- ตรวจหน้าสำคัญทั้งหมด
- เมื่อ axe-core report มีปัญหาที่ไม่เข้าใจ --- WAVE แสดงตำแหน่งบน page

### WAVE Browser Extension

ติดตั้ง extension สำหรับ Chrome/Firefox เพื่อตรวจหน้าที่ต้อง login ได้

---

## WebAIM Contrast Checker

> ตรวจ color contrast ratio ตาม WCAG standards

URL: **https://webaim.org/resources/contrastchecker/**

| Level | Contrast Ratio (Normal Text) | Contrast Ratio (Large Text) |
| ----- | :--------------------------: | :-------------------------: |
| AA    |           >= 4.5:1           |           >= 3:1            |
| AAA   |            >= 7:1            |          >= 4.5:1           |

**เป้าหมายของเรา: WCAG 2.1 AA** --- ทุก text ต้องมี contrast ratio >= 4.5:1

---

## WCAG 2.1 AA Standards Reference

### 4 หลักการ (POUR)

| หลักการ            | ความหมาย  | ตัวอย่าง                        |
| ------------------ | --------- | ------------------------------- |
| **Perceivable**    | รับรู้ได้ | alt text, captions, contrast    |
| **Operable**       | ใช้งานได้ | keyboard navigation, skip links |
| **Understandable** | เข้าใจได้ | clear labels, error messages    |
| **Robust**         | ทนทาน     | valid HTML, ARIA attributes     |

---

## Accessibility Checklist --- 16 รายการ (Enterprise 360 Phase 6)

|  #  | รายการตรวจ                                      |    เครื่องมือ    | สถานะ |
| :-: | ----------------------------------------------- | :--------------: | :---: |
|  1  | ทุก `<img>` มี `alt` attribute                  |     axe-core     |       |
|  2  | Form inputs มี `<label>` ที่ถูกต้อง             |     axe-core     |       |
|  3  | Color contrast >= 4.5:1 (normal text)           | Contrast Checker |       |
|  4  | Color contrast >= 3:1 (large text)              | Contrast Checker |       |
|  5  | Keyboard navigation ทำงานทุกหน้า                |  Manual + Pa11y  |       |
|  6  | Focus indicator มองเห็นชัด                      |      Manual      |       |
|  7  | Skip navigation link มีและทำงาน                 |      Pa11y       |       |
|  8  | Heading hierarchy ถูกต้อง (h1 > h2 > h3)        |     axe-core     |       |
|  9  | ARIA roles ใช้ถูกต้อง                           |     axe-core     |       |
| 10  | ไม่มี content ที่เข้าถึงได้เฉพาะ mouse          |      Manual      |       |
| 11  | Error messages เข้าใจง่าย + ระบุ field          |      Manual      |       |
| 12  | Form validation แจ้ง error ชัดเจน               |      Manual      |       |
| 13  | Page language ตั้งค่าถูกต้อง (`lang` attr)      |     axe-core     |       |
| 14  | Links มี descriptive text (ไม่ใช่ "click here") |       WAVE       |       |
| 15  | Tables มี headers ที่ถูกต้อง                    |     axe-core     |       |
| 16  | Video/Audio มี captions หรือ transcript         |      Manual      |       |

---

## npm Scripts

```json
{
  "scripts": {
    "test:a11y": "playwright test e2e/accessibility/",
    "test:a11y:pa11y": "pa11y-ci --config .pa11yci.json"
  }
}
```

---

## Prompt Template --- Claude CLI ตรวจ Accessibility

```
ตรวจสอบ accessibility ของ component [ชื่อ component]

ข้อกำหนด:
1. ตรวจ WCAG 2.1 AA ทุกข้อที่เกี่ยวข้อง
2. ตรวจ: alt texts, labels, ARIA, keyboard nav, contrast
3. สร้าง Playwright + axe-core test สำหรับ component นี้
4. ถ้าพบปัญหา --- แก้ให้เลย พร้อมอธิบายว่าแก้อะไร
5. ตรวจ focus order ว่าสมเหตุสมผล

ตรวจเพิ่ม:
- Screen reader compatibility (ARIA labels)
- Touch target size >= 44x44px (mobile)
- ไม่มี text ที่อ่านได้เฉพาะด้วยตา (color-only info)
```

---

## อ้างอิง

- axe-core: https://github.com/dequelabs/axe-core
- Pa11y: https://pa11y.org/
- WAVE: https://wave.webaim.org/
- WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
- WCAG 2.1: https://www.w3.org/TR/WCAG21/

---

> **SYNERRY AI Team** | QA-QC Master v1.0 | April 2026
