# SCA — Dependency Security

> Software Composition Analysis — ตรวจว่า dependencies มี known vulnerabilities (CVE) หรือไม่
> 4 เครื่องมือตาม use case ต่างกัน: Snyk, npm audit, FOSSA, OSV-Scanner

---

## ตาราง Comparison

| Feature              | Snyk                 | npm audit             | FOSSA              | OSV-Scanner             |
| -------------------- | -------------------- | --------------------- | ------------------ | ----------------------- |
| **ราคา**             | Free (limited)       | Free (built-in)       | Free (limited)     | Free (Google)           |
| **Focus**            | Deep SCA + container | npm vulnerabilities   | License compliance | Google vulnerability DB |
| **Auto-fix**         | ใช่ (`snyk fix`)     | ใช่ (`npm audit fix`) | ไม่                | ไม่                     |
| **License check**    | ใช่                  | ไม่                   | ใช่ (เด่นที่สุด)   | ไม่                     |
| **Container scan**   | ใช่                  | ไม่                   | ไม่                | ใช่                     |
| **IDE extension**    | ใช่ (VS Code)        | ไม่                   | ไม่                | ไม่                     |
| **Vulnerability DB** | Snyk DB (ใหญ่สุด)    | npm advisory DB       | FOSSA DB           | OSV.dev (Google)        |
| **ใช้ใน project**    | ยังไม่ได้ตั้ง        | ใช่ (CI + pre-push)   | ยังไม่ได้ตั้ง      | ยังไม่ได้ตั้ง           |

---

## 1. Snyk CLI — Deep SCA + Container Scanning

### จุดเด่น

- **Vulnerability DB ใหญ่ที่สุด** — ครอบคลุมกว่า npm audit
- **Auto-fix** — สร้าง PR ที่ upgrade dependency ให้อัตโนมัติ
- **Container scanning** — สแกน Docker image
- **IDE extension** — แสดง vulnerability ขณะเขียน code
- **License compliance** — ตรวจ license ของทุก dependency

### ราคา

| Plan       | ราคา       | Limits                          |
| ---------- | ---------- | ------------------------------- |
| Free       | $0         | 200 tests/mo, 1 user            |
| Team       | $25/dev/mo | Unlimited tests, priority fixes |
| Enterprise | Custom     | SSO, RBAC, compliance reports   |

### ติดตั้ง

```bash
# macOS
brew install snyk

# npm (ทุก OS)
npm install -g snyk

# ตรวจว่าติดตั้งแล้ว
snyk --version
```

### Setup

```bash
# 1. Login (เปิด browser)
snyk auth

# 2. สแกน project dependencies
snyk test

# 3. สแกนพร้อมแสดง dependency tree
snyk test --all-projects

# 4. Monitor (track vulnerabilities ต่อเนื่อง)
snyk monitor
```

### วิธีใช้

```bash
# สแกน npm dependencies
snyk test

# สแกนพร้อม auto-fix suggestions
snyk fix

# สแกนเฉพาะ high + critical
snyk test --severity-threshold=high

# สแกน Docker image
snyk container test node:20-alpine

# สแกน Infrastructure as Code
snyk iac test

# สร้าง report เป็น JSON
snyk test --json > snyk-report.json
```

### ตัวอย่าง Output

```
Testing /path/to/project...

✗ High severity vulnerability found in lodash
  Description: Prototype Pollution
  Info: https://snyk.io/vuln/SNYK-JS-LODASH-590103
  Introduced through: package-a@1.0.0 > lodash@4.17.15
  Fix: Upgrade to lodash@4.17.21

Organization: your-org
Package manager: npm
Target file: package.json
Open source: no
Licenses: enabled

Tested 142 dependencies for known vulnerabilities
Found 3 vulnerabilities (1 critical, 1 high, 1 medium)
```

### เพิ่มใน GitLab CI/CD

```yaml
snyk-scan:
  stage: security
  image: snyk/snyk:node
  tags:
    - docker
  script:
    - snyk auth $SNYK_TOKEN
    - snyk test --severity-threshold=high
  variables:
    SNYK_TOKEN: $SNYK_TOKEN
  allow_failure: true
  rules:
    - if: $CI_PIPELINE_SOURCE == "push"
```

---

## 2. npm audit — Built-in Vulnerability Scanner

### สิ่งที่ตั้งค่าไว้แล้วใน project

**package.json:**

```json
{
  "scripts": {
    "audit": "npm audit --audit-level=high"
  }
}
```

**GitLab CI/CD** (`.gitlab-ci.yml`):

```yaml
dependency-audit:
  stage: test
  script:
    - npm audit --audit-level=high
  allow_failure: false
  rules:
    - if: $CI_COMMIT_BRANCH == "main"
```

**Pre-push hook** (`scripts/dependency-audit.sh`): รันทุกครั้งก่อน push

### วิธีใช้

```bash
# สแกนทั้งหมด
npm audit

# สแกนเฉพาะ high + critical
npm audit --audit-level=high

# Auto-fix (upgrade compatible versions)
npm audit fix

# Force fix (อาจ breaking changes)
npm audit fix --force

# สร้าง report เป็น JSON
npm audit --json > npm-audit-report.json
```

