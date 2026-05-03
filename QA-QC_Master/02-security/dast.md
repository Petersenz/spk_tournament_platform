# DAST — OWASP ZAP + StackHawk

> Dynamic Application Security Testing — ทดสอบ running application หาช่องโหว่
> ต่างจาก SAST ตรงที่ DAST ทดสอบกับ app ที่ deploy แล้ว ไม่ใช่ source code

---

## SAST vs DAST

|                    | SAST                                    | DAST                                     |
| ------------------ | --------------------------------------- | ---------------------------------------- |
| **ตรวจอะไร**       | Source code                             | Running application                      |
| **ตรวจเมื่อ**      | ขณะเขียน / CI/CD                        | หลัง deploy                              |
| **พบอะไร**         | Code-level vulnerabilities              | Runtime vulnerabilities                  |
| **ตัวอย่าง**       | Hardcoded secret, SQL injection pattern | Actual XSS, missing headers, auth bypass |
| **False positive** | มาก                                     | น้อยกว่า                                 |
| **เครื่องมือ**     | SonarQube, Semgrep                      | OWASP ZAP, StackHawk                     |

---

## เมื่อไหร่ควรรัน DAST

| สถานการณ์                                 | ความถี่   |
| ----------------------------------------- | --------- |
| ก่อน production release                   | ทุกครั้ง  |
| Staging/Preview environment               | รายเดือน  |
| หลังเปลี่ยน authentication flow           | ทันที     |
| หลังเพิ่ม API endpoint ใหม่               | ทันที     |
| Compliance requirement (SOC 2, ISO 27001) | รายไตรมาส |
| Routine security check                    | รายเดือน  |

---

## 1. OWASP ZAP — Full DAST Scanner (Free)

### ข้อมูลเบื้องต้น

| รายการ       | รายละเอียด                                                    |
| ------------ | ------------------------------------------------------------- |
| **ชื่อเต็ม** | OWASP Zed Attack Proxy                                        |
| **ราคา**     | Free (open-source, OWASP Foundation)                          |
| **ทำงานที่** | Desktop app + CLI + Docker                                    |
| **ตรวจอะไร** | OWASP Top 10, XSS, SQL injection, CSRF, missing headers, etc. |
| **Output**   | HTML report, JSON, XML                                        |

### สิ่งที่ ZAP ตรวจ

| Category                   | ตัวอย่าง                                                   |
| -------------------------- | ---------------------------------------------------------- |
| **Injection**              | SQL injection, Command injection, LDAP injection           |
| **XSS**                    | Reflected XSS, Stored XSS, DOM-based XSS                   |
| **Authentication**         | Broken authentication, session fixation                    |
| **Security Headers**       | Missing CSP, HSTS, X-Frame-Options, X-Content-Type-Options |
| **Information Disclosure** | Server version exposed, error messages, directory listing  |
| **CSRF**                   | Missing CSRF tokens                                        |
| **SSL/TLS**                | Weak ciphers, expired certificates                         |

### ติดตั้ง

```bash
# macOS (Desktop app)
brew install --cask zap

# macOS (CLI only)
brew install zaproxy

# Docker (แนะนำสำหรับ CI/CD)
docker pull ghcr.io/zaproxy/zaproxy:stable
```

### วิธีใช้ — Baseline Scan (Quick)

```bash
# Baseline scan — ตรวจ passive เท่านั้น (เร็ว, ปลอดภัย)
docker run --rm -t ghcr.io/zaproxy/zaproxy:stable zap-baseline.py \
  -t http://localhost:3030

# Baseline scan พร้อม report
docker run --rm -t -v "$(pwd):/zap/wrk" ghcr.io/zaproxy/zaproxy:stable \
  zap-baseline.py -t http://localhost:3030 \
  -r zap-baseline-report.html
```

### วิธีใช้ — Full Scan (Deep)

```bash
# Full scan — ตรวจ active + passive (ช้า, อาจส่งผลกระทบ app)
# *** ห้ามรันกับ production ***
docker run --rm -t -v "$(pwd):/zap/wrk" ghcr.io/zaproxy/zaproxy:stable \
  zap-full-scan.py -t http://localhost:3030 \
  -r zap-full-report.html
```

### วิธีใช้ — API Scan

```bash
# สแกน API endpoints (ถ้ามี OpenAPI spec)
docker run --rm -t -v "$(pwd):/zap/wrk" ghcr.io/zaproxy/zaproxy:stable \
  zap-api-scan.py -t http://localhost:3030/api/openapi.json \
  -f openapi \
  -r zap-api-report.html
```

