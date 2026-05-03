# SAST — SonarQube + Semgrep

> Static Application Security Testing — ตรวจ source code หาช่องโหว่ด้าน security
> 2 เครื่องมือเสริมกัน: SonarQube (broad coverage) + Semgrep (custom rules)

---

## ตาราง Comparison

| Feature              | SonarQube CE                            | Semgrep                               |
| -------------------- | --------------------------------------- | ------------------------------------- |
| **ราคา**             | Free (self-hosted Docker)               | Free (<=10 contributors)              |
| **Focus**            | Code quality + SAST รวม                 | Security rules เฉพาะทาง               |
| **Languages**        | 30+ ภาษา                                | 30+ ภาษา                              |
| **Custom rules**     | จำกัด (Community Edition)               | ง่ายมาก (YAML syntax)                 |
| **Dashboard**        | ใช่ (web UI สวยงาม)                     | ใช่ (Semgrep Cloud)                   |
| **IDE integration**  | SonarLint extension                     | Semgrep CLI + VS Code                 |
| **CI/CD**            | sonar-scanner Docker                    | semgrep scan --config auto            |
| **OWASP Top 10**     | ครอบคลุมบางส่วน                         | ครอบคลุมดี                            |
| **ใช้ใน project**    | ใช่ (Docker + sonar-project.properties) | ยังไม่ได้ตั้ง                         |
| **ทำไมต้องมีทั้ง 2** | Broad code quality + basic SAST         | Deep security rules + custom patterns |

---

## 1. SonarQube — Broad SAST + Code Quality

> ดูรายละเอียดเต็มที่ [../01-code-quality/sonarqube.md](../01-code-quality/sonarqube.md)

### สรุปสั้นๆ สำหรับ SAST

SonarQube ตรวจ security ในหมวดเหล่านี้:

| หมวด                  | ตัวอย่าง                                        |
| --------------------- | ----------------------------------------------- |
| **Vulnerabilities**   | SQL injection, XSS, path traversal              |
| **Security Hotspots** | Hardcoded credentials, weak crypto, CORS config |
| **OWASP Top 10**      | A01-A10 (บางส่วนใน Community Edition)           |

### วิธีใช้ (SAST focus)

```bash
# เปิด SonarQube
npm run sonar:up

# สแกน
npm run sonar:scan

# ดูผล security ที่ dashboard
# http://localhost:9000/project/issues?id=viberqc&types=VULNERABILITY
# http://localhost:9000/project/security_hotspots?id=viberqc
```

### ข้อจำกัดของ Community Edition

- ไม่มี branch analysis (ตรวจได้แค่ main branch)
- ไม่มี OWASP dependency check (ต้องใช้ Developer Edition ขึ้นไป)
- Custom rules จำกัด — ต้องใช้ Semgrep เสริม

---

## 2. Semgrep — Custom Security Rules

### จุดเด่น

- **เขียน rules เป็น YAML** — ง่ายกว่า regex, เข้าใจ AST
- **Semgrep Registry** — มี community rules พร้อมใช้ 3,000+ rules
- **Fast** — สแกนได้เร็วกว่า SonarQube สำหรับ security-only scan
- **ปรับ rules ตาม project** — เขียน rules เฉพาะ Next.js, React, Node.js

### ติดตั้ง

```bash
# macOS
brew install semgrep

# pip (ทุก OS)
pip install semgrep

# ตรวจว่าติดตั้งแล้ว
semgrep --version
```

### วิธีใช้

```bash
# สแกนด้วย rules อัตโนมัติ (auto-detect language)
semgrep scan --config auto

# สแกนเฉพาะ security rules
semgrep scan --config p/security-audit

# สแกนเฉพาะ OWASP Top 10
semgrep scan --config p/owasp-top-ten

# สแกนเฉพาะ TypeScript/JavaScript
semgrep scan --config p/typescript --config p/javascript

# สแกนเฉพาะ React + Next.js
semgrep scan --config p/react --config p/nextjs

# สร้าง report เป็น JSON
semgrep scan --config auto --json -o semgrep-report.json

# สแกนเฉพาะ src/ directory
semgrep scan --config auto src/
```

### Semgrep Rule Packs ที่แนะนำ

| Pack               | คำสั่ง                      | ตรวจอะไร                        |
| ------------------ | --------------------------- | ------------------------------- |
| `p/security-audit` | `--config p/security-audit` | Security vulnerabilities ทั่วไป |
| `p/owasp-top-ten`  | `--config p/owasp-top-ten`  | OWASP Top 10                    |
| `p/typescript`     | `--config p/typescript`     | TypeScript best practices       |
| `p/react`          | `--config p/react`          | React security + performance    |
| `p/nextjs`         | `--config p/nextjs`         | Next.js specific rules          |
| `p/secrets`        | `--config p/secrets`        | Hardcoded secrets               |
| `p/jwt`            | `--config p/jwt`            | JWT implementation issues       |
| `p/xss`            | `--config p/xss`            | Cross-Site Scripting            |
| `p/sql-injection`  | `--config p/sql-injection`  | SQL Injection                   |

