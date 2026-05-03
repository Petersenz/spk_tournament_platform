# Performance Monitoring --- WebPageTest + SpeedCurve

> **SYNERRY AI Team --- Performance Monitoring Guide 2026**
>
> ตรวจสอบ performance เชิงลึก + ติดตามต่อเนื่อง
> อัปเดตล่าสุด: 2026-04-06

---

## เครื่องมือ 2 ระดับ

| เครื่องมือ      | ประเภท                 | จุดเด่น                                |       ราคา       |
| --------------- | ---------------------- | -------------------------------------- | :--------------: |
| **WebPageTest** | One-time deep analysis | Waterfall, filmstrip, comparison, free |       Free       |
| **SpeedCurve**  | Continuous monitoring  | Track over time, alerts, dashboards    | Paid ($12-63/mo) |

---

## 1. WebPageTest --- Deep Performance Analysis

URL: **https://www.webpagetest.org/**

### จุดเด่น

- **Waterfall chart** --- เห็นทุก request ที่โหลด + เวลาแต่ละตัว
- **Filmstrip** --- เห็น visual progress ทุก 0.1 วินาที
- **Comparison** --- เทียบ 2 URL หรือ 2 ครั้ง side-by-side
- **Connection simulation** --- ทดสอบบน 3G, 4G, Cable
- **Location** --- ทดสอบจากหลาย country

### วิธีใช้

1. ไปที่ https://www.webpagetest.org/
2. ใส่ URL
3. เลือก Test Location (เช่น Singapore, Tokyo)
4. เลือก Browser (Chrome, Firefox)
5. เลือก Connection (Cable, 4G, 3G)
6. คลิก **Start Test**
7. รอ 1-3 นาที > ได้ report ครบทุกมิติ

### อ่านผล WebPageTest

| ส่วน                  | ดูอะไร                                 |
| --------------------- | -------------------------------------- |
| **Summary**           | Overall grades (A-F) + Core Web Vitals |
| **Waterfall**         | request ไหนช้า, request ไหน blocking   |
| **Filmstrip**         | user เห็นอะไรตอน 1s, 2s, 3s            |
| **Requests**          | จำนวน + ขนาด requests แยกตามประเภท     |
| **Content Breakdown** | สัดส่วน JS / CSS / Images / Fonts      |

### เมื่อไหร่ควรใช้ WebPageTest

- หลัง deploy ขึ้น staging/production
- เมื่อ Lighthouse score ตก --- ต้องการ deep analysis
- เมื่อต้อง debug ว่า request ไหนช้า
- เมื่อต้อง compare ก่อน/หลัง optimization

---

## 2. SpeedCurve --- Continuous Performance Monitoring (Paid)

> SpeedCurve ติดตาม performance ต่อเนื่อง --- เห็น trend, ตั้ง alert

### เมื่อไหร่ควร upgrade เป็น SpeedCurve

| Scenario                 | WebPageTest (Free) | SpeedCurve (Paid) |
| ------------------------ | :----------------: | :---------------: |
| ตรวจครั้งเดียว           |        Yes         |     Overkill      |
| ตรวจรายสัปดาห์           |  ทำได้แต่ manual   | Auto + dashboard  |
| ตั้ง budget alerts       |       ไม่ได้       |        Yes        |
| Track over time (trend)  |       ไม่ได้       |        Yes        |
| Compare with competitors |       จำกัด        |        Yes        |
| Team dashboard           |       ไม่มี        |        Yes        |

### ราคา SpeedCurve

| Plan       | ราคา/เดือน | Checks/เดือน |
| ---------- | :--------: | :----------: |
| Starter    |    $12     |    1,000     |
| Business   |    $63     |    10,000    |
| Enterprise |   Custom   |    Custom    |

**คำแนะนำ:** เริ่มจาก WebPageTest (free) ก่อน --- upgrade เป็น SpeedCurve เมื่อมี users เยอะพอที่ performance regression สำคัญ

---

## Core Web Vitals --- รายละเอียดทุกตัว

### Primary Metrics (Google Ranking Factor)

