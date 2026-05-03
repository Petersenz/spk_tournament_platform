# Secret Scanning — Gitleaks + GitGuardian

> ป้องกัน API key, password, token หลุดเข้า Git repository
> 2 เครื่องมือเสริมกัน: Gitleaks (local CLI) + GitGuardian (cloud monitoring)

---

## ตาราง Comparison

| Feature                  | Gitleaks               | GitGuardian                          |
| ------------------------ | ---------------------- | ------------------------------------ |
| **ราคา**                 | Free (open-source)     | Free (individual, 1 user)            |
| **ทำงานที่**             | CLI + Git hook + CI/CD | Cloud dashboard + CLI                |
| **สแกน Git history**     | ใช่ (ทั้ง history)     | ใช่ (ทั้ง history)                   |
| **Real-time monitoring** | ไม่ (manual run)       | ใช่ (continuous)                     |
| **Patterns**             | ~150 regex patterns    | 500+ patterns                        |
| **Custom rules**         | ใช่ (.gitleaks.toml)   | ใช่ (dashboard)                      |
| **Pre-commit hook**      | ใช่                    | ใช่ (ggshield)                       |
| **ใช้ใน project**        | ใช่ (pre-commit + CI)  | ยังไม่ได้ตั้ง                        |
| **ทำไมต้องมีทั้ง 2**     | เร็ว, ทำงาน offline    | ครอบคลุมมากกว่า, มี dashboard, alert |

---

## 1. Gitleaks — Local Secret Scanner

### สิ่งที่ตั้งค่าไว้แล้วใน project

**Pre-commit hook** (`.husky/pre-commit` → `.git-hooks/pre-commit`):

- รัน secret pattern matching ทุกครั้งที่ commit
- ตรวจ patterns: `sk-or-`, `sk-ant-`, `ghp_`, `glpat-`, `AKIA`, etc.

**GitLab CI/CD** (`.gitlab-ci.yml`):

- `secret-scan` job ใน security stage
- ตรวจ tracked files ทุกครั้งที่ push

**Security scan script** (`scripts/security-scan.sh`):

- Section 1: Gitleaks scan (ถ้าติดตั้งไว้)
- Section 3: Secret pattern deep scan (8 patterns)

### ติดตั้ง Gitleaks

```bash
# macOS
brew install gitleaks

# Linux
curl -sSfL https://github.com/gitleaks/gitleaks/releases/latest/download/gitleaks_linux_x64.tar.gz \
  | tar -xz -C /usr/local/bin gitleaks

# ตรวจว่าติดตั้งแล้ว
gitleaks version
```

### วิธีใช้

```bash
# สแกน working directory (uncommitted changes)
gitleaks detect --source . --no-banner

# สแกนทั้ง git history
gitleaks detect --source . --no-banner --log-opts="--all"

# สแกนเฉพาะ staged files (สำหรับ pre-commit)
gitleaks protect --source . --no-banner --staged

# สร้าง report เป็น JSON
gitleaks detect --source . --report-format json --report-path gitleaks-report.json

# สแกนแบบ verbose (แสดง findings ละเอียด)
gitleaks detect --source . --verbose
```

### Custom Config — `.gitleaks.toml`

```toml
# เพิ่ม custom rules เฉพาะ project
[[rules]]
  id = "openrouter-key"
  description = "OpenRouter API Key"
  regex = '''sk-or-[a-zA-Z0-9]{20,}'''
  keywords = ["sk-or-"]

# Allowlist — ไฟล์ที่ไม่ต้องตรวจ
[allowlist]
  paths = [
    '''\.env\.example''',
    '''scripts/security-scan\.sh''',
    '''scripts/check-env\.sh''',
  ]
```

### ตัวอย่าง Output

```
# ไม่พบ secret
✅ No leaks found

# พบ secret
❌ Finding: OpenRouter API Key
  File: src/lib/ai.ts:15
  Secret: sk-or-v1-abc...
  Commit: 3a4b5c6
  Author: developer@example.com
```

---

## 2. GitGuardian — Continuous Secret Monitoring

### จุดเด่นที่ Gitleaks ไม่มี

