# GitLab CI/CD Pipeline

> 5 Stages: Security → Build → Test → Review → Deploy
> ไฟล์: `.gitlab-ci.yml` ที่ project root

---

## Pipeline Overview

```
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│ Security  │──│  Build    │──│  Test     │──│  Review   │──│  Deploy   │
│           │  │           │  │           │  │           │  │           │
│ - secret  │  │ - install │  │ - test    │  │ - PR-Agent│  │ - VPS     │
│   scan    │  │ - build   │  │ - lint    │  │   (AI)    │  │   deploy  │
│ - env     │  │           │  │ - quality │  │           │  │ (manual)  │
│   check   │  │           │  │ - SAST    │  │           │  │           │
│           │  │           │  │ - dep     │  │           │  │           │
│           │  │           │  │   audit   │  │           │  │           │
└──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘
```

---

## Runners

| Runner              | Executor |   Tag    | ใช้สำหรับ                     |
| ------------------- | -------- | :------: | ----------------------------- |
| personalclaw-runner | Shell    |  `vps`   | Build, Test, Deploy (default) |
| docker-runner       | Docker   | `docker` | SAST, PR-Agent                |

> Default ใช้ shell executor (tag: `vps`)
> Jobs ที่ต้อง Docker image ใช้ tag: `docker`

---

## Cache

```yaml
cache:
  key: deps-$CI_COMMIT_REF_SLUG
  paths:
    - node_modules/
```

Cache `node_modules/` แยกตาม branch — ลดเวลา `npm install`

---

## Stage 1: Security

### Job: secret-scan

| Setting           | Value                  |
| ----------------- | ---------------------- |
| **Trigger**       | ทุก push               |
| **allow_failure** | false (block pipeline) |

ตรวจหา patterns:

- `sk-or-` (OpenRouter)
- `sk-ant-` (Anthropic)
- `sk-` (OpenAI)
- `ghp_` (GitHub PAT)
- `glpat-` (GitLab PAT)

ค้นหาใน `.js`, `.ts`, `.json`, `.yml`, `.md`, `.sh` (ยกเว้น `node_modules`, `.example`, `.git`)

ถ้าเจอ secret → **pipeline ล้มทันที**

### Job: env-check

| Setting     | Value    |
| ----------- | -------- |
| **Trigger** | ทุก push |

ตรวจว่าไฟล์ `.env` ไม่ได้ถูก track ใน Git

---

## Stage 2: Build

### Job: install-deps

| Setting       | Value                             |
| ------------- | --------------------------------- |
| **Command**   | `npm ci` (fallback `npm install`) |
| **Artifacts** | `node_modules/` (expire 1 hour)   |

### Job: build

| Setting       | Value                            |
| ------------- | -------------------------------- |
| **Needs**     | install-deps                     |
| **Command**   | `npm run build`                  |
| **Artifacts** | `dist/`, `build/` (expire 1 day) |

---

## Stage 3: Test

### Job: test

| Setting     | Value               |
| ----------- | ------------------- |
| **Needs**   | install-deps        |
| **Command** | `npm test` (Vitest) |

### Job: lint

| Setting           | Value                              |
| ----------------- | ---------------------------------- |
| **Needs**         | install-deps                       |
| **Command**       | `npm run lint` (ESLint + Prettier) |
| **allow_failure** | false (block pipeline)             |

### Job: quality-gate

| Setting           | Value                                                                              |
| ----------------- | ---------------------------------------------------------------------------------- |
| **Trigger**       | ทุก push                                                                           |
| **Commands**      | `bash scripts/quality-gate.sh --notify` + `bash scripts/security-scan.sh --notify` |
| **Artifacts**     | `.cursor/plans/quality-report-*.md` (expire 7 days)                                |
| **allow_failure** | true (advisory)                                                                    |

### Job: code-quality-scan

| Setting           | Value                               |
| ----------------- | ----------------------------------- |
| **Trigger**       | ทุก push                            |
| **Command**       | `bash scripts/code-quality-scan.sh` |
| **allow_failure** | true (advisory)                     |

### Job: dependency-audit

