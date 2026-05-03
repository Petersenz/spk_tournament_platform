# Unit Testing --- Vitest

> **SYNERRY AI Team --- Unit Testing Guide 2026**
>
> Vitest: Fast, Vite-native unit testing framework
> อัปเดตล่าสุด: 2026-04-06

---

## ทำไมเลือก Vitest (ไม่ใช่ Jest)

| เกณฑ์             |            Vitest            |            Jest             |
| ----------------- | :--------------------------: | :-------------------------: |
| ความเร็ว          |   เร็วกว่า 2-5x (Vite HMR)   | ช้ากว่า (transform ทุกไฟล์) |
| Vite Integration  | Native (ใช้ config เดียวกัน) |       ต้อง config แยก       |
| ESM Support       |         First-class          |      ต้อง config เพิ่ม      |
| TypeScript        |  Built-in (ไม่ต้อง ts-jest)  |  ต้อง ts-jest / @swc/jest   |
| Watch Mode        |      Instant (Vite HMR)      |           ช้ากว่า           |
| API Compatibility |     Jest-compatible API      |             ---             |
| Community (2026)  |         กำลังโต เร็ว         |        ใหญ่แต่ stale        |

**สรุป:** Vitest เร็วกว่า, config น้อยกว่า, เข้ากับ Vite ecosystem โดยตรง

---

## การติดตั้ง

```bash
# ติดตั้ง Vitest + coverage
npm i -D vitest @vitest/coverage-v8

# (optional) UI สำหรับดู test results ใน browser
npm i -D @vitest/ui
```

---

## Configuration --- vitest.config.ts

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    // === Environment ===
    environment: "jsdom", // ใช้ 'node' สำหรับ backend
    globals: true, // ใช้ describe, it, expect โดยไม่ต้อง import

    // === Files ===
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["node_modules", "dist", "e2e"],

    // === Coverage ===
    coverage: {
      provider: "v8",
      reporter: ["text", "text-summary", "html", "lcov"],
      reportsDirectory: "./coverage",

      // === Coverage Thresholds (80% ทุกตัว) ===
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },

      // ไม่นับ coverage จากไฟล์เหล่านี้
      exclude: [
        "node_modules/",
        "src/**/*.d.ts",
        "src/**/*.stories.{ts,tsx}",
        "src/**/index.ts", // barrel exports
        "src/**/*.config.{ts,js}",
        "src/test/**", // test utilities
      ],
    },

    // === Setup ===
    setupFiles: ["./src/test/setup.ts"],

    // === Performance ===
    pool: "forks", // ใช้ forks สำหรับ isolation ที่ดีกว่า
    poolOptions: {
      forks: {
        maxForks: 4, // ปรับตาม CPU cores
      },
    },
  },

  // === Path Aliases ===
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

---

## npm Scripts

เพิ่มใน `package.json`:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui",
    "test:debug": "vitest --inspect-brk --pool threads --poolOptions.threads.singleThread"
  }
}
```

| Script                  | ใช้เมื่อ                                  |
| ----------------------- | ----------------------------------------- |
| `npm test`              | รัน tests ครั้งเดียว (CI/CD)              |
| `npm run test:watch`    | ระหว่าง dev --- รัน auto เมื่อไฟล์เปลี่ยน |
| `npm run test:coverage` | ดู coverage report --- ต้อง >= 80%        |
| `npm run test:ui`       | เปิด UI ใน browser ดู test results        |

---

## Test Setup File

```typescript
// src/test/setup.ts
import "@testing-library/jest-dom/vitest";

// Global test utilities
beforeAll(() => {
  // setup ก่อนรัน test ทั้งหมด
});

afterEach(() => {
  // cleanup หลังแต่ละ test
  vi.restoreAllMocks();
});
```

---

## ตัวอย่าง Test Patterns

### 1. Function Test

```typescript
// src/utils/format.test.ts
import { describe, it, expect } from "vitest";
import { formatPrice, formatDate } from "./format";

