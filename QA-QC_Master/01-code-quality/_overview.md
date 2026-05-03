# 01 — Code Quality: ภาพรวมเครื่องมือ

> หมวดนี้ครอบคลุมเครื่องมือตรวจสอบคุณภาพ code ทั้งหมดที่ใช้ใน ViberQC
> แต่ละเครื่องมือมีไฟล์เอกสารแยก พร้อม install steps + prompt template

---

## สารบัญไฟล์

| ไฟล์                                     | เนื้อหา                                              |
| ---------------------------------------- | ---------------------------------------------------- |
| [eslint-prettier.md](eslint-prettier.md) | ESLint + Prettier — Linting & Formatting (ใช้ทุกวัน) |
| [sonarqube.md](sonarqube.md)             | SonarQube Community — SAST + Code Smells + Tech Debt |
| [ai-code-review.md](ai-code-review.md)   | AI Code Review: CodeRabbit, Qodo, PR-Agent           |
| [code-analysis.md](code-analysis.md)     | Code Analysis CLI: depcheck, madge, jscpd            |
| [ide-extensions.md](ide-extensions.md)   | IDE Extensions สำหรับ VS Code / Cursor               |

---

## ตาราง Comparison ทุกเครื่องมือ

| เครื่องมือ       | ประเภท                    | ราคา               | ใช้ตอนไหน                     | ทำงานที่              |
| ---------------- | ------------------------- | ------------------ | ----------------------------- | --------------------- |
| **ESLint**       | Linter                    | Free               | ทุก commit (pre-commit hook)  | CLI + IDE             |
| **Prettier**     | Formatter                 | Free               | ทุก commit (pre-commit hook)  | CLI + IDE             |
| **SonarQube CE** | SAST + Code Quality       | Free (self-hosted) | สัปดาห์ละครั้ง / ก่อน release | Docker local          |
| **SonarLint**    | Real-time SAST            | Free               | ขณะเขียน code                 | IDE extension         |
| **CodeRabbit**   | AI Code Review            | $24/dev/mo         | ทุก MR/PR อัตโนมัติ           | GitLab/GitHub webhook |
| **Qodo Teams**   | AI Code Review + Test Gen | $30/user/mo        | ทุก MR/PR อัตโนมัติ           | GitLab CI/CD          |
| **PR-Agent**     | AI Code Review            | Free (open-source) | ทุก MR (CI/CD pipeline)       | GitLab CI/CD          |
| **depcheck**     | Unused Dependency Finder  | Free               | ก่อน release / รายเดือน       | CLI                   |
| **madge**        | Circular Import Finder    | Free               | ก่อน release / เมื่อ refactor | CLI                   |
| **jscpd**        | Duplicate Code Finder     | Free               | ก่อน release / รายเดือน       | CLI                   |

---

## Quality Pipeline — ลำดับการทำงาน

```
Developer เขียน code
     │
     ▼
┌─────────────────────────────────┐
│ IDE: ESLint + Prettier + SonarLint │  ← Real-time (ขณะเขียน)
└─────────────┬───────────────────┘
              │
              ▼
┌─────────────────────────────────┐
│ Pre-commit Hook: lint-staged     │  ← ทุก commit
│ + Secret scan                    │
└─────────────┬───────────────────┘
              │
              ▼
┌─────────────────────────────────┐
│ Pre-push Hook: quality-gate      │  ← ทุก push
│ + security-scan + dep-audit      │
└─────────────┬───────────────────┘
              │
              ▼
┌─────────────────────────────────┐
│ GitLab CI/CD Pipeline            │  ← ทุก push / MR
│ - ESLint + npm audit             │
│ - Quality Gate script            │
│ - SAST (GitLab built-in)         │
│ - PR-Agent AI Review (MR only)   │
└─────────────┬───────────────────┘
              │
              ▼
┌─────────────────────────────────┐
│ CodeRabbit / Qodo (ถ้าเปิดใช้)   │  ← ทุก MR อัตโนมัติ
└─────────────┬───────────────────┘
              │
              ▼
┌─────────────────────────────────┐
│ SonarQube Deep Scan              │  ← สัปดาห์ละครั้ง / ก่อน release
│ + depcheck + madge + jscpd       │
└─────────────────────────────────┘
```

---

## npm Scripts ที่เกี่ยวข้อง

```bash
npm run lint              # ESLint + Prettier check
npm run lint:fix          # Auto-fix ESLint + Prettier
npm run quality           # Quality Gate 7 หมวด
npm run quality:code      # Code quality 7 มิติ
npm run quality:deps      # Dependency audit
npm run quality:all       # รัน quality + security + deps ทั้งหมด
npm run sonar:up          # เปิด SonarQube (Docker)
npm run sonar:scan        # สแกนด้วย SonarQube
npm run sonar:down        # ปิด SonarQube
```

---

## Quick Start — เริ่มตรวจ code quality ทันที

```bash
# 1. ตรวจ lint ทั้ง project
npm run lint

# 2. Auto-fix ได้เลย
npm run lint:fix

# 3. ตรวจ code quality แบบ comprehensive
npm run quality:all

# 4. ตรวจเฉพาะ code analysis (depcheck, madge, jscpd)
npm run quality:code
```

---

## คำแนะนำ

- **ทุกวัน**: ใช้ ESLint + Prettier + SonarLint ใน IDE
- **ทุก commit**: ปล่อยให้ pre-commit hook ทำงานอัตโนมัติ
- **ทุก MR**: ใช้ PR-Agent (free) หรือ CodeRabbit (paid) review
- **สัปดาห์ละครั้ง**: รัน SonarQube + code analysis tools
- **ก่อน release**: รัน `npm run quality:all` ให้ผ่านทุกหมวด
