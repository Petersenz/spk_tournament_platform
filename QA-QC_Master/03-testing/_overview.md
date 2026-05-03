# Step 3 --- Testing Overview

> **SYNERRY AI Team --- Testing Strategy Guide 2026**
>
> ระบบการทดสอบแบบครบวงจร ตั้งแต่ Unit Test ถึง UAT
> อัปเดตล่าสุด: 2026-04-06

---

## Testing Pyramid

```
                    /\
                   /  \
                  / UAT \               <-- น้อยสุด, ช้าสุด, แพงสุด
                 /--------\
                / E2E Tests \           <-- ทดสอบ flow จริง (Playwright)
               /--------------\
              / Integration     \       <-- API + DB + Services
             /--------------------\
            /    Unit Tests        \    <-- เยอะสุด, เร็วสุด, ถูกสุด
           /__________________________\

   เร็ว + ถูก (ล่าง) -----> ช้า + แพง (บน)
   จำนวนมาก (ล่าง) -----> จำนวนน้อย (บน)
```

### หลักการ

- **Unit Tests** คือฐาน --- เขียนเยอะ รันเร็ว ค่าใช้จ่ายต่ำ
- **Integration Tests** ตรวจว่าระบบต่อกันได้ --- API routes + database + services
- **E2E Tests** จำลอง user จริง --- ทดสอบ flow สำคัญเท่านั้น
- **UAT** คือด่านสุดท้าย --- user จริงทดสอบก่อน launch

---

## Testing Types --- ภาพรวมทั้ง 7 ประเภท

|  #  | ประเภท                 | เครื่องมือ                 | ทดสอบอะไร                                               | รันเมื่อไหร่                 | Automation | ความถี่                |
| :-: | ---------------------- | -------------------------- | ------------------------------------------------------- | ---------------------------- | :--------: | ---------------------- |
|  1  | **Unit Test**          | Vitest                     | Functions, Components, Utils                            | ทุก commit                   | 100% Auto  | ทุกวัน                 |
|  2  | **Integration Test**   | Supertest + Testcontainers | API + DB + Services                                     | ทุก PR                       | 100% Auto  | ทุก PR                 |
|  3  | **E2E Test**           | Playwright                 | User flows ข้าม browser                                 | ก่อน merge to main           | 100% Auto  | ทุก PR / daily         |
|  4  | **Accessibility**      | axe-core + Pa11y + WAVE    | WCAG 2.1 AA compliance                                  | ก่อน release                 |  80% Auto  | รายสัปดาห์             |
|  5  | **Cross-Browser**      | Playwright + BrowserStack  | Browser compatibility                                   | ก่อน release                 |  90% Auto  | รายสัปดาห์             |
|  6  | **Load/Stress**        | k6                         | Performance under load                                  | ก่อน launch + รายเดือน       | 100% Auto  | รายเดือน               |
|  7  | **UAT**                | Manual + Maze              | User acceptance                                         | ก่อน launch                  | 0% Manual  | ทุก release            |
|  8  | **Page-by-Page Audit** | Claude CLI + DevTools      | ตรวจทีละหน้า 7 มิติ (CRUD/API/DB/UX/Security/Perf/i18n) | หลัง AI ทำงาน + ก่อน release | กึ่ง Auto  | ทุก release / รายเดือน |

---

## Coverage Targets

| ประเภท                        |       เป้าหมาย        |   ขั้นต่ำ   |
| ----------------------------- | :-------------------: | :---------: |
| Unit Test Coverage            |          80%          |     70%     |
| Integration Test (API routes) |  100% critical paths  |     80%     |
| E2E Test (user flows)         |     Top 10 flows      | Top 5 flows |
| Accessibility Score           |  WCAG 2.1 AA (100%)   |   Level A   |
| Cross-Browser                 | 4 browsers + 2 mobile | 3 browsers  |
| Load Test                     | 500 concurrent users  |  100 users  |

---

## เครื่องมือทั้งหมดใน Step 3

| เครื่องมือ                  | ประเภท             | Free/Paid |                    ไฟล์เอกสาร                    |
| --------------------------- | ------------------ | :-------: | :----------------------------------------------: |
| Vitest                      | Unit Test          |   Free    |        [unit-testing.md](unit-testing.md)        |
| Supertest + Testcontainers  | Integration Test   |   Free    | [integration-testing.md](integration-testing.md) |
| Playwright                  | E2E Test           |   Free    |         [e2e-testing.md](e2e-testing.md)         |
| axe-core + Pa11y + WAVE     | Accessibility      |   Free    |       [accessibility.md](accessibility.md)       |
| BrowserStack + Responsively | Cross-Browser      |   Mixed   |       [cross-browser.md](cross-browser.md)       |
| k6                          | Load/Stress Test   |   Free    |        [load-testing.md](load-testing.md)        |
| Maze                        | UAT (Usability)    |   Paid    |                 [uat.md](uat.md)                 |
| Claude CLI + DevTools       | Page-by-Page Audit |   Free    |  [page-by-page-audit.md](page-by-page-audit.md)  |

---

## npm Scripts สำหรับ Testing

```bash
# Unit Tests
npm test                    # รัน Vitest ครั้งเดียว
npm run test:watch          # รัน Vitest แบบ watch mode
npm run test:coverage       # รัน Vitest + coverage report

# E2E Tests
npm run test:e2e            # รัน Playwright (headless)
npm run test:e2e:headed     # รัน Playwright (เปิด browser ให้เห็น)
npm run test:e2e:debug      # รัน Playwright + Playwright Inspector

# Integration Tests
npm run test:integration    # รัน integration tests

# Load Tests
npm run test:load           # รัน k6 load test

# ทั้งหมด
npm run test:all            # รัน unit + integration + e2e
```

---

## CI/CD Integration

```
Push/PR
  |
  +-- Unit Tests (Vitest)           ~30 วินาที
  |
  +-- Integration Tests (Supertest) ~2 นาที
  |
  +-- E2E Tests (Playwright)        ~5 นาที
  |
  +-- Accessibility (axe-core)      ~1 นาที
  |
  +-- ผ่านทั้งหมด? --> Merge allowed
```

> **หมายเหตุ:** Load Test และ UAT ไม่ได้รันใน CI ปกติ --- รันแยกก่อน release

---

## ลำดับการอ่าน

1. [unit-testing.md](unit-testing.md) --- เริ่มจาก Unit Test (ฐานของ Pyramid)
2. [integration-testing.md](integration-testing.md) --- ทดสอบ API + DB
3. [e2e-testing.md](e2e-testing.md) --- ทดสอบ User Flow ข้าม browser
4. [accessibility.md](accessibility.md) --- ตรวจ WCAG compliance
5. [cross-browser.md](cross-browser.md) --- ตรวจ browser compatibility
6. [load-testing.md](load-testing.md) --- ทดสอบรับ load
7. [uat.md](uat.md) --- User Acceptance Testing
8. [page-by-page-audit.md](page-by-page-audit.md) --- **ตรวจทีละหน้า 7 มิติ (ใช้หลัง AI ทำงาน)**

---

> **SYNERRY AI Team** | QA-QC Master v1.0 | April 2026
