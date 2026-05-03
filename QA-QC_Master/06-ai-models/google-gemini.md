# Google Gemini — Alternative AI

> Gemini เป็น fallback ตัวที่ 2 — เร็ว, ราคาถูก
> เหมาะกับงานที่ต้องการ response เร็วหรือ multimodal

---

## ทำไมเป็น Alternative?

| เปรียบเทียบ    | Claude Opus 4.6 |          Gemini 2.5 Pro          |
| -------------- | :-------------: | :------------------------------: |
| SWE-Bench      |    **80.8%**    |              63.8%               |
| Context Window |    1M tokens    |            1M tokens             |
| Speed          |      ปกติ       |           **เร็วกว่า**           |
| Cost (API)     |   $15/M input   |        **$1.25/M input**         |
| Multimodal     |  Text + Image   | **Text + Image + Video + Audio** |

> Context window เท่ากัน แต่ Claude ชนะด้าน code reasoning (SWE-Bench)
> Gemini ชนะด้าน speed และ ราคา

---

## SDK

ViberQC ติดตั้งแล้ว:

```json
"@google/generative-ai": "^0.24.1"
```

### API Key

```env
# .env.local
GOOGLE_GEMINI_API_KEY=AI...
```

วิธีสร้าง API Key:

1. เข้า [aistudio.google.com](https://aistudio.google.com/)
2. Get API Key → Create API Key
3. Copy ใส่ `.env.local`

---

## ใช้งานใน Code

```typescript
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);

const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

const result = await model.generateContent("Review this code...");
const response = result.response;
console.log(response.text());
```

---

## Use Cases

| สถานการณ์                | ทำไมใช้ Gemini                |
| ------------------------ | ----------------------------- |
| ต้องการ response เร็ว    | Gemini ตอบเร็วกว่า Claude/GPT |
| งบจำกัด                  | API ราคาถูกที่สุด             |
| วิเคราะห์ screenshot     | Multimodal ดี                 |
| Claude + GPT ล่มพร้อมกัน | Fallback ตัวสุดท้าย           |
| Summarize ข้อมูลยาวๆ     | 1M context + เร็ว             |

---

## Model Specs

| Spec           | ค่า                        |
| -------------- | -------------------------- |
| Model          | Gemini 2.5 Pro             |
| Context Window | 1,000,000 tokens           |
| Max Output     | 8,192 tokens               |
| SWE-Bench      | 63.8%                      |
| Pricing (API)  | $1.25/M input, $5/M output |
| Free Tier      | 15 RPM, 1M tokens/min      |

---

## Free Tier

Google ให้ใช้ Gemini API ฟรี:

| รายการ          | Free Tier |
| --------------- | :-------: |
| Requests/minute |    15     |
| Tokens/minute   | 1,000,000 |
| Requests/day    |   1,500   |

> Free tier เพียงพอสำหรับ development + occasional fallback

---

## Prompt Template: Quick Analysis

```
Analyze this codebase structure quickly:
1. Main architecture pattern
2. Obvious issues
3. Quick improvement suggestions

Keep it brief - 5 bullet points max.

Code:
[paste code here]
```

---

## Checklist

- [ ] สร้าง API Key ที่ [aistudio.google.com](https://aistudio.google.com/)
- [ ] ตั้ง `GOOGLE_GEMINI_API_KEY` ใน `.env.local`
- [ ] ทดสอบ API call สำเร็จ
- [ ] ใช้เป็น fallback เมื่อ Claude + GPT ไม่พร้อม
