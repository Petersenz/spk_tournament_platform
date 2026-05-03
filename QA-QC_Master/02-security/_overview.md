# 02 — Security: ภาพรวมเครื่องมือ

> หมวดนี้ครอบคลุมเครื่องมือด้าน Security ทั้งหมดที่ใช้ / แนะนำสำหรับ ViberQC
> แบ่งตามประเภท: SAST, SCA, DAST, Secret Scanning, Container Security, Pentest

---

## สารบัญไฟล์

| ไฟล์                                     | เนื้อหา                                  |
| ---------------------------------------- | ---------------------------------------- |
| [secret-scanning.md](secret-scanning.md) | Secret Scanning: Gitleaks, GitGuardian   |
| [sast.md](sast.md)                       | SAST: SonarQube, Semgrep                 |
| [sca-dependency.md](sca-dependency.md)   | SCA: Snyk, npm audit, FOSSA, OSV-Scanner |
| [dast.md](dast.md)                       | DAST: OWASP ZAP, StackHawk               |
| [docker-security.md](docker-security.md) | Container Security: Trivy, Hadolint      |
| [pentest.md](pentest.md)                 | Penetration Testing: Process + Checklist |

---

## ประเภท Security Scanning

| ประเภท                 | ชื่อเต็ม                             | ตรวจอะไร                                | ตรวจเมื่อ                    |
| ---------------------- | ------------------------------------ | --------------------------------------- | ---------------------------- |
| **SAST**               | Static Application Security Testing  | Source code หา vulnerabilities          | ขณะเขียน code / CI/CD        |
| **SCA**                | Software Composition Analysis        | Dependencies หา known CVE               | ทุก commit / รายสัปดาห์      |
| **DAST**               | Dynamic Application Security Testing | Running app หาช่องโหว่                  | รายเดือน / ก่อน release      |
| **Secret Scanning**    | —                                    | API keys, passwords ใน code/git history | ทุก commit (pre-commit hook) |
| **Container Security** | —                                    | Docker image หา vulnerabilities         | ก่อน deploy                  |
| **Pentest**            | Penetration Testing                  | ทดสอบเจาะระบบจริง                       | ปีละ 1-2 ครั้ง               |

```
Security Scanning Layers:

┌─────────────────────────────────────────────────┐
│  Layer 1: Secret Scanning (ทุก commit)           │
│  Gitleaks + GitGuardian                          │
├─────────────────────────────────────────────────┤
│  Layer 2: SAST (ขณะเขียน + CI/CD)               │
│  SonarQube + SonarLint + Semgrep                 │
├─────────────────────────────────────────────────┤
│  Layer 3: SCA (ทุก commit + รายสัปดาห์)          │
│  Snyk + npm audit + OSV-Scanner                  │
├─────────────────────────────────────────────────┤
│  Layer 4: Container Security (ก่อน deploy)       │
│  Trivy + Hadolint                                │
├─────────────────────────────────────────────────┤
│  Layer 5: DAST (รายเดือน/ก่อน release)           │
│  OWASP ZAP                                       │
├─────────────────────────────────────────────────┤
│  Layer 6: Pentest (ปีละ 1-2 ครั้ง)              │
│  External partner (Armstrong Technology)         │
└─────────────────────────────────────────────────┘
```

---

## ตารางเครื่องมือทั้งหมด

