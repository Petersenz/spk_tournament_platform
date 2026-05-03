# Anthropic Claude — Primary AI Tool

> Claude Opus 4.6 ผ่าน Claude Code CLI — เครื่องมือ AI หลักของ ViberQC
> Context 1M tokens = อ่าน codebase ทั้งหมดได้ในครั้งเดียว
> SWE-Bench: 80.8% (สูงสุดในตลาด)

---

## ทำไม Claude เป็น Primary?

| เหตุผล               | รายละเอียด                                          |
| -------------------- | --------------------------------------------------- |
| **SWE-Bench 80.8%**  | แก้ bug ใน real codebase ได้สูงสุด                  |
| **1M token context** | อ่าน file 500+ ไฟล์ในครั้งเดียว ไม่ต้องสรุป         |
| **Claude Code CLI**  | ทำงานใน terminal ได้เลย — อ่าน/แก้ไฟล์, รัน command |
| **CLAUDE.md**        | ตั้ง project instructions ให้ AI ทำตามทุก session   |
| **ราคา**             | $20/mo (Pro plan) — คุ้มมากสำหรับความสามารถ         |

---

## Setup

### Claude Code CLI

Claude Code CLI คือ command-line tool ที่รัน Claude ใน terminal:

```bash
# ติดตั้ง (ต้องมี Node.js)
npm install -g @anthropic-ai/claude-code

# เปิดใช้งาน
claude

# เปิดใน project
cd /path/to/project
claude
```

### Pro Plan ($20/mo)

