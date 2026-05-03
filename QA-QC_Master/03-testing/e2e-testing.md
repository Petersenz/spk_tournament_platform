# E2E Testing --- Playwright

> **SYNERRY AI Team --- End-to-End Testing Guide 2026**
>
> Playwright: cross-browser E2E testing framework by Microsoft
> อัปเดตล่าสุด: 2026-04-06

---

## ทำไมเลือก Playwright (ไม่ใช่ Cypress)

| เกณฑ์                 |            Playwright            |          Cypress          |
| --------------------- | :------------------------------: | :-----------------------: |
| Multi-browser         |  Chrome, Firefox, Safari, Edge   |   Chrome-based เป็นหลัก   |
| Mobile emulation      | Built-in (iPhone, iPad, Android) |           จำกัด           |
| Parallel testing      |    Native (ไม่ต้อง paid plan)    | ต้อง Cypress Cloud (paid) |
| Auto-wait             |   Built-in (ไม่ต้อง cy.wait())   |     ต้อง manual waits     |
| Network interception  |              Native              |          Native           |
| Multiple tabs/windows |              รองรับ              |         ไม่รองรับ         |
| iframe support        |               Full               |           จำกัด           |
| Speed                 |             เร็วกว่า             |          ช้ากว่า          |
| Backed by             |            Microsoft             |      Private company      |
| ราคา                  |           Free ทั้งหมด           |     Free + Paid Cloud     |

**สรุป:** Playwright ดีกว่าทุกด้าน --- multi-browser, เร็วกว่า, free ทั้งหมด

---

## การติดตั้ง

```bash
# ติดตั้ง Playwright
npm i -D @playwright/test

# ดาวน์โหลด browsers (Chromium, Firefox, WebKit)
npx playwright install

# (optional) ดาวน์โหลดพร้อม system dependencies
npx playwright install --with-deps
```

---

## Configuration --- playwright.config.ts

```typescript
// playwright.config.ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  outputDir: "./e2e/test-results",

  // === Timeouts ===
  timeout: 30_000, // 30 วินาทีต่อ test
  expect: { timeout: 5_000 }, // 5 วินาทีสำหรับ assertion

  // === Parallel ===
  fullyParallel: true,
  workers: process.env.CI ? 1 : undefined, // CI ใช้ 1 worker

  // === Retries ===
  retries: process.env.CI ? 2 : 0, // CI retry 2 ครั้ง

  // === Reporter ===
  reporter: [
    ["html", { outputFolder: "./e2e/report" }],
    ["list"],
    ...(process.env.CI ? [["github" as const]] : []),
  ],

  // === Web Server ===
  webServer: {
    command: "npm run dev",
    port: 3030,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },

  // === Global Setup ===
  use: {
    baseURL: "http://localhost:3030",
    trace: "on-first-retry", // เก็บ trace เมื่อ retry
    screenshot: "only-on-failure", // ถ่ายรูปเมื่อ fail
    video: "on-first-retry", // บันทึก video เมื่อ retry
  },

  // === 6 Test Projects ===
  projects: [
    // --- Desktop Browsers ---
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
    {
      name: "edge",
      use: { ...devices["Desktop Edge"], channel: "msedge" },
    },

    // --- Mobile Devices ---
    {
      name: "iphone14",
      use: { ...devices["iPhone 14"] },
    },
    {
      name: "ipad",
      use: { ...devices["iPad (gen 7)"] },
    },
  ],
});
```

### 6 Test Projects สรุป

|  #  | Project  | Browser/Device            | Viewport |
| :-: | -------- | ------------------------- | -------- |
|  1  | chromium | Chrome                    | 1280x720 |
|  2  | firefox  | Firefox                   | 1280x720 |
|  3  | webkit   | Safari                    | 1280x720 |
|  4  | edge     | Microsoft Edge            | 1280x720 |
|  5  | iphone14 | Mobile Safari (iPhone 14) | 390x844  |
|  6  | ipad     | Mobile Safari (iPad)      | 810x1080 |

---

