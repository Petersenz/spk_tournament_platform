# Compliance — Standards & Regulations

> มาตรฐานที่ ViberQC ต้องปฏิบัติตาม
> WCAG (Accessibility), OWASP (Security), PDPA/GDPR (Privacy), PCI-DSS (Payment)

---

## Standards Coverage Summary

| Standard         | หมวด                  | Items | Priority |
| ---------------- | --------------------- | :---: | :------: |
| **WCAG 2.1 AA**  | Accessibility         |  16   |   High   |
| **OWASP Top 10** | Security              |  20   | Critical |
| **PDPA / GDPR**  | Data Protection       |  10   | Critical |
| **PCI-DSS**      | Payment Security      |   8   | Critical |
| **SOC 2**        | Organization Security |   —   |  Future  |

---

## 1. WCAG 2.1 AA — Accessibility (16 items)

> จาก Enterprise 360 Phase 6 — ทำให้คนพิการใช้เว็บได้

### Perceivable (รับรู้ได้)

| ID  | Item                                | WCAG  | ตรวจด้วย         |
| :-: | ----------------------------------- | :---: | ---------------- |
| A01 | ภาพทุกรูปมี `alt` text              | 1.1.1 | axe / Lighthouse |
| A02 | Video มี captions                   | 1.2.2 | Manual           |
| A03 | Color contrast >= 4.5:1 (text)      | 1.4.3 | axe / Lighthouse |
| A04 | Color contrast >= 3:1 (large text)  | 1.4.3 | axe / Lighthouse |
| A05 | Text resize ถึง 200% ไม่เสีย layout | 1.4.4 | Manual (Ctrl++)  |
| A06 | ไม่ใช้สีอย่างเดียวสื่อความหมาย      | 1.4.1 | Manual           |

### Operable (ใช้งานได้)

| ID  | Item                                 | WCAG  | ตรวจด้วย         |
| :-: | ------------------------------------ | :---: | ---------------- |
| A07 | Keyboard navigation ใช้งานได้ทุกหน้า | 2.1.1 | Manual (Tab key) |
| A08 | Focus indicator มองเห็นได้           | 2.4.7 | Manual           |
| A09 | Skip navigation link มี              | 2.4.1 | Manual           |
| A10 | Page titles ถูกต้อง + unique         | 2.4.2 | Lighthouse       |
| A11 | ไม่มี keyboard trap                  | 2.1.2 | Manual           |

### Understandable (เข้าใจได้)

| ID  | Item                     | WCAG  | ตรวจด้วย   |
| :-: | ------------------------ | :---: | ---------- |
| A12 | `lang` attribute ตั้งถูก | 3.1.1 | Lighthouse |
| A13 | Form errors ระบุชัดเจน   | 3.3.1 | Manual     |
| A14 | Labels ผูกกับ inputs     | 1.3.1 | axe        |

### Robust (ใช้ได้กับทุกเทคโนโลยี)

| ID  | Item                             | WCAG  | ตรวจด้วย |
| :-: | -------------------------------- | :---: | -------- |
| A15 | HTML valid (ไม่มี duplicate IDs) | 4.1.1 | axe      |
| A16 | ARIA roles ใช้ถูกต้อง            | 4.1.2 | axe      |

### Accessibility Testing Tools

```bash
# Lighthouse accessibility audit
npm run quality:a11y

# Playwright + axe-core (automated)
npm run test:e2e  # axe integration ใน @axe-core/playwright
```

