# AI Code Review — CodeRabbit, Qodo Teams, PR-Agent

> เปรียบเทียบ 3 เครื่องมือ AI Code Review ที่ทำงานร่วมกับ GitLab
> ทั้ง 3 ตัวมี overlap < 80% — ควรเลือกใช้ตามความเหมาะสม

---

## ตาราง Comparison

| Feature                | CodeRabbit Pro       | Qodo Teams             | PR-Agent (Free)            |
| ---------------------- | -------------------- | ---------------------- | -------------------------- |
| **ราคา**               | $24/dev/mo           | $30/user/mo            | Free (open-source)         |
| **GitLab รองรับ**      | Webhook integration  | PR-Agent in CI/CD      | Docker image in CI/CD      |
| **Auto-review MR**     | ใช่ (ทุก MR)         | ใช่ (ทุก MR)           | ใช่ (ทุก MR)               |
| **AI Model**           | GPT-4o / Claude      | GPT-4o / Claude        | กำหนดเอง (OpenRouter)      |
| **Built-in Linters**   | 40+ linters + SAST   | AST-based analysis     | ไม่มี (ใช้ LLM อย่างเดียว) |
| **Bug Detection**      | ดี                   | ดีมาก (F1: 64.3%)      | ปานกลาง                    |
| **Auto Test Gen**      | ไม่มี                | ใช่ (Qodo Gen)         | ไม่มี                      |
| **IDE Extension**      | Cursor extension     | Cursor (Qodo Gen)      | ไม่มี                      |
| **Review Language**    | ภาษาไทยได้           | อังกฤษเป็นหลัก         | ตาม LLM model              |
| **Customizable Rules** | path_instructions    | Custom prompts         | YAML config                |
| **Learning**           | เรียนรู้จาก codebase | เรียนรู้จาก PR history | ไม่มี learning             |
| **ใช้ใน project นี้**  | มี .coderabbit.yaml  | ยังไม่ได้ตั้ง          | มีใน .gitlab-ci.yml        |

---

## เมื่อไหร่ควรใช้ตัวไหน

| สถานการณ์                    | แนะนำ                        | เหตุผล                      |
| ---------------------------- | ---------------------------- | --------------------------- |
| ทีมเล็ก งบจำกัด              | **PR-Agent** (Free)          | Free + กำหนด model เองได้   |
| ต้องการ review ภาษาไทย       | **CodeRabbit**               | รองรับ language: "th"       |
| ต้องการ auto test generation | **Qodo Teams**               | สร้าง test อัตโนมัติ        |
| ต้องการ built-in SAST        | **CodeRabbit**               | 40+ linters มาในตัว         |
| ต้องการ bug detection สูงสุด | **Qodo Teams**               | F1 score สูงสุดใน benchmark |
| ต้องการ full control         | **PR-Agent**                 | open-source, self-hosted    |
| ใช้หลาย IDE (Cursor/VS Code) | **CodeRabbit** หรือ **Qodo** | มี extension                |

---

## 1. CodeRabbit Pro ($24/dev/mo)

### จุดเด่น

- Auto-review ทุก MR อัตโนมัติ ไม่ต้อง config CI/CD
- 40+ linters + SAST ในตัว (ESLint, Semgrep, Shellcheck, markdownlint, ...)
- กำหนด path_instructions ได้ — บอก AI ว่าแต่ละ folder ต้องตรวจอะไร
- รองรับภาษาไทย (`language: "th"`)
- Cursor extension สำหรับ review ใน IDE

### SWOT Analysis

|                   |                                                                           |
| ----------------- | ------------------------------------------------------------------------- |
| **Strengths**     | 40+ linters ในตัว, ภาษาไทย, path-specific rules, webhook integration ง่าย |
| **Weaknesses**    | $24/dev/mo อาจแพงสำหรับทีมเล็ก, ไม่สร้าง test อัตโนมัติ                   |
| **Opportunities** | รวม SAST + linting + AI review ในที่เดียว, ลดเครื่องมือที่ต้อง maintain   |
| **Threats**       | Vendor lock-in (cloud-only), ข้อมูล code ถูกส่งไป cloud                   |

