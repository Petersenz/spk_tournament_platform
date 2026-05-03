# Architecture Review — Claude Code CLI

> ใช้ Claude Code CLI เป็นเครื่องมือหลักสำหรับ review architecture
> ไม่ใช้ Greptile เพราะรองรับเฉพาะ GitHub (ViberQC ใช้ GitLab)

---

## ทำไมใช้ Claude CLI ไม่ใช้ Greptile?

| เปรียบเทียบ        |           Claude Code CLI           |    Greptile     |
| ------------------ | :---------------------------------: | :-------------: |
| **Git Provider**   | **ทุก provider** (อ่าน local files) |   GitHub only   |
| **GitLab support** |        ใช่ (อ่าน local repo)        |       ไม่       |
| **Context**        |              1M tokens              |      จำกัด      |
| **ราคา**           |            $20/mo (Pro)             |     $99/mo      |
| **Real-time**      |       ใช่ (อ่านไฟล์ปัจจุบัน)        | ต้อง index ก่อน |

> ViberQC ใช้ GitLab → Greptile ใช้ไม่ได้
> Claude CLI อ่าน local files ได้เลย — ไม่สนว่า Git provider ตัวไหน

---

## Architecture Review ดูอะไรบ้าง?

| หมวด                  | ดูอะไร                   | ทำไมสำคัญ                        |
| --------------------- | ------------------------ | -------------------------------- |
| Folder Structure      | โครงสร้าง folder ถูกหลัก | หาของง่าย, onboard ทีมใหม่ง่าย   |
| Dependency Analysis   | dependencies ที่ใช้      | เจอ unused, outdated, vulnerable |
| Coupling/Cohesion     | modules เชื่อมกันมากไป?  | แก้ module A ไม่กระทบ module B   |
| Tech Debt             | code ที่ "ยืมเวลาอนาคต"  | ป้องกันหนี้สะสม                  |
| Circular Dependencies | A → B → C → A            | ทำให้ build ช้า, test ยาก        |

---

## Prompt Templates

### Template 1: Folder Structure Review

```
ดู folder structure ของ project นี้:
1. โครงสร้าง folder ตาม best practice ไหม?
2. มีไฟล์วางผิดที่ไหม?
3. ควรแยก/รวม folder ไหนบ้าง?
4. Naming convention สอดคล้องกันไหม?

แสดงผล:
- ตาราง: folder | สถานะ (OK/ควรแก้) | เหตุผล
- เสนอ folder structure ที่แนะนำ (ถ้าต้องแก้)
```

### Template 2: Dependency Analysis

```
ตรวจ dependencies ทั้งหมดใน package.json:
1. มี dependency ไหนที่ไม่ได้ใช้? (unused)
2. มี dependency ไหนที่ outdated? (เวอร์ชันเก่า)
3. มี dependency ที่ทำหน้าที่ซ้ำกันไหม?
4. มี dependency ที่มี known vulnerabilities ไหม?
5. devDependencies ถูกจัดหมวดถูกไหม?

แสดงผลเป็นตาราง:
package | version | สถานะ | action needed
```

### Template 3: Coupling/Cohesion Check

```
วิเคราะห์ coupling และ cohesion ของ modules:
1. Module ไหนมี dependency เยอะเกินไป? (high coupling)
2. Module ไหนทำหลายหน้าที่เกินไป? (low cohesion)
3. มี circular dependencies ไหม?
4. มี God objects/functions ไหม? (ฟังก์ชัน > 50 บรรทัด)

แสดงผล:
- Dependency graph (text-based)
- ตาราง: module | imports จาก | imported โดย | coupling score
- แนะนำ: ควรแยก/refactor อะไร
```

### Template 4: Tech Debt Assessment

```
ประเมิน technical debt ของ project:
1. TODO/FIXME/HACK comments ทั้งหมด
2. Code duplication (copy-paste > 10 บรรทัด)
3. Dead code (ไม่มีใคร import/call)
4. Inconsistent patterns (เช่น ใช้ทั้ง callback + async/await)
5. Missing error handling
6. Missing types (TypeScript any)
7. ขนาดไฟล์ที่เกินมาตรฐาน (> 300 บรรทัด)

แสดงผล:
- Tech Debt Score: X/100
- ตาราง: ประเภท | จำนวน | severity | effort
- Top 5 quick wins (แก้ง่าย, impact สูง)
```

### Template 5: Pre-Release Architecture Check

```
ตรวจ architecture ก่อน release:
1. ทุก API endpoint มี error handling ไหม?
2. ทุก API มี rate limiting ไหม?
3. Database queries มี index ที่จำเป็นไหม?
4. Auth/AuthZ ครอบคลุมทุก route ไหม?
5. Environment variables ครบไหม?
6. Logging เพียงพอสำหรับ debugging ไหม?

สรุปเป็น:
- Readiness Score: X/100
- Blockers (ต้องแก้ก่อน release)
- Warnings (ควรแก้แต่ไม่บังคับ)
```

---

## CLI Tools ที่ช่วย Architecture Review

ViberQC มี CLI tools ที่ช่วย review ได้ทันที:

| Tool             | Command                     | ตรวจอะไร                  |
| ---------------- | --------------------------- | ------------------------- |
| **depcheck**     | `npx depcheck`              | Unused dependencies       |
| **madge**        | `npx madge --circular src/` | Circular imports          |
| **jscpd**        | `npx jscpd src/`            | Copy-paste code           |
| **quality-gate** | `npm run quality`           | Overall quality score     |
| **code-conform** | `npm run conform:verbose`   | Code standards compliance |

### Workflow แนะนำ

```bash
# 1. รัน CLI tools ก่อน
npx depcheck
npx madge --circular src/
npx jscpd src/

# 2. ให้ Claude วิเคราะห์ผลลัพธ์
claude "วิเคราะห์ผลลัพธ์จาก depcheck, madge, jscpd ข้างต้น
       แล้วเสนอ action plan จัดลำดับตาม priority"

# 3. ให้ Claude ทำ deep review
claude "ทำ architecture review แบบ full ตาม template ใน
       QA-QC_Master/06-ai-models/architecture-review.md"
```

---

## Review Schedule

| เมื่อไหร่             | ทำอะไร                   | ใช้ Template |
| --------------------- | ------------------------ | :----------: |
| ทุกสัปดาห์            | Dependency check         |      #2      |
| ก่อน release          | Full architecture review |      #5      |
| หลัง major refactor   | Coupling/Cohesion check  |      #3      |
| รายเดือน              | Tech Debt assessment     |      #4      |
| เมื่อ onboard ทีมใหม่ | Folder structure review  |      #1      |

---

## Checklist

- [ ] ติดตั้ง Claude Code CLI (ดู [anthropic-claude.md](anthropic-claude.md))
- [ ] ทดสอบ: รัน `claude` ใน project directory
- [ ] ทดสอบ: ใช้ Template #1 review folder structure
- [ ] ตั้ง schedule รัน architecture review รายเดือน
- [ ] เก็บผลลัพธ์ review ใน `.cursor/plans/` หรือ `Docs/`
