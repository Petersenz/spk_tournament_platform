# KPI & Metrics — ตัวชี้วัดคุณภาพ 4 หมวด

> อ้างอิงจาก SYNERRY Guide — KPIs สำหรับวัดผล QA/QC ทั้งระบบ
> "What gets measured gets improved" — ถ้าไม่วัด ก็ปรับปรุงไม่ได้

---

## ภาพรวม — 4 หมวด KPI

```
┌─────────────────────────────────────────────────────┐
│                  QA/QC KPIs                          │
├──────────────┬──────────────┬────────────┬──────────┤
│ Development  │ Operational  │  Security  │ Business │
│   Quality    │              │            │          │
├──────────────┼──────────────┼────────────┼──────────┤
│ Code Coverage│ Uptime       │ Vuln Fix   │ Release  │
│ Defect Rate  │ MTTR         │ Open Vulns │ Defects  │
│ PR Time      │ MTTD         │ Dep Fresh  │ Customer │
│ Code Churn   │ Deploy Freq  │            │ Bugs     │
│              │              │            │ Reopen   │
└──────────────┴──────────────┴────────────┴──────────┘
```

---

## หมวด 1: Development Quality — คุณภาพการพัฒนา

### 1.1 Code Coverage

| รายละเอียด          | ค่า                                               |
| ------------------- | ------------------------------------------------- |
| **คำอธิบาย**        | เปอร์เซ็นต์ของ code ที่มี automated test ครอบคลุม |
| **สูตร**            | (Lines tested / Total lines) x 100                |
| **เป้าหมายขั้นต่ำ** | >= 70%                                            |
| **เป้าหมายที่ดี**   | >= 85%                                            |
| **วัดบ่อยแค่ไหน**   | ทุก PR (CI pipeline)                              |
| **Tools**           | Vitest coverage, Istanbul/nyc, Codecov            |

### 1.2 Defect Escape Rate

| รายละเอียด        | ค่า                                         |
| ----------------- | ------------------------------------------- |
| **คำอธิบาย**      | สัดส่วน bugs ที่หลุดไปถึง production        |
| **สูตร**          | (Production bugs / Total bugs found) x 100  |
| **เป้าหมาย**      | < 10% (ยิ่งต่ำยิ่งดี)                       |
| **วัดบ่อยแค่ไหน** | ทุก release cycle                           |
| **Tools**         | Issue tracker (Jira, Linear, GitHub Issues) |

**การตีความ:**

- สูง = QA process มีช่องโหว่ ต้องเพิ่ม test หรือ review
- ต่ำ = QA process ดัก bugs ได้ดีก่อนถึง production
- Track ว่า bugs หลุดจาก step ไหน → ปรับปรุง step นั้น

### 1.3 PR Review Time

| รายละเอียด        | ค่า                                        |
| ----------------- | ------------------------------------------ |
| **คำอธิบาย**      | เวลาเฉลี่ยตั้งแต่เปิด PR จนได้ review แรก  |
| **เป้าหมาย**      | < 24 ชั่วโมง                               |
| **เป้าหมายที่ดี** | < 4 ชั่วโมง                                |
| **วัดบ่อยแค่ไหน** | ทุกสัปดาห์                                 |
| **Tools**         | GitHub Insights, LinearB, Pluralsight Flow |

### 1.4 Code Churn

| รายละเอียด        | ค่า                                                        |
| ----------------- | ---------------------------------------------------------- |
| **คำอธิบาย**      | สัดส่วน code ที่ถูกเขียนแล้วแก้ซ้ำภายใน 2-3 สัปดาห์        |
| **สูตร**          | (Lines changed within 2 weeks / Total lines written) x 100 |
| **เป้าหมาย**      | < 25%                                                      |
| **วัดบ่อยแค่ไหน** | ทุก sprint                                                 |
| **Tools**         | Git analytics, LinearB, CodeClimate                        |

---

## หมวด 2: Operational — ประสิทธิภาพการดำเนินงาน

### 2.1 Uptime

