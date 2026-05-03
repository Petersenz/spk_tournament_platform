# Quality Gate — 5 เงื่อนไข PASS/FAIL

> ก่อน release ทุกครั้งต้องผ่าน Quality Gate
> ผ่านทั้ง 5 ข้อ = PASS / ไม่ผ่านแม้ข้อเดียว = FAIL

---

## 5 Quality Gate Conditions

### Condition 1: Critical Items = 0

| Setting      | Value                                         |
| ------------ | --------------------------------------------- |
| **ตรวจอะไร** | ไม่มี critical checklist items ที่ยังไม่ได้ทำ |
| **PASS**     | Critical items ทั้งหมดถูก check แล้ว          |
| **FAIL**     | มี critical item >=1 ที่ยังไม่ได้ทำ           |

Critical items หมายถึง items ที่มี severity = `critical` ใน:

- code-checklist.md
- pre-launch.md
- compliance.md (OWASP critical)

### Condition 2: Security Scan ภายใน 7 วัน

| Setting      | Value                                             |
| ------------ | ------------------------------------------------- |
| **ตรวจอะไร** | `npm run security` รันล่าสุดเมื่อไหร่             |
| **PASS**     | รันภายใน 7 วัน + ไม่มี critical findings          |
| **FAIL**     | ไม่เคยรัน / เก่ากว่า 7 วัน / มี critical findings |

Script: `bash scripts/security-scan.sh`

### Condition 3: Health Score >= 60

| Setting      | Value                                       |
| ------------ | ------------------------------------------- |
| **ตรวจอะไร** | Overall quality score จาก `npm run quality` |
| **PASS**     | Score >= 60/100                             |
| **FAIL**     | Score < 60/100                              |

Script: `bash scripts/quality-gate.sh`

Quality Gate มี 7 categories:

1. Code Quality (ESLint, Prettier)
2. Security (secret scan, OWASP)
3. Testing (unit test, coverage)
4. Performance (bundle size, Lighthouse)
5. Documentation (README, comments)
6. Dependencies (audit, unused)
7. Architecture (circular deps, complexity)

### Condition 4: Production Build ผ่าน

| Setting      | Value                                            |
| ------------ | ------------------------------------------------ |
| **ตรวจอะไร** | `npm run build` สำเร็จไหม                        |
| **PASS**     | Build สำเร็จ ไม่มี error                         |
| **FAIL**     | Build error (TypeScript, module not found, etc.) |

### Condition 5: ไม่มี Secrets Leak

| Setting      | Value                                   |
| ------------ | --------------------------------------- |
| **ตรวจอะไร** | ไม่มี API keys/passwords ใน code        |
| **PASS**     | ไม่เจอ secret patterns ใน tracked files |
| **FAIL**     | เจอ secret pattern แม้แต่ 1 ที่         |

Script: `bash scripts/check-env.sh`

---

## Scoring System

### คะแนนรวม

| Grade  | Score | ความหมาย              | Action                          |
| :----: | :---: | --------------------- | ------------------------------- |
| **A+** | >= 95 | พร้อม production 100% | Deploy ได้เลย                   |
| **A**  | 85-94 | ดีมาก                 | Deploy ได้ + fix minor issues   |
| **B**  | 70-84 | ดี                    | Deploy ได้ + plan improvements  |
| **C**  | 60-69 | พอใช้                 | Deploy ได้ (minimum) + fix soon |
| **D**  | 50-59 | ต้องปรับปรุง          | **ห้าม deploy** — fix ก่อน      |
| **F**  | < 50  | ไม่ผ่าน               | **ห้าม deploy** — major issues  |

### Severity Weights

| Severity     | Weight | ตัวอย่าง                               |
| ------------ | :----: | -------------------------------------- |
| **Critical** |   x3   | Security vulnerability, data loss risk |
| **High**     |   x2   | Performance issue, auth bypass         |
| **Medium**   |   x1   | Code smell, missing test               |
| **Low**      |  x0.5  | Style issue, documentation gap         |

---

## รัน Quality Gate

### Manual

```bash
# Quality Gate (7 categories)
npm run quality

# Security Scan
npm run security

# All checks
npm run quality:all
```

### Automated (CI/CD)

Quality Gate รันอัตโนมัติใน GitLab CI/CD:

```yaml
quality-gate:
  stage: test
  script:
    - bash scripts/quality-gate.sh --notify
    - bash scripts/security-scan.sh --notify
```

### Automated (Git Hook)

Pre-push hook รัน quality gate ทุกครั้งที่ push:

```bash
# .husky/pre-push
bash scripts/security-scan.sh
bash scripts/dependency-audit.sh
bash scripts/quality-gate.sh
```

---

## Quality Report

ทุกครั้งที่รัน quality gate จะสร้าง report:

**Path**: `.cursor/plans/quality-report-YYYYMMDD-HHMMSS.md`

Report มี:

- Score แต่ละ category
- Items ที่ PASS/FAIL
- Action items เรียงตาม priority
- Grade (A+ ถึง F)

---

## Gate Review Workflow

```
1. Developer เสร็จ feature
         │
         ▼
2. รัน npm run quality:all
         │
         ├── Score >= 60 + ทุก condition PASS
         │         │
         │         ▼
         │   3. สร้าง MR → PR-Agent review
         │         │
         │         ▼
         │   4. Code review ผ่าน
         │         │
         │         ▼
         │   5. Merge → Deploy
         │
         └── Score < 60 หรือ condition FAIL
                   │
                   ▼
           แก้ไข → วน loop กลับข้อ 2
```

---

## Checklist

- [ ] รัน `npm run quality` → ดู score
- [ ] รัน `npm run security` → ไม่มี critical findings
- [ ] รัน `npm run build` → build สำเร็จ
- [ ] รัน `bash scripts/check-env.sh` → ไม่มี secrets
- [ ] ทุก critical items ใน checklists ผ่านหมด
- [ ] Grade >= C (score >= 60) ก่อน deploy
