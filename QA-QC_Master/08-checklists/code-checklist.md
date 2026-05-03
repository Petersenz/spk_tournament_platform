# Code Checklist — Development Phase

> จาก Enterprise 360 Phase 2 (Development) — 21 core items
>
> - 11 Anti-Bullshit Rules (zero-tolerance violations)

---

## 21 Code Quality Items

### Linting & Formatting

| ID  | Item                            | Tool       | Severity | Effort |
| :-: | ------------------------------- | ---------- | :------: | :----: |
| C01 | ESLint ไม่มี error              | ESLint     | Critical |  Low   |
| C02 | Prettier format ถูกต้อง         | Prettier   |   High   |  Low   |
| C03 | TypeScript strict mode          | tsc        |   High   | Medium |
| C04 | No `any` types (ยกเว้นมีเหตุผล) | TypeScript |  Medium  | Medium |

### Code Quality

| ID  | Item                               | Tool          | Severity | Effort |
| :-: | ---------------------------------- | ------------- | :------: | :----: |
| C05 | ไม่มี console.log (ยกเว้น `// ok`) | Pre-commit    |  Medium  |  Low   |
| C06 | ไม่มี TODO/FIXME ค้างเกิน 1 sprint | Manual review |   Low    |  Low   |
| C07 | Function ไม่เกิน 50 บรรทัด         | ESLint/Manual |  Medium  | Medium |
| C08 | File ไม่เกิน 300 บรรทัด            | Manual        |  Medium  | Medium |
| C09 | Component ไม่เกิน 200 บรรทัด       | Manual        |  Medium  | Medium |
| C10 | Code duplication < 5%              | jscpd         |  Medium  |  High  |

### Dependencies

| ID  | Item                                   | Tool         | Severity | Effort |
| :-: | -------------------------------------- | ------------ | :------: | :----: |
| C11 | ไม่มี unused dependencies              | depcheck     |  Medium  |  Low   |
| C12 | ไม่มี circular imports                 | madge        |   High   | Medium |
| C13 | npm audit ไม่มี high/critical          | npm audit    | Critical | Medium |
| C14 | Dependencies ไม่ outdated เกิน 2 major | npm outdated |   Low    | Medium |

### Testing

| ID  | Item                                     | Tool                | Severity | Effort |
| :-: | ---------------------------------------- | ------------------- | :------: | :----: |
| C15 | Unit tests มี (อย่างน้อย critical paths) | Vitest              |   High   |  High  |
| C16 | E2E tests มี (อย่างน้อย happy paths)     | Playwright          |   High   |  High  |
| C17 | Test coverage > 60%                      | @vitest/coverage-v8 |  Medium  |  High  |

### Architecture

| ID  | Item                               | Tool         | Severity | Effort |
| :-: | ---------------------------------- | ------------ | :------: | :----: |
| C18 | Folder structure ตาม convention    | Manual       |  Medium  | Medium |
| C19 | API error handling ครบทุก endpoint | Manual       | Critical | Medium |
| C20 | Environment variables ไม่ hardcode | check-env.sh | Critical |  Low   |
| C21 | Git hooks ทำงานถูกต้อง             | Husky        |   High   |  Low   |

---

## Severity Summary

| Severity     | จำนวน | Items                        |
| ------------ | :---: | ---------------------------- |
| **Critical** |   4   | C01, C13, C19, C20           |
| **High**     |   6   | C02, C03, C12, C15, C16, C21 |
| **Medium**   |   9   | C04-C10, C17, C18            |
| **Low**      |   2   | C06, C14                     |

---

## รัน Automated Checks

```bash
# ตรวจ C01, C02: Lint + Format
npm run lint

# ตรวจ C05: console.log (ผ่าน pre-commit hook)
git commit  # จะตรวจอัตโนมัติ

# ตรวจ C10: Code duplication
npx jscpd src/

# ตรวจ C11: Unused dependencies
npx depcheck

# ตรวจ C12: Circular imports
npx madge --circular src/

# ตรวจ C13: Vulnerability audit
npm audit --audit-level=high

# ตรวจ C15, C17: Unit tests + coverage
npm test -- --coverage

# ตรวจ C16: E2E tests
npm run test:e2e

# ตรวจ C20: Secret leak
bash scripts/check-env.sh

# ตรวจทั้งหมด (7 categories)
npm run quality:code
```