| Metric  | ชื่อเต็ม                  | วัดอะไร                          | เป้าหมาย | วิธีแก้เมื่อไม่ผ่าน                 |
| ------- | ------------------------- | -------------------------------- | :------: | ----------------------------------- |
| **LCP** | Largest Contentful Paint  | เวลาที่ content ใหญ่สุดโหลดเสร็จ |  < 2.5s  | Optimize hero image, preload fonts  |
| **INP** | Interaction to Next Paint | เวลาตอบสนองเมื่อ user interact   | < 200ms  | Reduce JS bundle, break long tasks  |
| **CLS** | Cumulative Layout Shift   | ระดับการกระโดดของ layout         |  < 0.1   | ใส่ width/height รูป, reserve space |

### Secondary Metrics (ส่งผลต่อ UX)

| Metric          | ชื่อเต็ม               | วัดอะไร                          | เป้าหมาย |
| --------------- | ---------------------- | -------------------------------- | :------: |
| **TTFB**        | Time to First Byte     | เวลาจาก request ถึง byte แรก     | < 800ms  |
| **FCP**         | First Contentful Paint | เวลาที่ content แรกปรากฏ         |  < 1.8s  |
| **TBT**         | Total Blocking Time    | เวลารวมที่ main thread ถูก block | < 200ms  |
| **Speed Index** | Speed Index            | ความเร็วที่ visual content ปรากฏ |  < 3.4s  |

---

## Performance Checklist --- 19 รายการ (Enterprise 360 Phase 4)

### Core Web Vitals (7 รายการ)

|  #  | รายการตรวจ                      | เกณฑ์        | สถานะ |
| :-: | ------------------------------- | ------------ | :---: |
|  1  | LCP (Largest Contentful Paint)  | < 2.5 วินาที |       |
|  2  | INP (Interaction to Next Paint) | < 200ms      |       |
|  3  | CLS (Cumulative Layout Shift)   | < 0.1        |       |
|  4  | TTFB (Time to First Byte)       | < 800ms      |       |
|  5  | FCP (First Contentful Paint)    | < 1.8 วินาที |       |
|  6  | TBT (Total Blocking Time)       | < 200ms      |       |
|  7  | Speed Index                     | < 3.4 วินาที |       |

### Resource Optimization (6 รายการ)

|  #  | รายการตรวจ               | เกณฑ์                 | สถานะ |
| :-: | ------------------------ | --------------------- | :---: |
|  8  | Image format (WebP/AVIF) | ใช้ทุกรูป             |       |
|  9  | Image lazy loading       | ทุกรูป below-the-fold |       |
| 10  | Gzip/Brotli compression  | เปิด                  |       |
| 11  | CDN configured           | สำหรับ static assets  |       |
| 12  | Bundle size (JS)         | < 200KB gzipped       |       |
| 13  | Bundle size (CSS)        | < 50KB gzipped        |       |

### Server & Runtime (6 รายการ)

|  #  | รายการตรวจ                      | เกณฑ์             | สถานะ |
| :-: | ------------------------------- | ----------------- | :---: |
| 14  | API response time (p95)         | < 500ms           |       |
| 15  | API response time (p99)         | < 1 วินาที        |       |
| 16  | Database query time (p95)       | < 100ms           |       |
| 17  | Error rate under load (100 VUs) | < 1%              |       |
| 18  | Memory usage stable (soak test) | ไม่เพิ่มต่อเนื่อง |       |
| 19  | Recovery after stress           | กลับปกติ < 1 นาที |       |

---

## Monitoring Workflow

```
รายวัน
  |
  +-- Chrome DevTools (quick check ระหว่าง dev)
  |
รายสัปดาห์
  |
  +-- PageSpeed Insights (ทุกหน้าสำคัญ)
  +-- WebPageTest (deep analysis ถ้ามีปัญหา)
  |
รายเดือน
  |
  +-- Full performance audit (ทุกหน้า)
  +-- k6 load test (ดู load-testing.md)
  +-- Compare กับเดือนก่อน
  |
ก่อน Release
  |
  +-- Lighthouse CI ใน pipeline
  +-- WebPageTest comparison (staging vs production)
```

---

## อ้างอิง

- WebPageTest: https://www.webpagetest.org/
- SpeedCurve: https://www.speedcurve.com/
- Web Vitals: https://web.dev/vitals/
- Chrome UX Report: https://developer.chrome.com/docs/crux/

---

> **SYNERRY AI Team** | QA-QC Master v1.0 | April 2026
