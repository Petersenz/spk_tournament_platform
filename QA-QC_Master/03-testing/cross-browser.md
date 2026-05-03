# Cross-Browser Testing --- BrowserStack + Responsively + Playwright

> **SYNERRY AI Team --- Cross-Browser Testing Guide 2026**
>
> ตรวจสอบว่า app ทำงานถูกต้องบนทุก browser และทุก device
> อัปเดตล่าสุด: 2026-04-06

---

## เครื่องมือ 3 ระดับ

| เครื่องมือ       | ประเภท            | ครอบคลุม                                         | ราคา | ใช้เมื่อ                                  |
| ---------------- | ----------------- | ------------------------------------------------ | :--: | ----------------------------------------- |
| **Playwright**   | Automated testing | Chrome, Firefox, Safari, Edge + Mobile emulation | Free | ทุก PR (CI/CD)                            |
| **Responsively** | Desktop app       | ดูหลาย viewport พร้อมกัน                         | Free | ระหว่าง develop                           |
| **BrowserStack** | Cloud testing     | Real devices + browsers 3,000+                   | Paid | ก่อน release / เมื่อต้อง test real device |

---

## Playwright --- ครอบคลุม 90% ของ Cross-Browser Testing

Playwright ที่ config ไว้ใน [e2e-testing.md](e2e-testing.md) ครอบคลุม:

|  #  | Project  | Engine   | ตรงกับ Browser             |
| :-: | -------- | -------- | -------------------------- |
|  1  | chromium | Chromium | Chrome, Edge, Brave, Opera |
|  2  | firefox  | Gecko    | Firefox                    |
|  3  | webkit   | WebKit   | Safari (macOS + iOS)       |
|  4  | edge     | Chromium | Microsoft Edge             |
|  5  | iphone14 | WebKit   | Safari on iPhone 14        |
|  6  | ipad     | WebKit   | Safari on iPad             |

### เมื่อไหร่ Playwright เพียงพอ

- ตรวจ rendering, layout, interactions บน 4 browser engines
- ตรวจ responsive design บน mobile viewports
- ตรวจ JavaScript compatibility
- ตรวจ CSS features ข้าม browsers

---

## Responsively --- Free Desktop App

> ดูหลาย viewport พร้อมกันบนหน้าจอเดียว --- เหมาะตอน develop

### ติดตั้ง

```bash
# macOS
brew install --cask responsively
```

หรือดาวน์โหลดจาก: https://responsively.app/

### จุดเด่น

- เปิดหลาย viewport พร้อมกัน (iPhone, iPad, Desktop)
- Scroll sync --- เลื่อนพร้อมกันทุก viewport
- Click sync --- คลิกพร้อมกันทุก viewport
- DevTools ใช้ได้ทุก viewport
- ถ่าย screenshot ทุก viewport ทีเดียว

### เมื่อไหร่ควรใช้

- ระหว่าง develop responsive UI
- ตรวจ layout ก่อนส่ง PR
- แต่ **ไม่ทดแทน** automated testing (Playwright)

---

## BrowserStack --- Real Device Testing (Paid)

> ทดสอบบน real devices + browsers 3,000+ ผ่าน cloud

### ทำไมเลือก BrowserStack (ไม่ใช่ LambdaTest)

| เกณฑ์                  |     BrowserStack      |  LambdaTest   |
| ---------------------- | :-------------------: | :-----------: |
| Real devices           |        3,000+         |    3,000+     |
| Reliability            | สูงกว่า (เก่าแก่กว่า) |      ดี       |
| Playwright integration |        Native         |    Native     |
| Pricing                |     $29/mo (Live)     | $15/mo (Live) |
| Enterprise trust       |        สูงกว่า        |    ปานกลาง    |
| Documentation          |         ดีมาก         |      ดี       |

**สรุป:** BrowserStack reliable กว่า, documentation ดีกว่า, enterprise trust สูงกว่า

### ราคา BrowserStack

| Plan     | ราคา/เดือน | ได้อะไร                                 |
| -------- | :--------: | --------------------------------------- |
| Live     |    $29     | Manual testing บน real devices          |
| Automate |    $129    | Automated testing (Playwright/Selenium) |

### เมื่อไหร่ต้องใช้ BrowserStack

- ต้อง test บน **real device** (ไม่ใช่ emulator)
- ต้อง test บน **browser version เก่า** (IE11, Safari 14, etc.)
- ต้อง test บน **OS ที่ไม่มี** (Windows จาก Mac, Android จริง)
- มี bug ที่เกิดเฉพาะ device/browser บางตัว

### เมื่อไหร่ Playwright เพียงพอ (ไม่ต้อง BrowserStack)

- Test ทั่วไป --- layout, interactions, forms
- Test บน modern browsers (Chrome, Firefox, Safari, Edge)
- Test responsive design ด้วย viewport emulation
- Sprint testing ปกติ

---

## Browser Support Matrix

| Browser          | เวอร์ชัน          | Priority | ทดสอบด้วย                |
| ---------------- | ----------------- | :------: | ------------------------ |
| Chrome           | Latest 2 versions |    P0    | Playwright               |
| Firefox          | Latest 2 versions |    P0    | Playwright               |
| Safari           | Latest 2 versions |    P0    | Playwright (WebKit)      |
| Edge             | Latest 2 versions |    P1    | Playwright               |
| Safari iOS       | Latest 2 versions |    P1    | Playwright (iPhone/iPad) |
| Chrome Android   | Latest 2 versions |    P1    | BrowserStack             |
| Samsung Internet | Latest            |    P2    | BrowserStack             |

---

## Workflow สรุป

```
ระหว่าง Develop
  |
  +-- Responsively (ดู responsive ขณะ code)
  |
ทุก PR
  |
  +-- Playwright 6 projects (CI/CD อัตโนมัติ)
  |
ก่อน Release
  |
  +-- BrowserStack (real device testing --- ถ้าจำเป็น)
```

---

> **SYNERRY AI Team** | QA-QC Master v1.0 | April 2026