### Scan Modes

| Mode         | คำสั่ง             | เวลา       | ความเสี่ยง               | ใช้ตอนไหน           |
| ------------ | ------------------ | ---------- | ------------------------ | ------------------- |
| **Baseline** | `zap-baseline.py`  | 1-5 นาที   | ต่ำ (passive only)       | ทุกเดือน, CI/CD     |
| **Full**     | `zap-full-scan.py` | 30-60 นาที | ปานกลาง (active attacks) | ก่อน release        |
| **API**      | `zap-api-scan.py`  | 5-15 นาที  | ปานกลาง                  | เมื่อเพิ่ม API ใหม่ |

### เพิ่มใน GitLab CI/CD

```yaml
dast-baseline:
  stage: security
  image:
    name: ghcr.io/zaproxy/zaproxy:stable
    entrypoint: [""]
  tags:
    - docker
  script:
    - zap-baseline.py -t $STAGING_URL -r zap-report.html || true
  artifacts:
    paths:
      - zap-report.html
    expire_in: 30 days
  rules:
    - if: $CI_COMMIT_BRANCH == "main"
      when: manual
```

### อ่าน Report

ZAP report แบ่ง findings เป็น risk levels:

| Risk Level        | ความหมาย                               | ต้องแก้เมื่อ |
| ----------------- | -------------------------------------- | ------------ |
| **High**          | ช่องโหว่ร้ายแรง (XSS, SQL injection)   | ทันที        |
| **Medium**        | ปัญหาด้าน security ที่สำคัญ            | ก่อน release |
| **Low**           | ปัญหาเล็กน้อย (information disclosure) | เมื่อมีเวลา  |
| **Informational** | ข้อมูลเพิ่มเติม                        | Optional     |

---

## 2. StackHawk — DevSecOps-Friendly DAST (Paid)

### เมื่อไหร่ควรอัปเกรดจาก ZAP

| ต้องการ                 | ZAP (Free)      | StackHawk (Paid)         |
| ----------------------- | --------------- | ------------------------ |
| Basic DAST scan         | ได้             | ได้                      |
| CI/CD integration ง่ายๆ | ต้อง config เอง | Built-in (GitHub/GitLab) |
| Dashboard + trending    | ไม่มี           | มี                       |
| Team collaboration      | ไม่มี           | มี                       |
| API-first testing       | ต้อง config     | Built-in                 |
| Developer-friendly UX   | ปานกลาง         | ดีมาก                    |

### ราคา

| Plan         | ราคา                      |
| ------------ | ------------------------- |
| Developer    | $0 (1 app, limited scans) |
| Professional | $35/app/mo                |
| Enterprise   | Custom                    |

### สรุป

- **เริ่มต้นด้วย OWASP ZAP** (free, ครอบคลุม)
- **อัปเกรดเป็น StackHawk** เมื่อทีมโต + ต้องการ CI/CD integration ที่ดีกว่า

---

## Best Practices

1. **ห้ามรัน Full Scan กับ production** — ใช้ staging/preview environment
2. **รัน Baseline Scan เป็นประจำ** — เร็ว + ปลอดภัย
3. **รัน Full Scan ก่อน release** — ตรวจให้ละเอียดก่อน deploy
4. **ตั้ง alert สำหรับ High/Medium findings** — ต้องแก้ก่อน deploy
5. **เก็บ report ทุกครั้ง** — ใช้ track progress + compliance evidence

---

## Troubleshooting

| ปัญหา                         | วิธีแก้                                    |
| ----------------------------- | ------------------------------------------ |
| ZAP scan ช้ามาก               | ใช้ baseline scan แทน full scan            |
| Docker ไม่เชื่อมต่อ localhost | ใช้ `host.docker.internal` แทน `localhost` |
| ZAP scan ติด authentication   | ตั้ง ZAP context + authentication script   |
| Report มี false positive เยอะ | เพิ่ม rules ใน ZAP config file             |

---

## Claude CLI Prompt Template

```
รัน DAST scan กับ application:
1. ตรวจว่า app รันอยู่ที่ port ไหน
2. รัน ZAP baseline scan:
   docker run --rm -t ghcr.io/zaproxy/zaproxy:stable zap-baseline.py -t http://host.docker.internal:3030
3. สรุปผล:
   - จำนวน findings แยกตาม risk level (High/Medium/Low/Info)
   - Top 5 findings ที่สำคัญที่สุดพร้อมวิธีแก้
4. ถ้ามี High risk — เสนอแนวทางแก้ไขทันที
```