### Config ที่มีอยู่ใน project — `.coderabbit.yaml`

```yaml
language: "th" # Review เป็นภาษาไทย

reviews:
  auto_review:
    enabled: true
    drafts: false

  path_instructions:
    - path: "src/app/**"
      instructions: |
        นี่คือ Next.js App Router pages — ตรวจ:
        - Server/Client component ถูกต้องไหม
        - metadata export ครบไหม
        - loading/error boundary มีไหม
    - path: "src/components/**"
      instructions: |
        ตรวจ React components:
        - Props type ครบไหม
        - ไม่มี any type
        - Component ไม่เกิน 200 บรรทัด
    - path: "src/lib/**"
      instructions: |
        ตรวจ utility/lib functions:
        - Input validation ครบไหม
        - Error handling เหมาะสมไหม
        - ไม่มี hardcoded secrets

  profile: "assertive" # chill | assertive | strict

  path_filters:
    - "!node_modules/**"
    - "!.next/**"
    - "!package-lock.json"

chat:
  auto_reply: true
```

### Setup สำหรับ GitLab

1. ไปที่ https://coderabbit.ai → Sign up
2. เชื่อม GitLab repository
3. CodeRabbit จะ auto-review ทุก MR ผ่าน webhook
4. ปรับ `.coderabbit.yaml` ตาม project needs

---

## 2. Qodo Teams ($30/user/mo)

### จุดเด่น

- Bug detection สูงสุด (F1 score: 64.3% ตาม benchmark)
- Auto test generation — สร้าง unit test ให้อัตโนมัติ
- AST-based analysis ไม่ใช่แค่ text matching
- Cursor extension (Qodo Gen) ใช้สร้าง test ใน IDE
- PR-Agent ตัวเต็มมาในแพ็ค

### SWOT Analysis

|                   |                                                                        |
| ----------------- | ---------------------------------------------------------------------- |
| **Strengths**     | Bug detection #1, auto test gen, AST-based analysis, PR-Agent included |
| **Weaknesses**    | $30/user/mo (แพงที่สุด), ภาษาไทยยังไม่ดีเท่า CodeRabbit                |
| **Opportunities** | ลด test writing time 50%+, catch bug ก่อน deploy                       |
| **Threats**       | ราคาอาจเพิ่มขึ้น, test ที่ generate อาจต้อง review เยอะ                |

### Setup สำหรับ GitLab (ใช้ PR-Agent ใน CI/CD)

```yaml
# เพิ่มใน .gitlab-ci.yml
qodo-review:
  stage: review
  image:
    name: codiumai/pr-agent:latest
    entrypoint: [""]
  tags:
    - docker
  variables:
    CONFIG__MODEL: "gpt-4o"
    OPENAI__KEY: $OPENAI_KEY
    GITLAB__URL: $CI_SERVER_PROTOCOL://$CI_SERVER_FQDN
    GITLAB__PERSONAL_ACCESS_TOKEN: $GITLAB_PERSONAL_ACCESS_TOKEN
    CONFIG__GIT_PROVIDER: "gitlab"
  script:
    - cd "$CI_PROJECT_DIR"
    - export MR_URL="$CI_MERGE_REQUEST_PROJECT_URL/merge_requests/$CI_MERGE_REQUEST_IID"
    - python -m pr_agent.cli --pr_url="$MR_URL" describe
    - python -m pr_agent.cli --pr_url="$MR_URL" review
    - python -m pr_agent.cli --pr_url="$MR_URL" improve
  rules:
    - if: '$CI_PIPELINE_SOURCE == "merge_request_event"'
```

### Qodo Gen — Cursor Extension

1. เปิด Cursor → Extensions → ค้นหา "Qodo Gen"
2. Install + Sign in ด้วย Qodo account
3. ใช้ shortcut ใน IDE:
   - Select code → Right-click → "Generate Tests"
   - Select code → Right-click → "Explain Code"

---

## 3. PR-Agent (Free, Open-Source by Qodo)

### จุดเด่น

