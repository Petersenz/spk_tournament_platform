# Git Hooks — Husky

> 4 hooks ทำงานอัตโนมัติตอน commit/push
> ป้องกัน bad code, secrets, และ broken commits เข้า repo

---

## Hook Overview

```
git commit
     │
     ├──▶ pre-commit    → lint-staged + secret scan + console.log check
     │
     ├──▶ commit-msg    → commitlint (conventional commits)
     │
     └──▶ post-commit   → Sync Guardian reminder
            │
git push
     │
     └──▶ pre-push      → security scan + dep audit + quality gate
```

---

## Husky Setup

Husky จัดการ Git hooks ผ่าน `.husky/` folder:

```
.husky/
├── _              # Husky internal
├── pre-commit     # ก่อน commit
├── commit-msg     # ตรวจ commit message
├── post-commit    # หลัง commit
└── pre-push       # ก่อน push
```

ติดตั้งแล้วผ่าน:

```json
// package.json
"prepare": "husky"
```

```json
// devDependencies
"husky": "^9.1.7"
```

---

## Hook 1: pre-commit

**ไฟล์**: `.husky/pre-commit`

### ทำ 3 ด่าน:

| ด่าน | ทำอะไร                                              |    ล้ม →     |
| :--: | --------------------------------------------------- | :----------: |
|  1   | **lint-staged** — ESLint + Prettier เฉพาะไฟล์ที่แก้ | Block commit |
|  2   | **Secret scan** — หา API keys ใน staged files       | Block commit |
|  3   | **console.log check** — เตือนถ้ามี console.log      | Warning only |

### lint-staged Configuration

```json
// package.json
"lint-staged": {
  "*.{js,ts,jsx,tsx}": [
    "eslint --fix",
    "prettier --write"
  ],
  "*.{json,md,yml,yaml,css,html}": [
    "prettier --write"
  ]
}
```

| ไฟล์                                             | Action                       |
| ------------------------------------------------ | ---------------------------- |
| `.js`, `.ts`, `.jsx`, `.tsx`                     | ESLint fix + Prettier format |
| `.json`, `.md`, `.yml`, `.yaml`, `.css`, `.html` | Prettier format only         |

**devDependency**: `lint-staged@^16.4.0`

### Secret Scan

ตรวจหา patterns เช่น:

- `sk-or-` (OpenRouter)
- `sk-ant-` (Anthropic)
- `sk-` (OpenAI)
- `ghp_` (GitHub PAT)
- `glpat-` (GitLab PAT)

ถ้าเจอ → **block commit ทันที**

### console.log Check

- ค้นหา `console.log`, `console.debug`, `console.info` ใน staged `.js/.ts` files
- แสดง **warning** (ไม่ block)
- เพิ่ม `// ok` comment ข้างหลังเพื่อ skip

---

## Hook 2: commit-msg

**ไฟล์**: `.husky/commit-msg`

```bash
npx --no -- commitlint --edit "$1"
```

### commitlint Configuration

**ไฟล์**: `commitlint.config.js`

```javascript
export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat",
        "fix",
        "docs",
        "style",
        "refactor",
        "perf",
        "test",
        "build",
        "ci",
        "chore",
        "revert",
      ],
    ],
    "subject-max-length": [2, "always", 100],
    "body-max-line-length": [1, "always", 200],
  },
};
```

### Commit Message Format

```
<type>: <subject>

[optional body]

[optional footer]
```

### Types ที่ใช้ได้

| Type       | ใช้เมื่อ                               | ตัวอย่าง                       |
| ---------- | -------------------------------------- | ------------------------------ |
| `feat`     | เพิ่ม feature ใหม่                     | `feat: add scan history page`  |
| `fix`      | แก้ bug                                | `fix: resolve login timeout`   |
| `docs`     | แก้เอกสาร                              | `docs: update API guide`       |
| `style`    | format code (ไม่แก้ logic)             | `style: fix indentation`       |
| `refactor` | restructure code (ไม่เปลี่ยน behavior) | `refactor: extract scan utils` |
| `perf`     | ปรับ performance                       | `perf: optimize image loading` |
| `test`     | เพิ่ม/แก้ tests                        | `test: add auth unit tests`    |
| `build`    | แก้ build system                       | `build: update webpack config` |
| `ci`       | แก้ CI/CD                              | `ci: add deploy stage`         |
| `chore`    | งานเบ็ดเตล็ด                           | `chore: update dependencies`   |
| `revert`   | ย้อน commit                            | `revert: undo feature X`       |