| Tool                         | ตรวจอะไร             | ใช้งาน                                      |
| ---------------------------- | -------------------- | ------------------------------------------- |
| **axe DevTools** (extension) | WCAG violations      | Chrome/Firefox extension                    |
| **@axe-core/playwright**     | Automated a11y tests | `npm run test:e2e`                          |
| **Lighthouse**               | A11y score           | DevTools / CLI                              |
| **WAVE**                     | Visual a11y check    | [wave.webaim.org](https://wave.webaim.org/) |

---

## 2. OWASP Top 10 — Security (20 items)

> จาก Enterprise 360 Phase 5 — 10 อันดับช่องโหว่ที่พบบ่อยที่สุด

|   ID    | OWASP Category                     | Items | Severity |
| :-----: | ---------------------------------- | :---: | :------: |
| S01-S02 | **A01: Broken Access Control**     |   2   | Critical |
| S03-S04 | **A02: Cryptographic Failures**    |   2   | Critical |
| S05-S06 | **A03: Injection**                 |   2   | Critical |
| S07-S08 | **A04: Insecure Design**           |   2   |   High   |
| S09-S10 | **A05: Security Misconfiguration** |   2   |   High   |
| S11-S12 | **A06: Vulnerable Components**     |   2   |   High   |
| S13-S14 | **A07: Auth Failures**             |   2   | Critical |
| S15-S16 | **A08: Data Integrity Failures**   |   2   |   High   |
| S17-S18 | **A09: Logging Failures**          |   2   |  Medium  |
| S19-S20 | **A10: SSRF**                      |   2   |   High   |

### Key Security Checks

| Check              | ตรวจอะไร                | Tool/Script                   |
| ------------------ | ----------------------- | ----------------------------- |
| **SQL Injection**  | Parameterized queries   | ORM (Drizzle/Prisma)          |
| **XSS**            | Input sanitization, CSP | ESLint, security headers      |
| **CSRF**           | Token validation        | NextAuth (built-in)           |
| **Auth Bypass**    | Route protection        | Middleware check              |
| **Secret Leak**    | No hardcoded secrets    | pre-commit hook, check-env.sh |
| **Dependency CVE** | Known vulnerabilities   | `npm audit`, SonarQube        |
| **HTTPS**          | SSL/TLS encryption      | SSL cert check                |
| **Headers**        | Security headers set    | Helmet.js / next.config.js    |

### Security Scan

```bash
# Full security scan (8 categories)
npm run security

# Quick checks
npm audit --audit-level=high
bash scripts/check-env.sh
```

---

## 3. PDPA / GDPR — Data Protection (10 items)

> PDPA = พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล (ไทย)
> GDPR = General Data Protection Regulation (EU)

| ID  | Item                                                    | Requirement    | Status |
| :-: | ------------------------------------------------------- | -------------- | :----: |
| P01 | **Privacy Policy** มีและเข้าถึงได้                      | PDPA/GDPR      |   ⬜   |
| P02 | **Cookie Consent** banner แสดง                          | PDPA/GDPR      |   ⬜   |
| P03 | **Data Collection** แจ้ง user ว่าเก็บอะไร               | PDPA Art.23    |   ⬜   |
| P04 | **Consent** ขออนุญาตก่อนเก็บข้อมูล                      | PDPA Art.19    |   ⬜   |
| P05 | **Right to Access** user ดูข้อมูลตัวเองได้              | PDPA Art.30    |   ⬜   |
| P06 | **Right to Delete** user ลบข้อมูลตัวเองได้              | PDPA Art.33    |   ⬜   |
| P07 | **Data Encryption** เก็บข้อมูลเข้ารหัส                  | PDPA Art.37    |   ⬜   |
| P08 | **Data Breach Notification** แจ้งภายใน 72 ชม.           | PDPA Art.37(4) |   ⬜   |
| P09 | **DPO** มีผู้ดูแลข้อมูลส่วนบุคคล (ถ้าจำเป็น)            | PDPA Art.41    |   ⬜   |
| P10 | **Cross-border Transfer** ตรวจก่อนส่งข้อมูลไปต่างประเทศ | PDPA Art.28    |   ⬜   |

---

## 4. PCI-DSS — Payment Security (8 items)

> เพราะ ViberQC ใช้ Stripe → ส่วนใหญ่ Stripe จัดการให้
> แต่ยังมีส่วนที่ app ต้องรับผิดชอบ

|  ID  | Item                                             | Requirement | Status |
| :--: | ------------------------------------------------ | ----------- | :----: |
| PC01 | **ไม่เก็บ card number** ใน database              | PCI Req 3   |   ⬜   |
| PC02 | **ใช้ Stripe Elements** (ไม่รับ card data ตรง)   | PCI Req 3   |   ⬜   |
| PC03 | **HTTPS ตลอดเวลา**                               | PCI Req 4   |   ⬜   |
| PC04 | **Webhook verify signature**                     | PCI Req 6   |   ⬜   |
| PC05 | **Access control** เฉพาะ admin เห็น payment data | PCI Req 7   |   ⬜   |
| PC06 | **Log payment events**                           | PCI Req 10  |   ⬜   |
| PC07 | **Test ด้วย test keys** ไม่ใช้ live keys ใน dev  | PCI Req 6   |   ⬜   |
| PC08 | **SAQ A questionnaire** กรอกแล้ว (ถ้า Stripe ขอ) | PCI SAQ     |   ⬜   |

> ViberQC ใช้ Stripe Elements → card data ไม่ผ่าน server ของเรา
> จัดอยู่ใน **SAQ A** (ระดับต่ำสุด) — compliance ง่ายที่สุด

---

## 5. SOC 2 (Future)

> SOC 2 จำเป็นเมื่อมี Enterprise customers ที่ต้องการ compliance report
> ยังไม่จำเป็นสำหรับ stage ปัจจุบัน

| Trust Principle      | เกี่ยวกับ                           |
| -------------------- | ----------------------------------- |
| Security             | ป้องกันการเข้าถึงโดยไม่ได้รับอนุญาต |
| Availability         | ระบบพร้อมใช้งาน (uptime)            |
| Processing Integrity | ประมวลผลถูกต้อง                     |
| Confidentiality      | ข้อมูลลับไม่หลุด                    |
| Privacy              | ข้อมูลส่วนบุคคลจัดการถูกต้อง        |

### เมื่อไหร่ต้องทำ SOC 2?

- Enterprise customers ขอ compliance report
- ยอดขาย ARR > $1M
- จัดการข้อมูล healthcare / financial

---

## Compliance Score

| Standard     | Total Items |       เป้าหมาย       |
| ------------ | :---------: | :------------------: |
| WCAG 2.1 AA  |     16      | >= 14 passed (87.5%) |
| OWASP Top 10 |     20      | **20 passed (100%)** |
| PDPA/GDPR    |     10      |  >= 8 passed (80%)   |
| PCI-DSS      |      8      | **8 passed (100%)**  |

> Security (OWASP) + Payment (PCI-DSS) ต้อง 100% — ไม่มีข้อยกเว้น
> Accessibility (WCAG) + Privacy (PDPA) เป้าหมาย >= 80%

---

## Checklist

- [ ] Accessibility: รัน Lighthouse A11y → score >= 90
- [ ] Security: รัน `npm run security` → ไม่มี critical
- [ ] PDPA: มี Privacy Policy page
- [ ] PDPA: มี Cookie Consent banner
- [ ] PCI-DSS: ใช้ Stripe Elements (ไม่รับ card data ตรง)
- [ ] PCI-DSS: Webhook verify signature
