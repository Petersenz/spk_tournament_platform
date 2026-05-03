# Code Analysis CLI — depcheck, madge, jscpd

> 3 เครื่องมือ CLI ฟรี สำหรับวิเคราะห์ปัญหาเชิงโครงสร้างของ code
> ติดตั้งไว้แล้วใน devDependencies ของ project

---

## ตาราง Comparison

| เครื่องมือ   | ตรวจอะไร                    | ราคา | คำสั่ง                      |
| ------------ | --------------------------- | ---- | --------------------------- |
| **depcheck** | Unused dependencies         | Free | `npx depcheck`              |
| **madge**    | Circular imports            | Free | `npx madge --circular src/` |
| **jscpd**    | Duplicate code (copy-paste) | Free | `npx jscpd src/`            |

---

## สิ่งที่ติดตั้งไว้แล้ว

```json
{
  "devDependencies": {
    "depcheck": "^1.4.7",
    "madge": "^8.0.0",
    "jscpd": "^4.0.8"
  }
}
```

npm script รวม:

```bash
npm run quality:code    # รัน code quality scan ทั้งหมด (รวม depcheck, madge, jscpd)
```

---

## 1. depcheck — หา Unused Dependencies

### ทำอะไร

สแกนว่า package ไหนใน `dependencies` / `devDependencies` ไม่ได้ถูกใช้จริง

### วิธีใช้

```bash
# สแกนทั้ง project
npx depcheck

# สแกนพร้อม config (.depcheckrc)
npx depcheck --config .depcheckrc
```

### ตัวอย่าง Output

```
Unused dependencies
* some-package

Unused devDependencies
* another-dev-package

Missing dependencies
* missing-package
```

### Config ใน project — `.depcheckrc`

```json
{
  "ignoreMatches": [
    "depcheck",
    "madge",
    "jscpd",
    "lighthouse",
    "husky",
    "lint-staged"
  ]
}
```

และยังมี config เพิ่มเติมใน `package.json`:

```json
{
  "depcheck": {
    "ignoreMatches": [
      "depcheck",
      "madge",
      "jscpd",
      "lighthouse",
      "husky",
      "lint-staged",
      "@tailwindcss/postcss",
      "tailwindcss",
      "tw-animate-css",
      "eslint-config-next",
      "dotenv",
      "@playwright/test"
    ]
  }
}
```

**ทำไมต้อง ignore บาง package**: เครื่องมืออย่าง `husky`, `lint-staged` ถูกเรียกใช้ผ่าน git hooks ไม่ได้ import ใน code โดยตรง — depcheck จะรายงานว่า unused แต่จริงๆ ใช้อยู่

### เมื่อไหร่ควรรัน

- ก่อน release ทุกครั้ง
- หลัง refactor / ลบ feature
- รายเดือน (ทำความสะอาด dependencies)

---

## 2. madge — หา Circular Imports

### ทำอะไร

สแกนหา circular import chains เช่น A → B → C → A ซึ่งทำให้:

- Runtime error (undefined imports)
- Build ช้าลง
- Debug ยาก

### วิธีใช้

```bash
# ตรวจ circular imports ใน src/
npx madge --circular src/

# ตรวจพร้อมแสดง dependency graph
npx madge --circular --warning src/

# Export เป็นรูปภาพ (ต้องมี Graphviz)
npx madge --image graph.svg src/
```

### ตัวอย่าง Output

```
# ถ้าไม่มี circular
✔ No circular dependency found!

# ถ้ามี circular
✖ Found 2 circular dependencies:
  1) src/lib/auth.ts → src/lib/db.ts → src/lib/auth.ts
  2) src/components/A.tsx → src/components/B.tsx → src/components/A.tsx
```

### วิธีแก้ Circular Import

