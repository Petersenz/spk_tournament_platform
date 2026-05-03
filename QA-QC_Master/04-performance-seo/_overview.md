# Step 4 --- Performance & SEO Overview

> **SYNERRY AI Team --- Performance & SEO Guide 2026**
>
> ตรวจสอบความเร็ว, Core Web Vitals, และ SEO ให้ได้มาตรฐาน
> อัปเดตล่าสุด: 2026-04-06

---

## Core Web Vitals --- เป้าหมาย

| Metric  | ชื่อเต็ม                  |   เป้าหมาย   | วัดอะไร                          |
| ------- | ------------------------- | :----------: | -------------------------------- |
| **LCP** | Largest Contentful Paint  | < 2.5 วินาที | ความเร็วโหลด content หลัก        |
| **INP** | Interaction to Next Paint |   < 200ms    | ความเร็วตอบสนองเมื่อ user คลิก   |
| **CLS** | Cumulative Layout Shift   |    < 0.1     | ความเสถียรของ layout (ไม่กระโดด) |

### ระดับ Core Web Vitals

| ระดับ             |   LCP    |    INP    |   CLS    |
| ----------------- | :------: | :-------: | :------: |
| Good              |  < 2.5s  |  < 200ms  |  < 0.1   |
| Needs Improvement | 2.5-4.0s | 200-500ms | 0.1-0.25 |
| Poor              |  > 4.0s  |  > 500ms  |  > 0.25  |

**เป้าหมาย: ทุก metric อยู่ในระดับ "Good"**

---

## เครื่องมือทั้งหมดใน Step 4

| เครื่องมือ                | หมวด               |    Free/Paid     | จุดเด่น                          |                          ไฟล์                          |
| ------------------------- | ------------------ | :--------------: | -------------------------------- | :----------------------------------------------------: |
| **Lighthouse**            | Performance Audit  |       Free       | Built-in Chrome, CLI, CI         |             [lighthouse.md](lighthouse.md)             |
| **PageSpeed Insights**    | Online Audit       |       Free       | ใช้ Lighthouse + field data      |             [lighthouse.md](lighthouse.md)             |
| **WebPageTest**           | Deep Analysis      |       Free       | Waterfall, filmstrip, comparison | [performance-monitoring.md](performance-monitoring.md) |
| **SpeedCurve**            | Continuous Monitor |       Paid       | Track performance over time      | [performance-monitoring.md](performance-monitoring.md) |
| **Ahrefs**                | SEO All-in-One     |       Paid       | Backlinks, keywords, site audit  |              [seo-tools.md](seo-tools.md)              |
| **DataForSEO**            | SEO API            |       Paid       | Programmatic SEO data            |              [seo-tools.md](seo-tools.md)              |
| **Screaming Frog**        | SEO Spider         | Free (<500 URLs) | Crawl site หา issues             |              [seo-tools.md](seo-tools.md)              |
| **Google Search Console** | SEO Tracking       |       Free       | Performance + indexing           |              [seo-tools.md](seo-tools.md)              |

---

## Lighthouse Score Targets

| หมวด           | เป้าหมาย | ขั้นต่ำ |
| -------------- | :------: | :-----: |
| Performance    |  >= 90   |  >= 80  |
| Accessibility  |  >= 90   |  >= 85  |
| Best Practices |  >= 90   |  >= 85  |
| SEO            |  >= 90   |  >= 85  |

---

## Performance Budget

| Resource            | Budget  |
| ------------------- | :-----: |
| Total JS (gzipped)  | < 200KB |
| Total CSS (gzipped) | < 50KB  |
| Total Images        | < 500KB |
| Total Page Weight   |  < 1MB  |
| Fonts               | < 100KB |

---

## ลำดับการอ่าน

1. [lighthouse.md](lighthouse.md) --- เริ่มจาก Lighthouse audit
2. [performance-monitoring.md](performance-monitoring.md) --- Deep analysis + continuous monitoring
3. [seo-tools.md](seo-tools.md) --- Technical SEO + content SEO

---

> **SYNERRY AI Team** | QA-QC Master v1.0 | April 2026
