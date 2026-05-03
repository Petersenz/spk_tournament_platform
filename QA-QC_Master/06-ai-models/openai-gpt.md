# OpenAI GPT-4o — Alternative AI

> GPT-4o เป็น fallback เมื่อ Claude ไม่พร้อมใช้งาน
> หรือต้องการ "มุมมองที่ 2" สำหรับ code review

---

## ทำไมเป็น Alternative ไม่ใช่ Primary?

| เปรียบเทียบ    | Claude Opus 4.6 |   GPT-4o    |
| -------------- | :-------------: | :---------: |
| SWE-Bench      |    **80.8%**    |    72.0%    |
| Context Window |  **1M tokens**  | 128K tokens |
| Code Reasoning |     ดีกว่า      |     ดี      |
| Cost (monthly) |    $20 (Pro)    | Pay-per-use |

> Claude ชนะทั้ง SWE-Bench และ context window
> GPT-4o ใช้เป็น **fallback** เมื่อ Claude ล่มหรือต้องการ second opinion

---

## SDK

ViberQC ติดตั้งแล้ว:

```json
"openai": "^6.27.0"
```

### API Key

```env
# .env.local
OPENAI_API_KEY=sk-...
```

---

## ใช้งานใน Code

```typescript
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const completion = await openai.chat.completions.create({
  model: "gpt-4o",
  messages: [
    { role: "system", content: "You are a code review expert." },
    { role: "user", content: "Review this code for bugs..." },
  ],
  max_tokens: 4096,
});

console.log(completion.choices[0].message.content);
```

---

## Use Cases

| สถานการณ์                 | ทำไมใช้ GPT-4o                       |
| ------------------------- | ------------------------------------ |
| Claude ล่ม/maintenance    | Fallback ที่ดีที่สุด                 |
| ต้องการ second opinion    | มุมมองต่าง → เจอ bug ที่ Claude พลาด |
| Image/screenshot analysis | Vision capabilities ดี               |
| Function calling          | Structured output ดี                 |

---

## Model Specs

| Spec             | ค่า                         |
| ---------------- | --------------------------- |
| Model            | GPT-4o                      |
| Context Window   | 128,000 tokens              |
| Max Output       | 16,384 tokens               |
| SWE-Bench        | 72.0%                       |
| Knowledge Cutoff | October 2023                |
| Pricing (API)    | $2.50/M input, $10/M output |

---

## เปรียบเทียบค่าใช้จ่าย API

| Scenario               | Claude API | GPT-4o API |
| ---------------------- | :--------: | :--------: |
| 100K input + 4K output |   $1.80    |   $0.29    |
| 500K input + 8K output |   $8.10    |   $1.33    |
| 1M input + 16K output  |   $16.20   |   $2.66    |

> GPT-4o ถูกกว่า Claude API มาก
> แต่ ViberQC ใช้ Claude Pro ($20/mo flat) ไม่ใช่ API — คุ้มกว่า

---

## Prompt Template: Second Opinion Review

```
I've already reviewed this code with another AI. Please provide a
fresh review focusing on:
1. Bugs the first reviewer might have missed
2. Edge cases not covered
3. Security vulnerabilities
4. Performance issues

Code:
[paste code here]
```

---

## Checklist

- [ ] ตั้ง `OPENAI_API_KEY` ใน `.env.local`
- [ ] ทดสอบ API call สำเร็จ
- [ ] ใช้เป็น fallback เมื่อ Claude ไม่พร้อม