| รายละเอียด          | ค่า                                 |
| ------------------- | ----------------------------------- |
| **คำอธิบาย**        | เปอร์เซ็นต์เวลาที่ระบบใช้งานได้     |
| **เป้าหมายขั้นต่ำ** | 99.9% (downtime <= 8.76 ชม./ปี)     |
| **เป้าหมายที่ดี**   | 99.95% (downtime <= 4.38 ชม./ปี)    |
| **วัดบ่อยแค่ไหน**   | Real-time + รายงานรายเดือน          |
| **Tools**           | UptimeRobot, Better Uptime, Pingdom |

**Uptime Table:**

```
99%    = 87.6 ชม. downtime/ปี  (3.65 วัน)    — ไม่ดี
99.9%  = 8.76 ชม. downtime/ปี  (ขั้นต่ำ)     — พอใช้
99.95% = 4.38 ชม. downtime/ปี                — ดี
99.99% = 52.6 นาที downtime/ปี               — ดีมาก
```

### 2.2 MTTR — Mean Time To Recovery

| รายละเอียด        | ค่า                                       |
| ----------------- | ----------------------------------------- |
| **คำอธิบาย**      | เวลาเฉลี่ยในการแก้ไขปัญหาจนระบบกลับมาปกติ |
| **สูตร**          | Total downtime / Number of incidents      |
| **เป้าหมาย**      | < 1 ชั่วโมง (P0/P1 incidents)             |
| **วัดบ่อยแค่ไหน** | ทุก incident + สรุปรายเดือน               |
| **Tools**         | Incident tracking, PagerDuty, Opsgenie    |

**วิธีลด MTTR:**

1. มี runbook สำหรับปัญหาที่พบบ่อย
2. Automated rollback เมื่อ health check fail
3. On-call rotation ที่ชัดเจน
4. Post-mortem ทุก incident เพื่อป้องกันซ้ำ

### 2.3 MTTD — Mean Time To Detection

| รายละเอียด        | ค่า                                    |
| ----------------- | -------------------------------------- |
| **คำอธิบาย**      | เวลาเฉลี่ยตั้งแต่ปัญหาเกิดจนทีมรู้     |
| **สูตร**          | Time of detection - Time of occurrence |
| **เป้าหมาย**      | < 5 นาที                               |
| **วัดบ่อยแค่ไหน** | ทุก incident                           |
| **Tools**         | Sentry, Grafana alerts, UptimeRobot    |

**วิธีลด MTTD:**

1. ตั้ง alerts ที่ครอบคลุม (error rate, response time, uptime)
2. ใช้ anomaly detection ไม่ใช่แค่ threshold
3. Monitor ทั้ง synthetic (probe) และ real user metrics

### 2.4 Deploy Frequency

| รายละเอียด        | ค่า                                                   |
| ----------------- | ----------------------------------------------------- |
| **คำอธิบาย**      | จำนวนครั้งที่ deploy to production ต่อช่วงเวลา        |
| **เป้าหมาย**      | >= 1 ครั้ง/สัปดาห์ (startup), >= 1 ครั้ง/วัน (mature) |
| **วัดบ่อยแค่ไหน** | ทุกสัปดาห์                                            |
| **Tools**         | CI/CD dashboard, DORA metrics                         |

**การตีความ (DORA Metrics):**

```
Elite    : หลายครั้ง/วัน
High     : สัปดาห์ละ 1 ถึงเดือนละ 1
Medium   : เดือนละ 1 ถึง 6 เดือน
Low      : น้อยกว่า 6 เดือนละ 1
```

---

## หมวด 3: Security — ความปลอดภัย

### 3.1 Vulnerability Remediation Time

| รายละเอียด            | ค่า                                       |
| --------------------- | ----------------------------------------- |
| **คำอธิบาย**          | เวลาเฉลี่ยในการแก้ไข vulnerability หลังพบ |
| **เป้าหมาย Critical** | < 24 ชั่วโมง                              |
| **เป้าหมาย High**     | < 7 วัน                                   |
| **เป้าหมาย Medium**   | < 30 วัน                                  |
| **เป้าหมาย Low**      | < 90 วัน                                  |
| **วัดบ่อยแค่ไหน**     | ทุกสัปดาห์                                |
| **Tools**             | Snyk, SonarQube, issue tracker            |

### 3.2 Open Vulnerabilities Count

