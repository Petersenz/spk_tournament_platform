# QA-QC Master — Installation Guide

> คู่มือติดตั้ง QA-QC_Master ไปยังโปรเจกต์ใหม่
> ใช้เวลาประมาณ 30-60 นาที สำหรับ full setup

---

## 1. Prerequisites

ตรวจสอบว่ามีเครื่องมือเหล่านี้ก่อนเริ่ม:

| เครื่องมือ     | เวอร์ชันขั้นต่ำ | ตรวจสอบด้วย                | ติดตั้ง                                                       |
| -------------- | --------------- | -------------------------- | ------------------------------------------------------------- |
| Node.js        | 20+             | `node -v`                  | [nodejs.org](https://nodejs.org/) หรือ `brew install node`    |
| npm            | 10+             | `npm -v`                   | มาพร้อม Node.js                                               |
| Docker         | 24+             | `docker -v`                | [docker.com](https://www.docker.com/products/docker-desktop/) |
| Docker Compose | 2.20+           | `docker compose version`   | มาพร้อม Docker Desktop                                        |
| Git            | 2.40+           | `git -v`                   | `brew install git`                                            |
| Cursor IDE     | Latest          | เปิด Cursor → Help → About | [cursor.com](https://www.cursor.com/)                         |
| Claude CLI     | Latest          | `claude --version`         | `npm install -g @anthropic-ai/claude-code`                    |

### ตรวจสอบทั้งหมดในคำสั่งเดียว

```bash
echo "Node: $(node -v)" && \
echo "npm: $(npm -v)" && \
echo "Docker: $(docker -v)" && \
echo "Git: $(git -v)" && \
echo "Claude: $(claude --version 2>/dev/null || echo 'NOT INSTALLED')"
```

---

## 2. Quick Start

### Step 1: Copy QA-QC_Master folder

```bash
# จาก Master ViberQC ไปยังโปรเจกต์ใหม่
cp -r /path/to/Master\ ViberQC/QA-QC_Master /path/to/your-project/QA-QC_Master
```

### Step 2: เพิ่ม \_credentials.md ใน .gitignore

```bash
cd /path/to/your-project

# เพิ่มใน .gitignore
echo "" >> .gitignore
echo "# QA-QC Credentials (ห้าม commit)" >> .gitignore
echo "_credentials.md" >> .gitignore
echo "QA-QC_Master/_credentials.md" >> .gitignore
```

### Step 3: ตั้งค่า credentials

```bash
# เปิดไฟล์ credentials แล้วใส่ค่าจริงแทน YOUR_xxx_HERE
# ใช้ editor ที่ถนัด:
cursor QA-QC_Master/_credentials.md
```

### Step 4: ติดตั้ง npm packages

```bash
# ติดตั้ง dependencies ทั้งหมด (ดูรายละเอียดใน section 3)
npm install
```

---

## 3. Tool Installation Commands

### 3.1 npm Packages (Dev Dependencies)

```bash
# === Code Quality ===
npm install -D eslint prettier eslint-config-prettier
npm install -D depcheck madge jscpd
npm install -D html-validate

# === Testing ===
npm install -D vitest @vitest/coverage-v8
npm install -D playwright @playwright/test
npx playwright install  # ติดตั้ง browser binaries

# === Accessibility Testing ===
npm install -D @axe-core/playwright pa11y

# === Git Hooks ===
npm install -D husky commitlint @commitlint/cli @commitlint/config-conventional

# === Security ===
npm install -D gitleaks  # หรือติดตั้งผ่าน brew (ดู section 3.2)

# === Performance ===
npm install -D lighthouse

# === Error Tracking (Production dependency) ===
npm install @sentry/node @sentry/browser
```

#### ติดตั้งทั้งหมดในคำสั่งเดียว

```bash
npm install -D \
  eslint prettier eslint-config-prettier \
  depcheck madge jscpd html-validate \
  vitest @vitest/coverage-v8 \
  playwright @playwright/test @axe-core/playwright pa11y \
  husky commitlint @commitlint/cli @commitlint/config-conventional \
  lighthouse

npm install @sentry/node @sentry/browser

npx playwright install
```

### 3.2 Brew Packages (macOS)

```bash
# === Security ===
brew install gitleaks        # Secret detection ใน git history
brew install snyk-cli        # Vulnerability scanner (หรือ npm install -g snyk)

# === Performance ===
brew install k6              # Load testing

# === SSL Testing ===
brew install testssl         # SSL/TLS configuration testing

# === SEO ===
# Screaming Frog — ดาวน์โหลดจาก https://www.screamingfrog.co.uk/seo-spider/
# (ไม่มีใน brew)

# === API Testing ===
brew install --cask bruno    # API client (ทดแทน Postman)
```

#### ติดตั้งทั้งหมดในคำสั่งเดียว

```bash
brew install gitleaks snyk-cli k6 testssl && \
brew install --cask bruno
```

### 3.3 Docker Services

สำหรับ monitoring stack และ security scanning:

```bash
# === Monitoring Stack (Prometheus + Grafana + Loki) ===
# สร้างไฟล์ docker-compose.monitoring.yml แล้วรัน:
docker compose -f docker-compose.monitoring.yml up -d

# === Security Scanning ===
# OWASP ZAP — baseline scan
docker run -t zaproxy/zap-stable zap-baseline.py -t https://your-site.com

# === Uptime Monitoring ===
# Uptime Kuma — self-hosted uptime monitor
docker run -d \
  --name uptime-kuma \
  -p 3001:3001 \
  -v uptime-kuma:/app/data \
  louislam/uptime-kuma:1

# === SonarQube ===
docker run -d \
  --name sonarqube \
  -p 9000:9000 \
  sonarqube:community
```

### 3.4 VS Code / Cursor Extensions

| Extension ID                            | หมวด            |
| --------------------------------------- | --------------- |
| `dbaeumer.vscode-eslint`                | Code Quality    |
| `esbenp.prettier-vscode`                | Formatter       |
| `SonarSource.sonarlint-vscode`          | Static Analysis |
| `vitest.explorer`                       | Unit Testing    |
| `ms-playwright.playwright`              | E2E Testing     |
| `Qodo.qodo-gen`                         | AI Review       |
| `streetsidesoftware.code-spell-checker` | Spell Check     |
| `usernamehw.errorlens`                  | Error Display   |

ติดตั้งผ่าน terminal: `cursor --install-extension <ID>`

### 3.5 Online Tools (ไม่ต้องติดตั้ง — เปิด URL ใช้งานเลย)

| Tool                    | URL                                                                                   | ใช้ทำอะไร                  |
| ----------------------- | ------------------------------------------------------------------------------------- | -------------------------- |
| Mozilla Observatory     | [observatory.mozilla.org](https://observatory.mozilla.org/)                           | ตรวจ security headers      |
| SSL Labs                | [ssllabs.com/ssltest](https://www.ssllabs.com/ssltest/)                               | ตรวจ SSL/TLS configuration |
| PageSpeed Insights      | [pagespeed.web.dev](https://pagespeed.web.dev/)                                       | ตรวจ performance score     |
| WebAIM Contrast Checker | [webaim.org/resources/contrastchecker](https://webaim.org/resources/contrastchecker/) | ตรวจ color contrast ratio  |
| WAVE                    | [wave.webaim.org](https://wave.webaim.org/)                                           | ตรวจ accessibility         |
| Nu HTML Checker         | [validator.w3.org/nu](https://validator.w3.org/nu/)                                   | ตรวจ HTML validity         |
| Google Search Console   | [search.google.com/search-console](https://search.google.com/search-console/)         | ตรวจ SEO + indexing        |
| GitGuardian             | [dashboard.gitguardian.com](https://dashboard.gitguardian.com/)                       | ตรวจ secret leaks          |

---

## 4. GitLab Integration

### 4.1 CodeRabbit Setup (GitLab)

**Step 1:** สมัครบัญชีที่ [app.coderabbit.ai](https://app.coderabbit.ai/)

**Step 2:** เชื่อมต่อ GitLab instance

```
1. ไปที่ CodeRabbit → Settings → Integrations
2. เลือก "GitLab Self-Managed"
3. ใส่ GitLab URL: https://gitlab.dev.jigsawgroups.work
4. ใส่ Personal Access Token (scope: api, read_api)
5. เลือก repository ที่ต้องการ
```

**Step 3:** สร้างไฟล์ `.coderabbit.yaml` ที่ root ของ project

```yaml
# .coderabbit.yaml
language: "th"
reviews:
  auto_review:
    enabled: true
    base_branches:
      - main
      - develop
  path_instructions:
    - path: "src/**"
      instructions: "Review for TypeScript best practices and security"
    - path: "**/*.test.*"
      instructions: "Ensure proper test coverage and assertions"
chat:
  auto_reply: true
```

**Step 4:** ตั้ง webhook ใน GitLab

```
1. GitLab → Project → Settings → Webhooks
2. URL: ใส่ webhook URL จาก CodeRabbit dashboard
3. Trigger: Merge request events, Push events, Comments
4. SSL verification: Enable
5. Save
```

### 4.2 Qodo / PR-Agent Setup (GitLab)

**Option A: ใช้ Qodo Cloud**

```
1. สมัครที่ app.qodo.ai
2. เชื่อมต่อ GitLab self-hosted instance
3. ติดตั้ง Qodo extension ใน Cursor IDE
4. ใส่ API key ใน extension settings
```

**Option B: Self-hosted PR-Agent ผ่าน GitLab CI**

สร้างไฟล์ `.gitlab-ci.yml` (เพิ่ม stage):

```yaml
# เพิ่มใน .gitlab-ci.yml
pr-agent-review:
  stage: review
  image: codiumai/pr-agent:latest
  variables:
    OPENAI_KEY: $QODO_API_KEY
    GITLAB_PERSONAL_ACCESS_TOKEN: $GITLAB_PERSONAL_ACCESS_TOKEN
    GITLAB_URL: "https://gitlab.dev.jigsawgroups.work"
  script:
    - pr-agent --pr_url="$CI_MERGE_REQUEST_IID" review
    - pr-agent --pr_url="$CI_MERGE_REQUEST_IID" improve
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
```

สร้างไฟล์ `.pr_agent.toml`:

```toml
[config]
model = "claude-3-5-sonnet"
fallback_models = ["gpt-4o"]

[pr_reviewer]
require_score_review = true
require_tests_review = true
require_security_review = true

[pr_description]
publish_labels = true
add_original_user_description = true

[pr_code_suggestions]
num_code_suggestions = 4
```

### 4.3 GitLab CI/CD — QA-QC Pipeline

เพิ่ม stages ใน `.gitlab-ci.yml`: `quality`, `security`, `test`, `review`

| Stage    | Job       | Image                          | คำสั่งหลัก                             |
| -------- | --------- | ------------------------------ | -------------------------------------- |
| quality  | lint      | `node:20`                      | `npm ci && npm run lint`               |
| security | snyk-scan | `snyk/snyk:node`               | `snyk test --severity-threshold=high`  |
| security | npm-audit | `node:20`                      | `npm audit --audit-level=high`         |
| security | gitleaks  | `zricethezav/gitleaks`         | `gitleaks detect --source . --verbose` |
| test     | unit-test | `node:20`                      | `npm run test -- --coverage`           |
| test     | e2e-test  | `mcr.microsoft.com/playwright` | `npx playwright test`                  |
| review   | pr-agent  | `codiumai/pr-agent`            | `pr-agent review + improve`            |

> ทุก job ใช้ rule: `if: $CI_PIPELINE_SOURCE == "merge_request_event"` หรือ `if: $CI_MERGE_REQUEST_IID`

### CI/CD Variables ที่ต้องตั้งใน GitLab

ตั้งค่าที่: GitLab → Project → Settings → CI/CD → Variables

| Variable                       | Protected | Masked |
| ------------------------------ | --------- | ------ |
| `SNYK_TOKEN`                   | Yes       | Yes    |
| `SENTRY_AUTH_TOKEN`            | Yes       | Yes    |
| `CODERABBIT_API_KEY`           | Yes       | Yes    |
| `QODO_API_KEY`                 | Yes       | Yes    |
| `GITLAB_PERSONAL_ACCESS_TOKEN` | Yes       | Yes    |

---

## 5. Verification Checklist

หลังติดตั้งเสร็จ รันคำสั่งตรวจสอบทีละหมวด:

```bash
# Code Quality
npx eslint src/ --max-warnings=0
npx prettier --check "src/**/*.{ts,tsx,js,jsx}"
npx depcheck
npx madge --circular src/

# Security
npm audit --audit-level=high
gitleaks detect --source .
snyk test

# Testing
npm run test
npx playwright test

# Git Hooks
ls .husky/pre-commit

# Credentials ไม่ถูก track
grep "_credentials.md" .gitignore
```

### สรุป Checklist

| หมวด             | ตรวจสอบ                  | สถานะ |
| ---------------- | ------------------------ | ----- |
| ESLint           | ไม่มี error              | ⬜    |
| Prettier         | format ถูกต้อง           | ⬜    |
| depcheck         | ไม่มี unused deps        | ⬜    |
| npm audit        | ไม่มี high vulnerability | ⬜    |
| Gitleaks         | ไม่มี secret leak        | ⬜    |
| Vitest           | unit tests ผ่าน          | ⬜    |
| Playwright       | e2e tests ผ่าน           | ⬜    |
| Husky            | hooks ทำงาน              | ⬜    |
| \_credentials.md | อยู่ใน .gitignore        | ⬜    |
| CodeRabbit       | webhook ทำงาน            | ⬜    |
| GitLab CI        | pipeline ผ่าน            | ⬜    |

> เปลี่ยน ⬜ เป็น ✅ เมื่อตรวจสอบผ่านแต่ละข้อ

---

## Troubleshooting

### ปัญหาที่พบบ่อย

| ปัญหา                            | สาเหตุ                      | วิธีแก้                                           |
| -------------------------------- | --------------------------- | ------------------------------------------------- |
| `npx playwright test` error      | ยังไม่ได้ติดตั้ง browsers   | รัน `npx playwright install --with-deps`          |
| `gitleaks: command not found`    | ยังไม่ได้ติดตั้ง            | `brew install gitleaks`                           |
| `snyk test` authentication error | ยังไม่ได้ login             | รัน `snyk auth` แล้ว login ผ่าน browser           |
| Husky hooks ไม่ทำงาน             | ยังไม่ได้ init              | รัน `npx husky install`                           |
| CodeRabbit ไม่ review MR         | webhook ไม่ถูกต้อง          | ตรวจ webhook URL + events ใน GitLab settings      |
| Docker permission denied         | user ไม่อยู่ใน docker group | `sudo usermod -aG docker $USER` แล้ว logout/login |
| SonarQube ไม่ขึ้น                | port 9000 ถูกใช้            | เปลี่ยน port: `-p 9001:9000`                      |

---

> **เมื่อติดตั้งเสร็จ** ให้รัน `npm run quality` เพื่อตรวจ score รวม
> เป้าหมาย: Grade A (80+ คะแนน) ขึ้นไป