describe("formatPrice", () => {
  it("แปลงตัวเลขเป็นรูปแบบเงินบาท", () => {
    expect(formatPrice(1000)).toBe("1,000.00");
    expect(formatPrice(0)).toBe("0.00");
  });

  it("จัดการ edge cases", () => {
    expect(formatPrice(-100)).toBe("-100.00");
    expect(formatPrice(NaN)).toBe("0.00");
  });
});
```

### 2. Component Test (React)

```typescript
// src/components/Button.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('แสดงข้อความที่ส่งเข้ามา', () => {
    render(<Button>คลิก</Button>);
    expect(screen.getByText('คลิก')).toBeInTheDocument();
  });

  it('เรียก onClick เมื่อคลิก', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>คลิก</Button>);
    fireEvent.click(screen.getByText('คลิก'));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('ไม่ทำงานเมื่อ disabled', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick} disabled>คลิก</Button>);
    fireEvent.click(screen.getByText('คลิก'));
    expect(handleClick).not.toHaveBeenCalled();
  });
});
```

### 3. API Service Test (with Mocking)

```typescript
// src/services/user.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchUser } from "./user";

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("fetchUser", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("ดึงข้อมูล user สำเร็จ", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 1, name: "Test User" }),
    });

    const user = await fetchUser(1);
    expect(user).toEqual({ id: 1, name: "Test User" });
    expect(mockFetch).toHaveBeenCalledWith("/api/users/1");
  });

  it("throw error เมื่อ API fail", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 404 });
    await expect(fetchUser(999)).rejects.toThrow("User not found");
  });
});
```

---

## Qodo --- AI Auto Test Generation

> Qodo (เดิมชื่อ CodiumAI) สร้าง test อัตโนมัติจาก code

### การใช้งานกับ Vitest

1. ติดตั้ง Qodo extension ใน Cursor/VS Code
2. เปิดไฟล์ที่ต้องการสร้าง test
3. คลิก **"Generate Tests"** ที่มุมบนขวา
4. Qodo จะวิเคราะห์ code แล้วสร้าง test cases ให้

### สิ่งที่ Qodo สร้างให้

- Happy path tests
- Edge cases (null, undefined, empty)
- Error handling tests
- Boundary value tests

### ข้อจำกัด

- ต้อง review test ที่ Qodo สร้าง --- อย่า accept ทั้งหมดโดยไม่อ่าน
- บางครั้ง assertion อาจ fragile (ขึ้นกับ implementation detail)
- **แผนแนะนำ:** Qodo Teams $30/mo

---

## Prompt Template --- Claude CLI สร้าง Unit Tests

ใช้ prompt นี้กับ Claude Code CLI เพื่อสร้าง unit tests:

```
สร้าง unit tests ด้วย Vitest สำหรับไฟล์ [ชื่อไฟล์]

ข้อกำหนด:
1. ใช้ describe/it/expect จาก Vitest
2. ครอบคลุม: happy path, edge cases, error handling
3. Mock external dependencies ด้วย vi.fn() / vi.mock()
4. ตั้งชื่อ test เป็นภาษาไทยที่อธิบายพฤติกรรม
5. ไฟล์ test อยู่ข้างๆ ไฟล์จริง ชื่อ [filename].test.ts
6. เป้าหมาย coverage >= 80%

อย่าทำ:
- อย่า test implementation details
- อย่า test third-party libraries
- อย่าเขียน test ที่ fragile (พังเมื่อ refactor)
```

---

## Checklist ก่อนส่ง PR

- [ ] รัน `npm test` ผ่านทั้งหมด (0 failures)
- [ ] รัน `npm run test:coverage` --- ทุกตัว >= 80%
- [ ] Test ใหม่ครอบคลุม code ที่เพิ่ม/แก้ไข
- [ ] ไม่มี `.skip` หรือ `.todo` ที่ลืมเอาออก
- [ ] Mock cleanup ถูกต้อง (ไม่ leak ระหว่าง tests)
- [ ] Test names อธิบายพฤติกรรมชัดเจน

---

## อ้างอิง

- Vitest Docs: https://vitest.dev/
- Testing Library: https://testing-library.com/
- Qodo: https://www.qodo.ai/

---

> **SYNERRY AI Team** | QA-QC Master v1.0 | April 2026