| เครื่องมือ          | ประเภท              | ราคา                     | ใช้ใน project         | ทำงานที่       |
| ------------------- | ------------------- | ------------------------ | --------------------- | -------------- |
| **Gitleaks**        | Secret Scanning     | Free                     | ใช่ (pre-commit + CI) | CLI + Git hook |
| **GitGuardian**     | Secret Scanning     | Free (individual)        | ยังไม่ได้ตั้ง         | Cloud + CLI    |
| **SonarQube CE**    | SAST + Code Quality | Free (self-hosted)       | ใช่ (Docker)          | Docker         |
| **SonarLint**       | SAST (real-time)    | Free                     | ใช่ (IDE extension)   | IDE            |
| **Semgrep**         | SAST (custom rules) | Free (<=10 contributors) | ยังไม่ได้ตั้ง         | CLI + CI       |
| **GitLab SAST**     | SAST                | Free (GitLab built-in)   | ใช่ (CI template)     | GitLab CI      |
| **Snyk**            | SCA                 | Free (limited)           | ยังไม่ได้ตั้ง         | CLI + IDE      |
| **npm audit**       | SCA                 | Free (built-in)          | ใช่ (CI + pre-push)   | CLI            |
| **FOSSA**           | License Compliance  | Free (limited)           | ยังไม่ได้ตั้ง         | Cloud          |
| **OSV-Scanner**     | SCA                 | Free (Google)            | ยังไม่ได้ตั้ง         | CLI            |
| **OWASP ZAP**       | DAST                | Free                     | ยังไม่ได้ตั้ง         | CLI + Desktop  |
| **StackHawk**       | DAST                | Paid ($35/app/mo)        | ยังไม่ได้ตั้ง         | Cloud          |
| **Trivy**           | Container Security  | Free                     | ยังไม่ได้ตั้ง         | CLI            |
| **Hadolint**        | Dockerfile Linting  | Free                     | ยังไม่ได้ตั้ง         | CLI            |
| **Aikido Security** | SAST + SCA (IDE)    | Free                     | ใช่ (IDE extension)   | IDE            |

---

## Security Pipeline ที่ใช้อยู่

### Git Hooks (local)

```
Pre-commit:
  1. lint-staged (ESLint + Prettier)
  2. Secret scan (pattern matching)
  3. Console.log check

Pre-push:
  1. Security scan (scripts/security-scan.sh)
  2. Dependency audit (scripts/dependency-audit.sh)
  3. Quality gate (scripts/quality-gate.sh)
```

### GitLab CI/CD

```
Security Stage:
  - secret-scan (pattern matching)
  - env-check (.env not tracked)
  - sast (GitLab built-in SAST template)

Test Stage:
  - lint (ESLint + Prettier)
  - dependency-audit (npm audit)
  - quality-gate (comprehensive scan)
```

---

## npm Scripts ที่เกี่ยวข้อง

```bash
npm run security          # Security scan 8 ส่วน
npm run audit             # npm audit --audit-level=high
npm run quality:all       # quality + security + deps ทั้งหมด
npm run check-env         # ตรวจ secret leak
```

---

## ลำดับความสำคัญในการ setup

| ลำดับ | เครื่องมือ                 | สถานะ      | ความสำคัญ                            |
| ----- | -------------------------- | ---------- | ------------------------------------ |
| 1     | Gitleaks + secret patterns | ใช้แล้ว    | สูงมาก — ป้องกัน key หลุด            |
| 2     | npm audit                  | ใช้แล้ว    | สูงมาก — ตรวจ CVE ใน deps            |
| 3     | SonarQube + SonarLint      | ใช้แล้ว    | สูง — SAST + code quality            |
| 4     | GitLab SAST                | ใช้แล้ว    | สูง — CI/CD built-in                 |
| 5     | Snyk                       | ยังไม่ตั้ง | สูง — deep SCA                       |
| 6     | Semgrep                    | ยังไม่ตั้ง | ปานกลาง — custom security rules      |
| 7     | Trivy + Hadolint           | ยังไม่ตั้ง | ปานกลาง — container security         |
| 8     | OWASP ZAP                  | ยังไม่ตั้ง | ปานกลาง — DAST                       |
| 9     | GitGuardian                | ยังไม่ตั้ง | เสริม — continuous secret monitoring |
| 10    | Pentest                    | ยังไม่ทำ   | ต่ำ (ทำเมื่อ production ready)       |
