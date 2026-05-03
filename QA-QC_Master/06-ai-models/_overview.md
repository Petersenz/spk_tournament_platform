# 06 — AI Models: ภาพรวม

> กลยุทธ์ AI ของ ViberQC: ใช้ Claude CLI (Opus 4.6) เป็น primary
> AI อื่นเป็น fallback/alternative ตามความเหมาะสม

---

## สารบัญไฟล์

| ไฟล์                                             | เนื้อหา                                                           |
| ------------------------------------------------ | ----------------------------------------------------------------- |
| [anthropic-claude.md](anthropic-claude.md)       | Claude Opus 4.6 — Primary AI (code review, architecture, bug fix) |
| [openai-gpt.md](openai-gpt.md)                   | GPT-4o — Alternative/Fallback                                     |
| [google-gemini.md](google-gemini.md)             | Gemini — Alternative/Fast responses                               |
| [openrouter.md](openrouter.md)                   | OpenRouter — Multi-model gateway (ใช้ใน CI/CD)                    |
| [architecture-review.md](architecture-review.md) | Architecture Review — Prompt templates                            |

---

## AI Strategy

```
┌─────────────────────────────────────┐
│  Primary: Claude CLI (Opus 4.6)      │  ← ใช้ทุกวัน
│  $20/mo Pro plan                     │
│  Context: 1M tokens                  │
└──────────────┬──────────────────────┘
               │
       ┌───────┴───────┐
       ▼               ▼
┌─────────────┐  ┌─────────────┐
│ Fallback 1:  │  │ Fallback 2:  │
│ GPT-4o       │  │ Gemini       │
│ (API)        │  │ (API)        │
└─────────────┘  └─────────────┘
               │
               ▼
       ┌─────────────┐
       │ CI/CD:       │
       │ OpenRouter   │  ← PR-Agent ใน GitLab CI
       │ (Claude      │
       │  Sonnet 4)   │
       └─────────────┘
```

---

## ตาราง Comparison

| Model               | Provider                   | Context Window | SWE-Bench |     ราคา     | จุดแข็ง                                                |
| ------------------- | -------------------------- | :------------: | :-------: | :----------: | ------------------------------------------------------ |
| **Claude Opus 4.6** | Anthropic                  | **1M tokens**  | **80.8%** | $20/mo (Pro) | Code reasoning, architecture, อ่าน codebase ทั้งหมดได้ |
| **GPT-4o**          | OpenAI                     |  128K tokens   |   72.0%   | Pay-per-use  | General purpose, vision, function calling              |
| **Gemini 2.5 Pro**  | Google                     |   1M tokens    |   63.8%   | Pay-per-use  | Fast, multimodal, ราคาถูก                              |
| **Claude Sonnet 4** | Anthropic (via OpenRouter) |  200K tokens   |   72.7%   | ~$3/M tokens | ใช้ใน CI/CD (PR-Agent), เร็ว+ถูก                       |

> **SWE-Bench**: วัดความสามารถแก้ bug ใน real-world codebase
> Claude Opus 4.6 = 80.8% สูงสุด — เหมาะที่สุดสำหรับ QA/QC

---

## SDKs ที่ติดตั้งแล้ว

| SDK           | Package                 | Version |
| ------------- | ----------------------- | :-----: |
| Anthropic     | `@anthropic-ai/sdk`     | ^0.78.0 |
| OpenAI        | `openai`                | ^6.27.0 |
| Google Gemini | `@google/generative-ai` | ^0.24.1 |

---

## API Keys

| Model        | ENV Variable            | ตั้งค่าที่                            |
| ------------ | ----------------------- | ------------------------------------- |
| Claude (CLI) | `ANTHROPIC_API_KEY`     | `.env.local`                          |
| GPT-4o       | `OPENAI_API_KEY`        | `.env.local`                          |
| Gemini       | `GOOGLE_GEMINI_API_KEY` | `.env.local`                          |
| OpenRouter   | `OPENROUTER_API_KEY`    | `.env.local` + GitLab CI/CD Variables |

---

## งบประมาณ AI รายเดือน

| รายการ             |   ค่าใช้จ่าย   | หมายเหตุ                  |
| ------------------ | :------------: | ------------------------- |
| Claude Pro (CLI)   |   **$20/mo**   | ใช้ทุกวัน — primary tool  |
| GPT-4o API         |    ~$2-5/mo    | ใช้เป็น fallback เท่านั้น |
| Gemini API         |    ~$1-3/mo    | ใช้เป็น fallback เท่านั้น |
| OpenRouter (CI/CD) |    ~$1-5/mo    | PR-Agent review ใน MR     |
| **รวม**            | **~$24-33/mo** |                           |

> **ค่าใช้จ่ายหลัก = Claude Pro $20/mo**
> Fallback APIs ใช้น้อย ค่าใช้จ่ายไม่เกิน $10/mo

---

## เมื่อไหร่ใช้ตัวไหน?

| สถานการณ์             |       ใช้       | เหตุผล                                       |
| --------------------- | :-------------: | -------------------------------------------- |
| Code review / Bug fix |     Claude      | สูงสุดใน SWE-Bench, 1M context               |
| Architecture review   |     Claude      | อ่าน codebase ทั้งหมดได้                     |
| Test generation       |     Claude      | เข้าใจ business logic ดี                     |
| Claude ล่ม            |     GPT-4o      | Fallback ที่ดี                               |
| ต้องการ response เร็ว |     Gemini      | เร็วกว่า, ราคาถูกกว่า                        |
| GitLab MR review      |   OpenRouter    | PR-Agent ใช้ Claude Sonnet 4 ผ่าน OpenRouter |
| Image analysis        | GPT-4o / Gemini | Vision capabilities                          |

---

## Project Instructions

ViberQC ใช้ 2 ไฟล์ควบคุม AI behavior:

| ไฟล์        | ใช้กับ            | หน้าที่                                  |
| ----------- | ----------------- | ---------------------------------------- |
| `CLAUDE.md` | Claude Code CLI   | Project instructions, scripts, protocols |
| `AGENTS.md` | Cursor Agent Mode | Agent mode instructions, sync guardian   |