## npm Scripts

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:headed": "playwright test --headed",
    "test:e2e:debug": "playwright test --debug",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:report": "playwright show-report e2e/report",
    "test:e2e:codegen": "playwright codegen http://localhost:3030"
  }
}
```

| Script                     | ใช้เมื่อ                                  |
| -------------------------- | ----------------------------------------- |
| `npm run test:e2e`         | รันใน CI/CD (headless)                    |
| `npm run test:e2e:headed`  | ดู browser ทำงานจริง                      |
| `npm run test:e2e:debug`   | Debug ทีละ step ด้วย Playwright Inspector |
| `npm run test:e2e:ui`      | เปิด UI mode (interactive)                |
| `npm run test:e2e:report`  | ดู HTML report หลังรัน                    |
| `npm run test:e2e:codegen` | บันทึก actions แล้วสร้าง code อัตโนมัติ   |

---

## ตัวอย่าง E2E Tests

### Login Flow

```typescript
// e2e/auth/login.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Login Flow", () => {
  test("login สำเร็จด้วย credentials ที่ถูกต้อง", async ({ page }) => {
    await page.goto("/login");

    await page.fill('[data-testid="email"]', "user@example.com");
    await page.fill('[data-testid="password"]', "password123");
    await page.click('[data-testid="login-button"]');

    // ต้อง redirect ไป dashboard
    await expect(page).toHaveURL("/dashboard");
    await expect(page.locator('[data-testid="welcome"]')).toContainText(
      "Welcome",
    );
  });

  test("แสดง error เมื่อ password ผิด", async ({ page }) => {
    await page.goto("/login");

    await page.fill('[data-testid="email"]', "user@example.com");
    await page.fill('[data-testid="password"]', "wrong");
    await page.click('[data-testid="login-button"]');

    await expect(page.locator('[data-testid="error"]')).toBeVisible();
    await expect(page).toHaveURL("/login"); // ยังอยู่หน้า login
  });
});
```

### CRUD Flow

```typescript
// e2e/projects/create-project.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Create Project", () => {
  test.beforeEach(async ({ page }) => {
    // login ก่อนทุก test
    await page.goto("/login");
    await page.fill('[data-testid="email"]', "admin@example.com");
    await page.fill('[data-testid="password"]', "admin123");
    await page.click('[data-testid="login-button"]');
    await expect(page).toHaveURL("/dashboard");
  });

  test("สร้าง project ใหม่สำเร็จ", async ({ page }) => {
    await page.goto("/projects/new");

    await page.fill('[data-testid="project-name"]', "Test Project");
    await page.fill('[data-testid="description"]', "E2E Test");
    await page.click('[data-testid="submit"]');

    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible();
    await expect(page).toHaveURL(/\/projects\/\d+/);
  });
});
```

---

## Playwright MCP สำหรับ Cursor

> Playwright MCP ให้ AI ควบคุม browser ได้โดยตรงจาก Cursor IDE

### Setup ใน `.mcp.json`

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@anthropic-ai/mcp-playwright"]
    }
  }
}
```

### ใช้งาน

- AI สามารถเปิด browser, navigate, click, fill form ได้
- เหมาะสำหรับ visual debugging --- ดูว่า page render ถูกต้องไหม
- ใช้ตอน develop/debug ไม่ใช่ตอน run test suite

---

## TestSprite MCP --- AI Test Generation

> TestSprite สร้าง E2E test อัตโนมัติจาก PRD หรือ code

### Setup ใน `.mcp.json`

```json
{
  "mcpServers": {
    "testsprite": {
      "command": "npx",
      "args": ["testsprite-mcp-server"],
      "env": {
        "TESTSPRITE_API_KEY": "<your-key>"
      }
    }
  }
}
```

### วิธีใช้

1. เขียน PRD หรือ feature description
2. TestSprite วิเคราะห์แล้วสร้าง test plan
3. Generate Playwright test code อัตโนมัติ
4. Review + ปรับแก้ก่อนใช้งานจริง

---

## Prompt Template --- Claude CLI สร้าง E2E Tests

```
สร้าง E2E tests ด้วย Playwright สำหรับ [ชื่อ feature/flow]

ข้อกำหนด:
1. ใช้ Page Object Model (POM) pattern
2. ใช้ data-testid selectors (ไม่ใช้ CSS class)
3. ทดสอบทั้ง happy path และ error cases
4. ใส่ assertions ที่ตรวจ URL, visible elements, text content
5. Setup login ใน beforeEach ถ้าต้อง auth
6. ตั้งชื่อ test เป็นภาษาไทย
7. ไฟล์อยู่ใน e2e/ folder

Flow ที่ต้องทดสอบ:
- [ระบุ step 1]
- [ระบุ step 2]
- [ระบุ step 3]
```

---

## Checklist

- [ ] ทุก test ใช้ `data-testid` (ไม่ hardcode CSS selectors)
- [ ] ไม่มี hardcoded `waitForTimeout()` --- ใช้ `waitForSelector()` แทน
- [ ] Test ทำงานได้ทั้ง headed และ headless mode
- [ ] Screenshots เก็บเฉพาะเมื่อ fail
- [ ] `baseURL` ตั้งเป็น `http://localhost:3030`
- [ ] ทดสอบผ่านทั้ง 6 projects (4 browsers + 2 mobile)

---

> **SYNERRY AI Team** | QA-QC Master v1.0 | April 2026