### Custom Rule ตัวอย่าง

สร้างไฟล์ `.semgrep/custom-rules.yml`:

```yaml
rules:
  - id: no-hardcoded-api-url
    patterns:
      - pattern: |
          fetch("https://api.$URL/...")
    message: "ห้าม hardcode API URL — ใช้ environment variable แทน"
    languages: [typescript, javascript]
    severity: WARNING

  - id: no-dangerouslySetInnerHTML
    pattern: dangerouslySetInnerHTML={...}
    message: "ใช้ dangerouslySetInnerHTML เสี่ยง XSS — ใช้ sanitize library"
    languages: [typescriptreact, javascriptreact]
    severity: ERROR

  - id: no-eval
    pattern: eval(...)
    message: "ห้ามใช้ eval() — เสี่ยง code injection"
    languages: [typescript, javascript]
    severity: ERROR
```

```bash
# สแกนด้วย custom rules
semgrep scan --config .semgrep/custom-rules.yml src/
```

### เพิ่มใน GitLab CI/CD

```yaml
semgrep-scan:
  stage: security
  image: semgrep/semgrep:latest
  tags:
    - docker
  script:
    - semgrep scan --config auto --config p/security-audit --json -o semgrep-report.json src/
    - |
      ERRORS=$(cat semgrep-report.json | python3 -c "import json,sys; d=json.load(sys.stdin); print(len([r for r in d.get('results',[]) if r['extra']['severity']=='ERROR']))")
      if [ "$ERRORS" -gt 0 ]; then
        echo "❌ Found $ERRORS critical security issues"
        exit 1
      fi
  artifacts:
    paths:
      - semgrep-report.json
    expire_in: 7 days
  rules:
    - if: $CI_PIPELINE_SOURCE == "push"
  allow_failure: true
```

---

## เมื่อไหร่ใช้ตัวไหน

| สถานการณ์                             | ใช้เครื่องมือ                      |
| ------------------------------------- | ---------------------------------- |
| ตรวจ code quality + security รวม      | SonarQube                          |
| ตรวจ security เฉพาะทาง + custom rules | Semgrep                            |
| Real-time ขณะเขียนใน IDE              | SonarLint (connected to SonarQube) |
| CI/CD pipeline — quick security scan  | Semgrep (เร็วกว่า)                 |
| CI/CD pipeline — comprehensive scan   | SonarQube (ครอบคลุมกว่า)           |
| ตรวจ OWASP Top 10 เฉพาะเจาะจง         | Semgrep (p/owasp-top-ten)          |
| ตรวจ framework-specific issues        | Semgrep (p/react, p/nextjs)        |

---

## GitLab Built-in SAST

Project นี้ยังใช้ GitLab SAST ที่มาจาก template:

```yaml
# ใน .gitlab-ci.yml
include:
  - template: Security/SAST.gitlab-ci.yml

sast:
  tags:
    - docker
```

GitLab SAST ใช้ Semgrep เป็น engine ภายใน — ทำงานอัตโนมัติใน CI/CD

---

## Troubleshooting

| ปัญหา                             | วิธีแก้                                        |
| --------------------------------- | ---------------------------------------------- |
| Semgrep สแกนช้า                   | จำกัด scope: `semgrep scan --config auto src/` |
| False positive เยอะ               | เพิ่ม `# nosemgrep: rule-id` ใน code           |
| SonarQube ไม่แสดง vulnerabilities | ตรวจว่า `sonar.sources` ชี้ถูก directory       |
| Semgrep ไม่รู้จัก TypeScript      | ใช้ `--config p/typescript` explicitly         |

---

## Claude CLI Prompt Template

```
สแกน SAST ทั้ง project:
1. รัน `semgrep scan --config auto --config p/security-audit src/` (ถ้าติดตั้งไว้)
2. รัน `npm run sonar:scan` (ถ้า SonarQube รันอยู่)
3. สรุปผลลัพธ์:
   - จำนวน findings แยกตาม severity (ERROR / WARNING / INFO)
   - ประเภทช่องโหว่ที่พบ (XSS, SQL injection, hardcoded secret, etc.)
4. เรียงลำดับตาม severity สูงสุดก่อน
5. เสนอแนวทางแก้ไขสำหรับ findings ที่เป็น ERROR
```