| Setting           | Value                          |
| ----------------- | ------------------------------ |
| **Trigger**       | เฉพาะ push ไป `main` branch    |
| **Command**       | `npm audit --audit-level=high` |
| **allow_failure** | false (block pipeline)         |

### Job: sast (GitLab Built-in)

| Setting    | Value                                   |
| ---------- | --------------------------------------- |
| **Source** | `template: Security/SAST.gitlab-ci.yml` |
| **Runner** | Docker executor (tag: `docker`)         |

GitLab SAST ใช้ semgrep, eslint-plugin-security, etc.

---

## Stage 4: Review (AI)

### Job: pr-agent-review

| Setting     | Value                           |
| ----------- | ------------------------------- |
| **Trigger** | เฉพาะ Merge Request events      |
| **Image**   | `codiumai/pr-agent:latest`      |
| **Runner**  | Docker executor (tag: `docker`) |
| **Model**   | Claude Sonnet 4 via OpenRouter  |

PR-Agent ทำ 3 อย่าง:

| Command    | ทำอะไร                    |
| ---------- | ------------------------- |
| `describe` | สรุป MR changes อัตโนมัติ |
| `review`   | Review code + หา bugs     |
| `improve`  | เสนอ improvements         |

### Environment Variables ที่ต้องตั้ง (GitLab CI/CD Variables)

| Variable                       | ค่า                | Protected | Masked |
| ------------------------------ | ------------------ | :-------: | :----: |
| `GITLAB_PERSONAL_ACCESS_TOKEN` | GitLab PAT         |    Yes    |  Yes   |
| `OPENAI_KEY`                   | OpenRouter API Key |    Yes    |  Yes   |

---

## Stage 5: Deploy

### Job: deploy-production

| Setting         | Value                              |
| --------------- | ---------------------------------- |
| **Trigger**     | Push to `main` branch              |
| **When**        | **manual** (ต้องกดปุ่ม Deploy เอง) |
| **Needs**       | build, test, secret-scan           |
| **Environment** | production                         |

Deploy ทำอะไร:

1. `git fetch origin main`
2. `git checkout main`
3. `git pull origin main`

Deploy ไปที่ VPS:

- Path: `$DEPLOY_PATH` (default: `/home/linux-nat/personalclaw-project`)
- URL: `http://${VPS_HOST}:18789`

### Variables ที่ต้องตั้ง

| Variable      | ค่า                |
| ------------- | ------------------ |
| `DEPLOY_PATH` | Path บน VPS        |
| `VPS_HOST`    | IP address ของ VPS |

---

## Pipeline Diagram (Full)

```
push to any branch:
  secret-scan ──┐
  env-check ────┤
                ▼
  install-deps ─┬──▶ build
                │
                ├──▶ test
                ├──▶ lint
                ├──▶ quality-gate (advisory)
                ├──▶ code-quality-scan (advisory)
                └──▶ sast (Docker)

push to main branch:
  + dependency-audit
  + deploy-production (manual trigger)

merge request:
  + pr-agent-review (Docker, AI)
```

---

## Troubleshooting

| ปัญหา                   | สาเหตุ                        | วิธีแก้                   |
| ----------------------- | ----------------------------- | ------------------------- |
| secret-scan failed      | มี API key ใน code            | ลบ key + ใช้ env variable |
| lint failed             | Code ไม่ผ่าน ESLint           | `npm run lint:fix`        |
| build failed            | TypeScript error              | ดู error log + แก้ type   |
| dependency-audit failed | vulnerability ใน npm packages | `npm audit fix`           |
| pr-agent-review ไม่รัน  | ไม่ใช่ MR event               | ปกติ — รันเฉพาะ MR        |
| deploy failed           | DEPLOY_PATH ไม่ถูก            | ตั้ง CI/CD variable       |

---

## Checklist

- [ ] ตั้ง GitLab CI/CD Variables ครบ
- [ ] ทดสอบ: push → pipeline ผ่าน security + build + test
- [ ] ทดสอบ: สร้าง MR → PR-Agent review ขึ้นมา
- [ ] ทดสอบ: deploy manual trigger ทำงาน
- [ ] ตรวจว่า artifacts เก็บ quality reports
