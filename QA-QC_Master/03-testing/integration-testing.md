# Integration Testing --- Supertest + Testcontainers

> **SYNERRY AI Team --- Integration Testing Guide 2026**
>
> ทดสอบ API endpoints + database interactions ด้วย real dependencies
> อัปเดตล่าสุด: 2026-04-06

---

## เมื่อไหร่ควรใช้ Integration Test

| Scenario                        | Unit Test | Integration Test |
| ------------------------------- | :-------: | :--------------: |
| ทดสอบ function เดียว            |    Yes    |       ---        |
| ทดสอบ API route + response      |    ---    |       Yes        |
| ทดสอบ database query            |    ---    |       Yes        |
| ทดสอบ service + database ต่อกัน |    ---    |       Yes        |
| ทดสอบ middleware chain          |    ---    |       Yes        |
| ทดสอบ cache (Redis) + DB        |    ---    |       Yes        |

**หลักง่ายๆ:** ถ้าต้องการทดสอบว่า "หลายส่วนทำงานร่วมกันถูกต้อง" --- ใช้ Integration Test

---

## เครื่องมือ

### 1. Supertest --- API Endpoint Testing

ทดสอบ HTTP endpoints โดยไม่ต้องเปิด server จริง

```bash
npm i -D supertest @types/supertest
```

### 2. Testcontainers --- Real DB/Redis ใน Docker

สร้าง container จริง (PostgreSQL, Redis, etc.) สำหรับ test แล้วลบทิ้งอัตโนมัติ

```bash
npm i -D testcontainers
```

**ต้องมี Docker Desktop รันอยู่** ก่อนใช้ Testcontainers

---

## Supertest --- ตัวอย่าง API Testing

### Setup --- แยก App ออกจาก Server

```typescript
// src/app.ts --- export app โดยไม่ listen
import express from "express";
import { userRouter } from "./routes/user";

const app = express();
app.use(express.json());
app.use("/api/users", userRouter);

export { app };
```

```typescript
// src/server.ts --- listen ที่นี่
import { app } from "./app";
app.listen(3030, () => console.log("Server running on 3030"));
```

### ทดสอบ CRUD Endpoints

```typescript
// src/routes/user.integration.test.ts
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { app } from "../app";
import { db } from "../database";

describe("User API", () => {
  beforeAll(async () => {
    await db.migrate.latest();
    await db.seed.run();
  });

  afterAll(async () => {
    await db.destroy();
  });

  describe("GET /api/users", () => {
    it("ดึง user ทั้งหมดสำเร็จ", async () => {
      const res = await request(app).get("/api/users").expect(200);

      expect(res.body).toBeInstanceOf(Array);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe("POST /api/users", () => {
    it("สร้าง user ใหม่สำเร็จ", async () => {
      const newUser = { name: "Test", email: "test@example.com" };

      const res = await request(app)
        .post("/api/users")
        .send(newUser)
        .expect(201);

      expect(res.body).toMatchObject(newUser);
      expect(res.body.id).toBeDefined();
    });

    it("return 400 เมื่อ email ซ้ำ", async () => {
      const user = { name: "Dup", email: "test@example.com" };

      await request(app).post("/api/users").send(user).expect(400);
    });

    it("return 400 เมื่อไม่ส่ง required fields", async () => {
      await request(app).post("/api/users").send({}).expect(400);
    });
  });

  describe("GET /api/users/:id", () => {
    it("return 404 เมื่อไม่พบ user", async () => {
      await request(app).get("/api/users/99999").expect(404);
    });
  });
});
```

---

## Testcontainers --- ทดสอบกับ Database จริง

### ตัวอย่าง: PostgreSQL Container

```typescript
// src/test/db-container.ts
import { PostgreSqlContainer } from "testcontainers";

export async function setupTestDB() {
  const container = await new PostgreSqlContainer("postgres:16")
    .withDatabase("testdb")
    .withUsername("test")
    .withPassword("test")
    .start();

  const connectionString = container.getConnectionUri();

  return { container, connectionString };
}
```

### ใช้ใน Test

```typescript
// src/services/user.integration.test.ts
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { setupTestDB } from "../test/db-container";
import { UserService } from "./user-service";
import type { StartedPostgreSqlContainer } from "testcontainers";

let container: StartedPostgreSqlContainer;
let userService: UserService;

beforeAll(async () => {
  const testDB = await setupTestDB();
  container = testDB.container;
  userService = new UserService(testDB.connectionString);
  await userService.migrate();
}, 60000); // timeout 60 วินาที (Docker pull อาจช้า)

afterAll(async () => {
  await container.stop();
});

describe("UserService + Real PostgreSQL", () => {
  it("สร้างและดึง user จาก DB จริงได้", async () => {
    const created = await userService.create({
      name: "Real DB Test",
      email: "real@test.com",
    });

    const found = await userService.findById(created.id);
    expect(found?.name).toBe("Real DB Test");
  });

  it("transaction rollback ทำงานถูกต้อง", async () => {
    await expect(userService.createWithInvalidData()).rejects.toThrow();

    // ต้องไม่มี data ค้างจาก failed transaction
    const count = await userService.count();
    expect(count).toBe(1); // มีแค่ record จาก test ก่อนหน้า
  });
});
```

---

## npm Scripts

```json
{
  "scripts": {
    "test:integration": "vitest run --config vitest.integration.config.ts"
  }
}
```

### Config แยกสำหรับ Integration Tests

```typescript
// vitest.integration.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.integration.test.{ts,tsx}"],
    testTimeout: 60000, // 60 วินาที (Docker containers)
    hookTimeout: 120000, // 2 นาที (container startup)
    pool: "forks",
    poolOptions: {
      forks: { maxForks: 1 }, // รัน sequential (share DB)
    },
  },
});
```

---

## Prompt Template --- Claude CLI สร้าง Integration Tests

```
สร้าง integration tests สำหรับ API route [ชื่อ route]

ข้อกำหนด:
1. ใช้ Supertest + Vitest
2. ทดสอบ: success cases, validation errors, not found, auth errors
3. ตรวจ HTTP status codes + response body
4. Setup/teardown database ก่อน/หลัง test
5. ไฟล์ชื่อ [route].integration.test.ts

ครอบคลุม:
- GET (list + single + not found)
- POST (success + validation error + duplicate)
- PUT/PATCH (success + not found + invalid data)
- DELETE (success + not found)
```

---

## Checklist

- [ ] แยก `app.ts` ออกจาก `server.ts` (Supertest ต้องการ app instance)
- [ ] Docker Desktop รันอยู่ (สำหรับ Testcontainers)
- [ ] Test timeout ตั้งเพียงพอ (>= 30 วินาที)
- [ ] Database cleanup หลังแต่ละ test suite
- [ ] ไม่ hardcode port ใน test

---

> **SYNERRY AI Team** | QA-QC Master v1.0 | April 2026