- Free + open-source (Apache 2.0)
- กำหนด LLM model เองได้ (ใช้ OpenRouter → Claude Sonnet 4)
- 3 คำสั่งหลัก: describe, review, improve
- Docker image พร้อมใช้

### Config ที่มีอยู่ใน project — `.gitlab-ci.yml`

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

### PR-Agent Commands

| Command    | หน้าที่                         | Output                         |
| ---------- | ------------------------------- | ------------------------------ |
| `describe` | สรุปว่า MR เปลี่ยนอะไร          | Title + summary + file changes |
| `review`   | ตรวจ code หา bug/security/style | Comment พร้อม severity         |
| `improve`  | แนะนำวิธีปรับปรุง code          | Suggestion comments            |

### GitLab CI/CD Variables ที่ต้องตั้ง

| Variable                       | ค่า                | หมายเหตุ                           |
| ------------------------------ | ------------------ | ---------------------------------- |
| `OPENAI_KEY`                   | OpenRouter API key | ใช้ `sk-or-...`                    |
| `GITLAB_PERSONAL_ACCESS_TOKEN` | GitLab PAT         | ต้องมีสิทธิ์ api + read_repository |

### Setup ใหม่สำหรับ GitLab

```bash
# 1. สร้าง OpenRouter API key
#    https://openrouter.ai/keys

# 2. สร้าง GitLab Personal Access Token
#    GitLab → Settings → Access Tokens
#    Scopes: api, read_repository

# 3. เพิ่ม CI/CD Variables ใน GitLab
#    Settings → CI/CD → Variables:
#    - OPENAI_KEY = sk-or-xxxxxxxxxx
#    - GITLAB_PERSONAL_ACCESS_TOKEN = glpat-xxxxxxxxxx

# 4. เพิ่ม pr-agent-review job ใน .gitlab-ci.yml (ดู config ด้านบน)

# 5. สร้าง MR เพื่อทดสอบ
git checkout -b test/pr-agent
git commit --allow-empty -m "test: PR-Agent integration"
git push -u origin test/pr-agent
# สร้าง MR บน GitLab → PR-Agent จะ review อัตโนมัติ
```

---

## Cost Comparison (ทีม 5 คน/เดือน)

| เครื่องมือ            | ต่อเดือน | ต่อปี  | สิ่งที่ได้เพิ่ม                  |
| --------------------- | -------- | ------ | -------------------------------- |
| **PR-Agent**          | $0       | $0     | AI review พื้นฐาน                |
| **CodeRabbit**        | $120     | $1,440 | 40+ linters, ภาษาไทย, path rules |
| **Qodo Teams**        | $150     | $1,800 | Auto test gen, bug detection #1  |
| **CodeRabbit + Qodo** | $270     | $3,240 | ทั้งหมดข้างต้น                   |

---

## แผนแนะนำ

### Phase 1 — เริ่มต้น (Free)

ใช้ **PR-Agent** ใน CI/CD (มีแล้วใน `.gitlab-ci.yml`)

### Phase 2 — เมื่อทีมโต (เลือก 1)

- **ถ้าต้องการ review ภาษาไทย + linters เยอะ** → CodeRabbit
- **ถ้าต้องการ auto test gen + bug detection สูง** → Qodo Teams

### Phase 3 — Enterprise (ใช้ทั้ง 2 ร่วมกัน)

- CodeRabbit → review code quality + SAST
- Qodo → auto test generation + bug detection

ไม่ซ้อนกันเพราะ focus ต่างกัน (overlap < 80%)

---

## Claude CLI Prompt Template

```
ตรวจ AI Code Review setup ของ project:
1. ตรวจว่า PR-Agent config ใน .gitlab-ci.yml ถูกต้องไหม
2. ตรวจว่า .coderabbit.yaml มี path_instructions ครอบคลุมทุก folder ที่สำคัญไหม
3. ตรวจว่า GitLab CI/CD variables (OPENAI_KEY, GITLAB_PERSONAL_ACCESS_TOKEN) ตั้งแล้วหรือยัง
4. สรุปว่าตอนนี้ใช้ AI review กี่ตัว และแนะนำว่าควรเพิ่มอะไร
```