| Pattern            | วิธีแก้                                                   |
| ------------------ | --------------------------------------------------------- |
| A ↔ B              | แยกส่วนที่ใช้ร่วมไปไฟล์ใหม่ (C) แล้วให้ A, B import จาก C |
| A → B → C → A      | หาว่าจุดไหน dependency ไม่จำเป็น แล้วตัดออก               |
| Type-only circular | ใช้ `import type { }` แทน `import { }`                    |

### เมื่อไหร่ควรรัน

- เมื่อ refactor โครงสร้าง folder
- เมื่อ build มีปัญหา undefined
- ก่อน release

---

## 3. jscpd — หา Duplicate Code (Copy-Paste Detection)

### ทำอะไร

สแกนหา code ที่ copy-paste กัน ซึ่งทำให้:

- แก้ bug ที่เดียวแต่หลุดอีกที่
- Codebase บวมโดยไม่จำเป็น
- Maintain ยาก

### วิธีใช้

```bash
# สแกน src/ directory
npx jscpd src/

# สแกนพร้อมตั้ง threshold
npx jscpd src/ --threshold 5

# สแกนเฉพาะ .ts/.tsx
npx jscpd src/ --pattern "**/*.{ts,tsx}"

# สร้าง HTML report
npx jscpd src/ --reporters html --output report/
```

### ตัวอย่าง Output

```
╔═══════════════════════════════════════════╗
║        jscpd — Copy/Paste Detector        ║
╠═══════════════════════════════════════════╣
║ Files analyzed:      42                    ║
║ Clones found:        3                     ║
║ Duplicated lines:    87 (4.2%)             ║
║ Duplicated tokens:   412                   ║
╚═══════════════════════════════════════════╝

Clone 1:
  src/components/UserCard.tsx (10-35)
  src/components/AdminCard.tsx (15-40)
  Lines: 25
```

### เกณฑ์ที่ดี

| Metric           | เกณฑ์ | สถานะ       |
| ---------------- | ----- | ----------- |
| Duplicated lines | < 5%  | ดี          |
| Duplicated lines | 5-10% | ควรปรับปรุง |
| Duplicated lines | > 10% | ต้องแก้     |

### วิธีแก้ Duplicate Code

1. **Extract function** — แยก code ที่ซ้ำเป็น shared function
2. **Extract component** — แยก UI ที่ซ้ำเป็น shared component
3. **Extract hook** — แยก logic ที่ซ้ำเป็น custom hook
4. **Generics/Config** — ทำเป็น configurable function แทนที่จะ copy

---

## รันทั้ง 3 ตัวพร้อมกัน

```bash
# วิธีที่ 1: ใช้ npm script (รวมอยู่ใน quality:code)
npm run quality:code

# วิธีที่ 2: รันเอง
npx depcheck && npx madge --circular src/ && npx jscpd src/
```

---

## Troubleshooting

| ปัญหา                                 | วิธีแก้                                                     |
| ------------------------------------- | ----------------------------------------------------------- |
| depcheck รายงาน false positive        | เพิ่มใน `ignoreMatches` ของ `.depcheckrc` หรือ package.json |
| madge ไม่เข้าใจ path alias            | เพิ่ม `--ts-config tsconfig.json`                           |
| jscpd สแกนนาน                         | จำกัด scope ด้วย `--pattern`                                |
| madge ต้องการ Graphviz สำหรับ --image | `brew install graphviz`                                     |

---

## Claude CLI Prompt Template

```
วิเคราะห์ code quality เชิงโครงสร้าง:
1. รัน `npx depcheck` — สรุปว่ามี unused dependencies กี่ตัว
2. รัน `npx madge --circular src/` — มี circular import ไหม
3. รัน `npx jscpd src/` — มี duplicate code กี่ %
4. สรุปเป็นตาราง: เครื่องมือ | ผลลัพธ์ | ต้องแก้ไหม
5. ถ้ามี circular import — เสนอวิธีแก้พร้อมไฟล์ที่เกี่ยวข้อง
6. ถ้ามี duplicate code > 5% — เสนอว่าควร extract อะไร
```
