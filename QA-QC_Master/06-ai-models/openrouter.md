# OpenRouter — Multi-Model Gateway

> OpenRouter = gateway ที่เข้าถึง AI หลายตัวผ่าน API เดียว
> ViberQC ใช้ใน CI/CD (PR-Agent) — ไม่ใช่สำหรับใช้ตรง

---

## OpenRouter คืออะไร?

- API gateway ที่รวม AI models หลายเจ้า (Claude, GPT, Gemini, Llama, etc.)
- ใช้ API key เดียว เรียกได้ทุก model
- **ViberQC ใช้ใน GitLab CI/CD** เพื่อให้ PR-Agent review code อัตโนมัติ

```
Developer push code
        │
        ▼
GitLab CI/CD (pr-agent-review stage)
        │
        ▼
PR-Agent container
        │
        ▼
OpenRouter API (openrouter.ai/api/v1)
        │
        ▼
Claude Sonnet 4 (model: openrouter/anthropic/claude-sonnet-4)
        │
        ▼
Review comments on Merge Request
```

---

## ทำไมใช้ OpenRouter ใน CI/CD?

| เหตุผล                                     | รายละเอียด                                                     |
| ------------------------------------------ | -------------------------------------------------------------- |
| **PR-Agent ต้องการ OpenAI-compatible API** | OpenRouter มี endpoint `/api/v1` ที่ compatible กับ OpenAI SDK |
| **เลือก model ได้**                        | ใช้ Claude Sonnet 4 ผ่าน OpenRouter prefix                     |
| **ราคาถูก**                                | Sonnet 4 ผ่าน OpenRouter ~$3/M input tokens                    |
| **ไม่ต้องสมัคร Anthropic API แยก**         | API key เดียวใช้ได้ทุก model                                   |

---

## GitLab CI/CD Configuration

จาก `.gitlab-ci.yml`:

```yaml
pr-agent-review:
  stage: review
  image:
    name: codiumai/pr-agent:latest
    entrypoint: [""]
  tags:
    - docker
  script:
    - cd "$CI_PROJECT_DIR"
    - export MR_URL="$CI_MERGE_REQUEST_PROJECT_URL/merge_requests/$CI_MERGE_REQUEST_IID"
    - export gitlab__url=$CI_SERVER_PROTOCOL://$CI_SERVER_FQDN
    - export gitlab__PERSONAL_ACCESS_TOKEN=$GITLAB_PERSONAL_ACCESS_TOKEN
    - export config__git_provider="gitlab"
    - export openai__key=$OPENAI_KEY
    - export openai__api_base="https://openrouter.ai/api/v1"
    - export config__model="openrouter/anthropic/claude-sonnet-4"
    - python -m pr_agent.cli --pr_url="$MR_URL" describe
    - python -m pr_agent.cli --pr_url="$MR_URL" review
    - python -m pr_agent.cli --pr_url="$MR_URL" improve
  rules:
    - if: '$CI_PIPELINE_SOURCE == "merge_request_event"'
```

### PR-Agent ทำ 3 อย่าง:

| Command    | ทำอะไร                                |
| ---------- | ------------------------------------- |
| `describe` | สรุป MR changes อัตโนมัติ             |
| `review`   | Review code + หา bugs/security issues |
| `improve`  | เสนอ improvement suggestions          |

---

## API Key Setup

### 1. สร้าง API Key

1. สมัคร [openrouter.ai](https://openrouter.ai/)
2. Keys → Create Key
3. Copy API Key

### 2. ตั้งค่าใน GitLab

1. GitLab Project → Settings → CI/CD → Variables
2. เพิ่ม Variable:
   - Key: `OPENAI_KEY` (PR-Agent ใช้ชื่อนี้)
   - Value: `sk-or-v1-xxxxx` (OpenRouter API key)
   - Protected: Yes
   - Masked: Yes

### 3. ตั้งค่าใน .env.local (สำรอง)

```env
OPENROUTER_API_KEY=sk-or-v1-xxxxx
```

---

## ราคา (Claude Sonnet 4 ผ่าน OpenRouter)

| Metric            |     ราคา     |
| ----------------- | :----------: |
| Input             | $3/M tokens  |
| Output            | $15/M tokens |
| Typical MR review | ~$0.01-0.05  |
| 100 MRs/เดือน     |   ~$1-5/mo   |

> ราคาถูกมาก — review 100 MRs ไม่ถึง $5

---

## สำคัญ: OpenRouter vs Claude CLI

|                  |      OpenRouter      |       Claude CLI       |
| ---------------- | :------------------: | :--------------------: |
| **ใช้ที่**       |    CI/CD pipeline    | Terminal (development) |
| **วัตถุประสงค์** | Automated MR review  | Interactive code work  |
| **Model**        |   Claude Sonnet 4    |    Claude Opus 4.6     |
| **ราคา**         | Pay-per-use (~$5/mo) |      $20/mo flat       |
| **ใช้ทุกวัน?**   |    ไม่ (เฉพาะ MR)    |          ใช่           |

> **ข้อสรุป**: ใช้ Claude CLI สำหรับงาน development ประจำวัน
> ใช้ OpenRouter เฉพาะใน CI/CD automation เท่านั้น

---

## Checklist

- [ ] สมัคร [openrouter.ai](https://openrouter.ai/) + สร้าง API Key
- [ ] ตั้ง `OPENAI_KEY` ใน GitLab CI/CD Variables (masked)
- [ ] ตั้ง `OPENROUTER_API_KEY` ใน `.env.local`
- [ ] ทดสอบ: สร้าง MR → ดูว่า PR-Agent comment ขึ้นมา
