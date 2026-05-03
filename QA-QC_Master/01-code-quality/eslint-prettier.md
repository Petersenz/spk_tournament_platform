# ESLint + Prettier — Linting & Formatting

> ESLint จับ bug + enforce code style | Prettier จัด format อัตโนมัติ
> ใช้คู่กันเสมอ — ESLint ดูลอจิก, Prettier ดูความสวยงาม

---

## ข้อมูลเบื้องต้น

| รายการ            | รายละเอียด                                                        |
| ----------------- | ----------------------------------------------------------------- |
| **ประเภท**        | Linter + Formatter                                                |
| **ราคา**          | Free (open-source)                                                |
| **ทำงานที่**      | CLI + IDE extension                                               |
| **ใช้ตอนไหน**     | ทุก commit (อัตโนมัติผ่าน pre-commit hook)                        |
| **ภาษาที่รองรับ** | JavaScript, TypeScript, JSX, TSX, JSON, CSS, HTML, YAML, Markdown |

---

## สิ่งที่ติดตั้งไว้แล้วใน project

### Dependencies (package.json)

```json
{
  "devDependencies": {
    "eslint": "^10.0.3",
    "eslint-config-next": "16.1.6",
    "eslint-config-prettier": "^10.1.8",
    "eslint-plugin-sonarjs": "^4.0.2",
    "prettier": "^3.8.1",
    "husky": "^9.1.7",
    "lint-staged": "^16.4.0"
  }
}
```

### ESLint Config — `eslint.config.mjs`

```javascript
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import sonarjs from "eslint-plugin-sonarjs";
import prettierConfig from "eslint-config-prettier";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  sonarjs.configs.recommended, // SonarJS plugin — จับ code smells
  prettierConfig, // ปิด rules ที่ชนกับ Prettier
  globalIgnores([".next/**", "out/**", "build/**", "node_modules/**"]),
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          varsIgnorePattern: "^_",
          argsIgnorePattern: "^_",
        },
      ],
      complexity: ["warn", 10],
      "no-console": "warn",
      // SonarJS rules — downgrade เป็น warn สำหรับ migrated code
      "sonarjs/cognitive-complexity": "warn",
      "sonarjs/no-nested-conditional": "warn",
      "sonarjs/no-nested-functions": "warn",
    },
  },
]);

export default eslintConfig;
```

**สิ่งที่ config นี้ทำ:**

| Layer                         | หน้าที่                                                        |
| ----------------------------- | -------------------------------------------------------------- |
| `nextVitals`                  | Core Web Vitals rules สำหรับ Next.js                           |
| `nextTs`                      | TypeScript-specific rules สำหรับ Next.js                       |
| `sonarjs.configs.recommended` | จับ code smells, cognitive complexity, duplicates              |
| `prettierConfig`              | ปิด ESLint rules ที่ชนกับ Prettier                             |
| Custom rules                  | ตั้ง complexity limit, warn console.log, ปรับ SonarJS severity |

### Prettier Config — `.prettierrc`

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

### lint-staged Config (ใน package.json)

```json
{
  "lint-staged": {
    "*.{js,ts,jsx,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md,yml,yaml,css,html}": ["prettier --write"]
  }
}
```

ทำงานอัตโนมัติผ่าน Husky pre-commit hook — ตรวจเฉพาะไฟล์ที่แก้

---

## npm Scripts

```bash
# ตรวจ lint ทั้ง project (ESLint + Prettier check)
npm run lint

# Auto-fix ทั้ง project
npm run lint:fix

# Format ด้วย Prettier อย่างเดียว
npm run format
```

**รายละเอียด scripts:**

| Script             | คำสั่งจริง                             | ใช้ตอนไหน               |
| ------------------ | -------------------------------------- | ----------------------- |
| `npm run lint`     | `eslint . && prettier --check .`       | ตรวจก่อน commit / ใน CI |
| `npm run lint:fix` | `eslint --fix . && prettier --write .` | แก้ทั้งหมดในที          |
| `npm run format`   | `prettier --write .`                   | จัด format อย่างเดียว   |

---

## SonarJS Plugin — Code Smells Detection

ESLint config ของ project นี้รวม `eslint-plugin-sonarjs` ที่จับปัญหาเหล่านี้:

| Rule                          | ตรวจอะไร                        | Severity ใน project |
| ----------------------------- | ------------------------------- | ------------------- |
| `cognitive-complexity`        | Function ซับซ้อนเกินไป          | warn                |
| `no-nested-conditional`       | if/else ซ้อนลึกเกินไป           | warn                |
| `no-nested-functions`         | Function ซ้อนใน function        | warn                |
| `no-nested-template-literals` | Template literal ซ้อนกัน        | warn                |
| `pseudo-random`               | ใช้ Math.random() ที่ไม่ปลอดภัย | warn                |
| `slow-regex`                  | Regex ที่อาจทำให้ช้า            | warn                |
| `todo-tag`                    | มี TODO comment ค้างอยู่        | warn                |

---

## การทำงานใน Pre-commit Hook

เมื่อ developer รัน `git commit` จะเกิดสิ่งนี้อัตโนมัติ:

```
git commit
     │
     ▼
Husky pre-commit hook (.husky/pre-commit)
     │
     ├── [1/3] lint-staged
     │        ├── ESLint --fix (เฉพาะ .js/.ts/.jsx/.tsx ที่แก้)
     │        └── Prettier --write (ทุกไฟล์ที่แก้)
     │
     ├── [2/3] Secret scan
     │        └── ตรวจ API key patterns
     │
     └── [3/3] Quick quality check
              └── ตรวจ console.log ที่หลุด
```

---

## ติดตั้งใหม่ (กรณีต้องการ setup project ใหม่)

```bash
# 1. ติดตั้ง dependencies
npm i -D eslint prettier eslint-config-prettier eslint-plugin-sonarjs

# 2. สำหรับ Next.js project
npm i -D eslint-config-next

# 3. ติดตั้ง Husky + lint-staged
npm i -D husky lint-staged
npx husky init

# 4. สร้าง config files (copy จาก project นี้)
# - eslint.config.mjs
# - .prettierrc
# - เพิ่ม lint-staged config ใน package.json
```

---

## Troubleshooting

| ปัญหา                    | วิธีแก้                                      |
| ------------------------ | -------------------------------------------- |
| ESLint ชนกับ Prettier    | ตรวจว่ามี `eslint-config-prettier` ใน config |
| Pre-commit hook ไม่ทำงาน | รัน `npx husky` แล้วตรวจ `.husky/pre-commit` |
| SonarJS rules เยอะเกินไป | Downgrade เป็น `warn` ใน rules config        |
| ESLint v10 flat config   | ใช้ `eslint.config.mjs` (ไม่ใช่ `.eslintrc`) |

---

## Claude CLI Prompt Template

```
รัน ESLint + Prettier ตรวจ code quality ของ project:
1. รัน `npm run lint` แล้วสรุปผลลัพธ์
2. ถ้ามี error — รัน `npm run lint:fix` แล้วบอกว่าแก้อะไรไป
3. ถ้ามี warning ที่ fix อัตโนมัติไม่ได้ — สรุปเป็นตารางว่าไฟล์ไหน rule อะไร
4. ตรวจว่า SonarJS rules (cognitive-complexity, no-nested-conditional) มี warning ไหม
5. สรุป: จำนวน error/warning ก่อน-หลัง fix
```