---

## Anti-Bullshit Rules (11 Zero-Tolerance Violations)

> สิ่งที่ห้ามทำเด็ดขาด — พบ 1 ข้อ = ต้องแก้ทันที

|  #   | Rule                                                   | ทำไมสำคัญ                       | ตรวจด้วย           |
| :--: | ------------------------------------------------------ | ------------------------------- | ------------------ |
| AB01 | **ห้าม commit secrets** (API keys, passwords)          | Data breach, financial loss     | pre-commit hook    |
| AB02 | **ห้าม disable ESLint** (`// eslint-disable` ทั้งไฟล์) | ซ่อนปัญหา                       | Code review        |
| AB03 | **ห้าม `any` type ไม่มีเหตุผล**                        | Type safety หายหมด              | TypeScript         |
| AB04 | **ห้าม hardcode URLs/configs**                         | Deploy แตกเมื่อเปลี่ยน env      | check-env.sh       |
| AB05 | **ห้าม skip tests** ใน CI/CD                           | ไม่รู้ว่า code พังไหม           | .gitlab-ci.yml     |
| AB06 | **ห้าม force push to main**                            | ลบ history, ทำลาย collaboration | Git config         |
| AB07 | **ห้าม commit node_modules**                           | Repo ขนาดใหญ่เกินไป             | .gitignore         |
| AB08 | **ห้าม store user data ใน localStorage** (sensitive)   | XSS → data leak                 | Code review        |
| AB09 | **ห้าม eval() / innerHTML** จาก user input             | XSS vulnerability               | ESLint             |
| AB10 | **ห้าม deploy โดยไม่ตรวจ build**                       | Production crash                | CI/CD pipeline     |
| AB11 | **ห้ามลบ Git hooks**                                   | Bypass quality checks           | post-checkout hook |

---

## Code Quality Dimensions (7 มิติ)

`npm run quality:code` ตรวจ 7 มิติ:

| มิติ            | ตรวจอะไร               | เครื่องมือ           |      Target       |
| --------------- | ---------------------- | -------------------- | :---------------: |
| 1. Linting      | Code rules compliance  | ESLint               |     0 errors      |
| 2. Formatting   | Code style consistency | Prettier             |  100% formatted   |
| 3. Duplication  | Copy-paste code        | jscpd                |       < 5%        |
| 4. Complexity   | Cyclomatic complexity  | ESLint               | < 15 per function |
| 5. Dependencies | Unused/circular/audit  | depcheck, madge, npm |     0 issues      |
| 6. Type Safety  | TypeScript strictness  | tsc                  |     0 errors      |
| 7. Architecture | File size, conventions | code-conform.sh      |   0 violations    |

---

## Checklist Usage

### ระหว่าง Development

| เมื่อไหร่  | ตรวจอะไร                             |
| ---------- | ------------------------------------ |
| ทุก commit | C01, C02, C05, C20 (pre-commit hook) |
| ทุก push   | C13, quality gate (pre-push hook)    |
| ทุก MR     | C01-C21 ทั้งหมด (CI/CD + review)     |

### ก่อน Release

```bash
# รัน full check
npm run quality:all

# ตรวจ Anti-Bullshit Rules
bash scripts/security-scan.sh
bash scripts/check-env.sh
```

---

## Item Status Template

```markdown
| ID  | Item               | Status | หมายเหตุ |
| :-: | ------------------ | :----: | -------- |
| C01 | ESLint no errors   |   ✅   |          |
| C02 | Prettier formatted |   ✅   |          |
| C03 | TypeScript strict  |   ✅   |          |
| ... | ...                | ⬜/✅  |          |
```

ใช้ template นี้ใน MR description หรือ release checklist