### Rules

| Rule                   |     ค่า     | ความหมาย                         |
| ---------------------- | :---------: | -------------------------------- |
| `type-enum`            |  Error (2)  | ต้องใช้ type ที่กำหนด            |
| `subject-max-length`   |  Error (2)  | หัวข้อไม่เกิน 100 ตัวอักษร       |
| `body-max-line-length` | Warning (1) | body ไม่เกิน 200 ตัวอักษร/บรรทัด |

**devDependencies**:

- `@commitlint/cli@^20.5.0`
- `@commitlint/config-conventional@^20.5.0`

---

## Hook 3: post-commit

**ไฟล์**: `.husky/post-commit`

### ทำอะไร?

**Sync Guardian Reminder** — เตือนให้ update Memory Bank:

1. ตรวจว่า `activeContext.md` ถูกแก้ใน commit นี้ไหม
2. ถ้าไม่ได้แก้ + เก่ากว่า 24 ชม. → แสดง warning
3. นับ commits ตั้งแต่ last memory update → ถ้า > 3 → แสดง warning

> Hook นี้ไม่ block commit — แค่เตือน

---

## Hook 4: pre-push

**ไฟล์**: `.husky/pre-push`

### ทำ 3 ด่าน:

| ด่าน | ทำอะไร               |    ล้ม →     |
| :--: | -------------------- | :----------: |
|  1   | **Security scan**    |  Block push  |
|  2   | **Dependency audit** | Warning only |
|  3   | **Quality gate**     | Warning only |

### รายละเอียด

| ด่าน | Script                        | ตรวจอะไร                                       |
| :--: | ----------------------------- | ---------------------------------------------- |
|  1   | `scripts/security-scan.sh`    | OWASP, secret leak, dependency vulnerabilities |
|  2   | `scripts/dependency-audit.sh` | Unused deps, outdated, license issues          |
|  3   | `scripts/quality-gate.sh`     | 7 quality dimensions, score                    |

> Security scan **block push** ถ้า fail
> Quality gate เป็น **advisory** — แสดงผลแต่ไม่ block

---

## Troubleshooting

| ปัญหา                      | สาเหตุ                  | วิธีแก้                      |
| -------------------------- | ----------------------- | ---------------------------- |
| Hook ไม่ทำงาน              | Husky ยังไม่ได้ install | `npm run prepare`            |
| lint-staged ช้า            | ไฟล์เยอะ                | ปกติ — รันเฉพาะ staged files |
| commitlint reject          | Message ไม่ตาม format   | ใช้ format: `type: subject`  |
| pre-push ช้า               | Quality gate + security | ใช้เวลา ~30-60 วินาที        |
| Secret scan false positive | Pattern match ใน docs   | เพิ่ม file ใน exclude list   |

### Bypass Hook (Emergency Only)

```bash
# ข้ามทุก hooks (ใช้เฉพาะฉุกเฉิน!)
git commit --no-verify -m "emergency fix"
git push --no-verify
```

> **ห้ามใช้เป็นปกติ** — hooks มีไว้ป้องกันปัญหา

---

## Checklist

- [ ] `npm run prepare` — install Husky hooks
- [ ] ทดสอบ: commit ที่ไม่ผ่าน lint → ถูก block
- [ ] ทดสอบ: commit message ผิด format → ถูก reject
- [ ] ทดสอบ: push → security scan + quality gate ทำงาน
- [ ] ทีมทุกคนรัน `npm install` (จะ install hooks อัตโนมัติ)