| รายละเอียด            | ค่า                                        |
| --------------------- | ------------------------------------------ |
| **คำอธิบาย**          | จำนวน vulnerabilities ที่ยังไม่ได้แก้      |
| **เป้าหมาย Critical** | 0 (ต้องไม่มีเลย)                           |
| **เป้าหมาย High**     | < 3                                        |
| **เป้าหมาย Medium**   | < 10                                       |
| **วัดบ่อยแค่ไหน**     | ทุกวัน (automated dashboard)               |
| **Tools**             | Snyk dashboard, SonarQube, GitHub Security |

### 3.3 Dependency Freshness

| รายละเอียด        | ค่า                                         |
| ----------------- | ------------------------------------------- |
| **คำอธิบาย**      | สัดส่วน dependencies ที่เป็น version ล่าสุด |
| **สูตร**          | (Up-to-date deps / Total deps) x 100        |
| **เป้าหมาย**      | >= 80% up-to-date                           |
| **วัดบ่อยแค่ไหน** | ทุกสัปดาห์                                  |
| **Tools**         | `npm outdated`, Renovate dashboard, Snyk    |

**ทำไมสำคัญ:**

- Dependencies เก่า = มีช่องโหว่ security ที่ถูก patch แล้วแต่เรายังไม่ได้
- ยิ่งห่างจาก latest มาก ยิ่ง upgrade ยากขึ้นแบบ exponential

---

## หมวด 4: Business — ผลกระทบต่อธุรกิจ

### 4.1 Release Defect Rate

| รายละเอียด        | ค่า                                               |
| ----------------- | ------------------------------------------------- |
| **คำอธิบาย**      | จำนวน bugs ที่พบหลัง release ต่อ release          |
| **สูตร**          | Bugs found post-release / Total features released |
| **เป้าหมาย**      | < 5%                                              |
| **วัดบ่อยแค่ไหน** | ทุก release                                       |
| **Tools**         | Issue tracker, Sentry                             |

### 4.2 Customer-Reported Bugs

| รายละเอียด        | ค่า                                          |
| ----------------- | -------------------------------------------- |
| **คำอธิบาย**      | จำนวน bugs ที่ user แจ้งเอง (ไม่ใช่ทีมหาเจอ) |
| **เป้าหมาย**      | ลดลงทุกเดือน (trending down)                 |
| **วัดบ่อยแค่ไหน** | ทุกเดือน                                     |
| **Tools**         | Support tickets, feedback forms              |

**การตีความ:**

- เยอะ = QA process ไม่ดัก bugs ก่อนถึง user
- น้อย = QA process ทำงานดี, user experience ดี
- ดู severity ด้วย — 1 critical bug แย่กว่า 10 cosmetic bugs

### 4.3 Bug Reopen Rate

| รายละเอียด        | ค่า                                             |
| ----------------- | ----------------------------------------------- |
| **คำอธิบาย**      | สัดส่วน bugs ที่ถูกปิดแล้วเปิดใหม่ (แก้ไม่จริง) |
| **สูตร**          | (Reopened bugs / Total closed bugs) x 100       |
| **เป้าหมาย**      | < 5%                                            |
| **วัดบ่อยแค่ไหน** | ทุก sprint                                      |
| **Tools**         | Issue tracker                                   |

**การตีความ:**

- สูง = fix ไม่ถูกจุด หรือ test ไม่ครอบคลุม
- ต่ำ = fix ถูกต้อง + มี regression test

---

## สรุป — Quick Reference

| หมวด        | KPI                 | เป้าหมาย |
| ----------- | ------------------- | -------- |
| Development | Code Coverage       | >= 70%   |
| Development | Defect Escape Rate  | < 10%    |
| Development | PR Review Time      | < 24 ชม. |
| Development | Code Churn          | < 25%    |
| Operational | Uptime              | >= 99.9% |
| Operational | MTTR                | < 1 ชม.  |
| Operational | MTTD                | < 5 นาที |
| Security    | Critical Vuln Fix   | < 24 ชม. |
| Security    | Open Critical Vulns | 0        |
| Security    | Dep Freshness       | >= 80%   |
| Business    | Release Defect Rate | < 5%     |
| Business    | Reopen Rate         | < 5%     |

---

_อ่านเสร็จแล้ว -> ดู [maintenance-schedule.md](./maintenance-schedule.md) สำหรับตารางดูแลระบบ_