- **500+ patterns** (vs ~150 ของ Gitleaks) — ครอบคลุม services มากกว่า
- **Dashboard** แสดง findings ทั้งหมดแบบ visual
- **Continuous monitoring** — ตรวจทุก push อัตโนมัติ
- **Incident management** — track ว่า secret ไหน revoked แล้ว
- **Email/Slack alerts** เมื่อพบ secret

### ราคา

| Plan              | ราคา       | รองรับ                               |
| ----------------- | ---------- | ------------------------------------ |
| Free (Individual) | $0         | 1 user, 1 workspace, unlimited scans |
| Teams             | $40/dev/mo | Team dashboard, priority support     |
| Enterprise        | Custom     | SSO, RBAC, audit logs                |

### ติดตั้ง ggshield (CLI)

```bash
# macOS
brew install gitguardian/tap/ggshield

# pip (ทุก OS)
pip install ggshield

# ตรวจว่าติดตั้งแล้ว
ggshield --version
```

### Setup

```bash
# 1. สร้าง account ที่ https://dashboard.gitguardian.com
# 2. สร้าง API key: Settings → API → Personal Access Tokens

# 3. Login
ggshield auth login

# 4. สแกน git history
ggshield secret scan repo .

# 5. สแกน pre-commit (ติดตั้ง hook)
ggshield secret scan pre-commit

# 6. สแกน CI/CD (เพิ่มใน .gitlab-ci.yml)
ggshield secret scan ci
```

### เพิ่มใน pre-commit hook

```bash
# เพิ่มใน .husky/pre-commit (หลัง gitleaks)
echo ""
echo "🛡️ GitGuardian scan..."
if command -v ggshield >/dev/null 2>&1; then
  ggshield secret scan pre-commit
fi
```

### เพิ่มใน GitLab CI/CD

```yaml
gitguardian-scan:
  stage: security
  image: gitguardian/ggshield:latest
  tags:
    - docker
  script:
    - ggshield secret scan ci
  variables:
    GITGUARDIAN_API_KEY: $GITGUARDIAN_API_KEY
  rules:
    - if: $CI_PIPELINE_SOURCE == "push"
```

---

## เมื่อพบ Secret — วิธีจัดการ

### ถ้ายังไม่ commit

1. ลบ secret ออกจาก code
2. เก็บใน `.env` (ซึ่งอยู่ใน `.gitignore`)
3. Commit ใหม่

### ถ้า commit ไปแล้ว (แต่ยังไม่ push)

```bash
# ลบ secret จาก code ก่อน แล้ว amend commit
git add -A
git commit --amend --no-edit
```

### ถ้า push ไปแล้ว (SECRET LEAKED)

1. **Revoke secret ทันที** — ไปที่ service provider แล้วสร้าง key ใหม่
2. สร้าง key ใหม่ + update `.env`
3. ลบ secret จาก code + commit
4. (Optional) Rewrite git history ด้วย `git filter-branch` หรือ BFG Repo-Cleaner

> **สำคัญ**: ถ้า secret ถูก push ไปแล้ว ถือว่า compromised เสมอ — ต้อง revoke + rotate ทันที ไม่ว่าจะลบจาก history แล้วก็ตาม

---

## Troubleshooting

| ปัญหา                   | วิธีแก้                                            |
| ----------------------- | -------------------------------------------------- |
| Gitleaks false positive | เพิ่ม path ใน `.gitleaks.toml` allowlist           |
| ggshield login ไม่ได้   | ตรวจ API key ที่ https://dashboard.gitguardian.com |
| สแกนช้ามากใน repo ใหญ่  | ใช้ `--log-opts="--since=2024-01-01"` จำกัด scope  |
| CI/CD ไม่มี gitleaks    | ใช้ Docker image: `zricethezav/gitleaks:latest`    |

---

## Claude CLI Prompt Template

```
ตรวจ secret leak ใน project:
1. รัน `gitleaks detect --source . --no-banner` (ถ้าติดตั้งไว้)
2. รัน `bash scripts/security-scan.sh` ดู section 1 (Secret Leak) และ section 3 (Pattern Scan)
3. สรุปว่าพบ potential leak กี่จุด ไฟล์ไหน pattern อะไร
4. ถ้าพบ — บอกว่าเป็น false positive หรือ real leak
5. ถ้าเป็น real leak — แนะนำขั้นตอน: revoke → rotate → cleanup
```