1. สมัคร [claude.ai](https://claude.ai/)
2. Upgrade เป็น **Claude Pro** ($20/mo)
3. Claude Code CLI จะใช้ Pro plan โดยอัตโนมัติ

---

## SDK Integration

ViberQC ติดตั้ง SDK แล้วใน package.json:

```json
"@anthropic-ai/sdk": "^0.78.0"
```

### ใช้ใน Code

```typescript
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const message = await anthropic.messages.create({
  model: "claude-opus-4-20250514",
  max_tokens: 4096,
  messages: [{ role: "user", content: "Review this code for bugs..." }],
});
```

API Key: `ANTHROPIC_API_KEY` ใน `.env.local`

---

## Project Instructions — CLAUDE.md + AGENTS.md

### CLAUDE.md (Claude Code CLI อ่านอัตโนมัติ)

ตั้งค่าสำคัญที่อยู่ใน `CLAUDE.md`:

| Section                | หน้าที่                             |
| ---------------------- | ----------------------------------- |
| Sync Guardian Protocol | ต้องอ่าน tracking docs ก่อนเริ่มงาน |
| Memory Bank (6 ไฟล์)   | ระบบความจำข้ามทุก session           |
| Scripts ที่ใช้ได้      | Quality, Security, Sync scripts     |
| Protected Zones        | ไฟล์ที่ห้ามแก้โดยไม่ขออนุญาต        |
| Server Health Check    | ต้องตรวจ server ก่อนบอก "เปิดดูได้" |
| Anti-patterns          | สิ่งที่ห้ามทำ                       |

### AGENTS.md (Cursor Agent Mode อ่านอัตโนมัติ)

ตั้งค่าเพิ่มเติมสำหรับ Cursor:

| Section                     | หน้าที่                            |
| --------------------------- | ---------------------------------- |
| Sync Guardian Trigger Rules | เมื่อไหร่ต้อง update tracking docs |
| Session End Protocol        | Checklist ก่อนจบ session           |
| Cascade Rules               | แก้ไฟล์หนึ่ง ต้องแก้ไฟล์อื่นด้วย   |

---

## Use Cases สำหรับ QA/QC

### 1. Code Review

Claude อ่าน codebase ทั้งหมดแล้ว review ได้ทันที:

- ดู coding standards compliance
- หา bugs, security vulnerabilities
- เสนอ refactoring options
- ตรวจ test coverage gaps

### 2. Architecture Reasoning

- วิเคราะห์ folder structure
- ตรวจ dependency graph
- หา circular imports
- เสนอ separation of concerns

### 3. Bug Fixing

- อ่าน error log แล้วหา root cause
- แก้ bug พร้อมเขียน test
- SWE-Bench 80.8% = แก้ bug ได้ดีที่สุดในตลาด

### 4. Test Generation

- เขียน unit test จาก business logic
- เขียน E2E test scenarios
- ครอบคลุม edge cases

---

## Prompt Templates สำหรับ QA Tasks

### Template 1: Code Review

```
อ่านไฟล์ทั้งหมดใน src/ แล้ว:
1. หา bug ที่เป็นไปได้
2. ตรวจ security vulnerabilities
3. ดู coding standards ตาม ESLint rules
4. เสนอ refactoring ถ้า code ซับซ้อนเกินไป

แสดงผลเป็นตาราง: ไฟล์ | บรรทัด | ปัญหา | severity | วิธีแก้
```

### Template 2: Bug Investigation

```
ดู error นี้:
[วาง error log]

1. หา root cause
2. อธิบายว่าเกิดจากอะไร
3. แก้ไข code ให้เสร็จ
4. เขียน test ป้องกัน regression
```

### Template 3: Test Generation

```
อ่าน [ชื่อไฟล์] แล้วเขียน test:
1. Unit tests ครอบคลุม happy path + edge cases
2. ใช้ Vitest framework
3. Mock external dependencies
4. ตั้งชื่อ test ให้อ่านรู้ว่าทดสอบอะไร
```

### Template 4: Security Audit

```
ตรวจ security ทั้ง project:
1. OWASP Top 10 vulnerabilities
2. Secret leak (API keys, passwords)
3. SQL injection / XSS possibilities
4. Auth/AuthZ weaknesses
5. Dependency vulnerabilities

แสดงผลเป็นตาราง: ประเภท | ไฟล์ | severity | วิธีแก้
```

### Template 5: Performance Review

```
อ่าน code ทั้งหมดแล้วหาปัญหา performance:
1. N+1 queries
2. Missing pagination
3. Unnecessary re-renders (React)
4. Large bundle imports
5. Missing caching

จัดลำดับตาม impact: high → medium → low
```

### Template 6: Quality Gate Review

```
รัน npm run quality แล้ว:
1. วิเคราะห์ score แต่ละหมวด
2. สิ่งที่ต้องแก้ urgently (score < 60)
3. Quick wins (แก้ง่าย, impact สูง)
4. สรุปเป็น action items + effort estimate
```

---

## Claude Code CLI — Commands ที่มีประโยชน์

| Command               | ทำอะไร                            |
| --------------------- | --------------------------------- |
| `claude`              | เปิด Claude Code interactive mode |
| `claude "คำถาม"`      | ถามคำถามเดียวแล้วจบ               |
| `claude -p "prompt"`  | Print mode (ไม่ interactive)      |
| `claude --model opus` | เลือก model                       |

---

## Model Specs

| Spec             | ค่า                       |
| ---------------- | ------------------------- |
| Model            | Claude Opus 4.6           |
| Context Window   | 1,000,000 tokens          |
| Max Output       | 32,000 tokens             |
| SWE-Bench        | 80.8%                     |
| Knowledge Cutoff | May 2025                  |
| Pricing (Pro)    | $20/mo                    |
| Pricing (API)    | $15/M input, $75/M output |

---

## Limitations

| ข้อจำกัด                         | วิธีจัดการ                 |
| -------------------------------- | -------------------------- |
| ไม่มี internet access (CLI mode) | ใช้ tools/MCP servers      |
| Rate limit (Pro plan)            | พอสำหรับการใช้งานปกติ      |
| ไม่ 100% ถูกต้อง                 | ต้อง verify ผลลัพธ์เสมอ    |
| Cost สูงกว่า alternatives        | คุ้มค่าตาม SWE-Bench score |

---

## Checklist

- [ ] ติดตั้ง Claude Code CLI
- [ ] Upgrade เป็น Claude Pro ($20/mo)
- [ ] ตั้ง `CLAUDE.md` ใน project root (มีแล้ว)
- [ ] ตั้ง `AGENTS.md` ใน project root (มีแล้ว)
- [ ] ตั้ง `ANTHROPIC_API_KEY` ใน `.env.local` (สำหรับ SDK)
- [ ] ทดสอบ: รัน `claude` ใน project directory