### ตัวอย่าง Output

```
# npm audit report

lodash  <4.17.21
Severity: high
Prototype Pollution - https://github.com/advisories/GHSA-jf85-cpcp-j695
fix available via `npm audit fix`

3 vulnerabilities (1 moderate, 1 high, 1 critical)
```

### ข้อจำกัดเทียบกับ Snyk

| npm audit              | Snyk                        |
| ---------------------- | --------------------------- |
| ตรวจเฉพาะ npm packages | ตรวจ npm + Docker + IaC     |
| ใช้ npm advisory DB    | ใช้ Snyk DB (ใหญ่กว่า ~20%) |
| ไม่มี license check    | มี license check            |
| ไม่มี IDE extension    | มี VS Code extension        |

---

## 3. FOSSA — License Compliance

### จุดเด่น

- **License compliance** ตัวเดียวที่ทำได้ดีที่สุด
- ตรวจว่า dependency ใช้ license อะไร (MIT, Apache, GPL, AGPL)
- แจ้งเตือนเมื่อมี license ที่ไม่ compatible กับ project
- สำคัญสำหรับ commercial product (ต้องไม่ใช้ GPL/AGPL)

### ราคา

| Plan         | ราคา                          |
| ------------ | ----------------------------- |
| Free (Teams) | $0 (5 projects, 100 scans/mo) |
| Business     | Custom pricing                |

### ติดตั้ง + ใช้งาน

```bash
# ติดตั้ง
curl -H 'Cache-Control: no-cache' https://raw.githubusercontent.com/fossas/fossa-cli/master/install-latest.sh | bash

# Login
export FOSSA_API_KEY=your-key-here

# สแกน
fossa analyze

# ตรวจ license compliance
fossa test
```

### เมื่อไหร่ต้องใช้

- เมื่อ project เป็น **commercial product** (ขายเงิน)
- เมื่อต้อง comply กับ **SOC 2 / ISO 27001**
- เมื่อต้องส่ง **compliance report** ให้ลูกค้า

---

## 4. OSV-Scanner — Google's Vulnerability Database

### จุดเด่น

- **Google maintain** — ข้อมูลจาก OSV.dev (Open Source Vulnerabilities)
- **ครอบคลุมหลาย ecosystem** — npm, pip, Go, Rust, Maven, etc.
- **Free + open-source** — ไม่มีข้อจำกัด
- **เร็วมาก** — สแกนจาก lockfile

### ติดตั้ง

```bash
# macOS
brew install osv-scanner

# Go
go install github.com/google/osv-scanner/cmd/osv-scanner@latest

# ตรวจว่าติดตั้งแล้ว
osv-scanner --version
```

### วิธีใช้

```bash
# สแกนจาก lockfile
osv-scanner --lockfile package-lock.json

# สแกนทั้ง directory
osv-scanner -r .

# สร้าง report เป็น JSON
osv-scanner --lockfile package-lock.json --format json > osv-report.json

# สแกน Docker image
osv-scanner --docker node:20-alpine
```

---

## แผนแนะนำ

| ลำดับ | เครื่องมือ              | เหมาะกับ                                     |
| ----- | ----------------------- | -------------------------------------------- |
| 1     | **npm audit** (ใช้แล้ว) | ทุก project — built-in, ไม่ต้องติดตั้ง       |
| 2     | **Snyk**                | เมื่อต้องการ deep SCA + auto-fix + IDE       |
| 3     | **OSV-Scanner**         | เมื่อต้องการ free + ครอบคลุม + Google DB     |
| 4     | **FOSSA**               | เมื่อต้องการ license compliance (commercial) |

---

## Troubleshooting

| ปัญหา                                       | วิธีแก้                                   |
| ------------------------------------------- | ----------------------------------------- |
| npm audit fix ทำ breaking changes           | ใช้ `npm audit fix` ไม่ใช้ `--force`      |
| Snyk ไม่พบ vulnerabilities ที่ npm audit พบ | DB ต่างกัน — ใช้ทั้ง 2 เป็น complementary |
| OSV-Scanner ไม่รู้จัก lockfile              | ระบุ path: `--lockfile package-lock.json` |
| FOSSA API key expired                       | สร้างใหม่ที่ https://app.fossa.com        |

---

## Claude CLI Prompt Template

```
ตรวจ dependency security:
1. รัน `npm audit` สรุปจำนวน vulnerabilities แยกตาม severity
2. รัน `npx snyk test` (ถ้าติดตั้งไว้) สรุปผล
3. เปรียบเทียบผลจาก npm audit กับ Snyk — มี CVE ไหนที่ตัวหนึ่งเจอแต่อีกตัวไม่เจอ
4. สรุปเป็นตาราง: Package | CVE | Severity | Fix Available?
5. ถ้ามี fix — เสนอ command สำหรับ auto-fix
6. ถ้า fix ไม่ได้ — เสนอ workaround (alternative package, manual patch)
```
