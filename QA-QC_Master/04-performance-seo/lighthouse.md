# Lighthouse --- Performance Audit

> **SYNERRY AI Team --- Lighthouse Guide 2026**
>
> Lighthouse: free performance auditing tool จาก Google
> อัปเดตล่าสุด: 2026-04-06

---

## Lighthouse คืออะไร

Lighthouse เป็นเครื่องมือ audit คุณภาพ web page แบบอัตโนมัติ ตรวจ 4 หมวด:

| หมวด               | วัดอะไร                                   | เป้าหมาย |
| ------------------ | ----------------------------------------- | :------: |
| **Performance**    | ความเร็วโหลด, rendering, interactivity    |  >= 90   |
| **Accessibility**  | WCAG compliance, screen reader support    |  >= 90   |
| **Best Practices** | Security, modern web standards            |  >= 90   |
| **SEO**            | Technical SEO, meta tags, mobile-friendly |  >= 90   |

---

## 3 วิธีใช้ Lighthouse

### 1. Chrome DevTools (ง่ายสุด)

1. เปิด Chrome > ไปหน้าที่ต้อง audit
2. กด `F12` (DevTools) > tab **Lighthouse**
3. เลือก categories > คลิก **Analyze page load**
4. รอ 30-60 วินาที > ได้ report

### 2. PageSpeed Insights (Online)

URL: **https://pagespeed.web.dev/**

- ใส่ URL > ได้ report ทันที
- มี **Field Data** (ข้อมูลจาก Chrome UX Report --- user จริง)
- มี **Lab Data** (Lighthouse simulation)
- เหมาะสำหรับตรวจ production URL

### 3. Lighthouse CLI (Automation / CI)

```bash
# ติดตั้ง
npm i -D lighthouse

# รันจาก CLI
npx lighthouse http://localhost:3030 --output html --output-path ./lighthouse-report.html

# รัน headless (สำหรับ CI)
npx lighthouse http://localhost:3030 \
  --chrome-flags="--headless --no-sandbox" \
  --output json \
  --output-path ./lighthouse-report.json
```

---

## Performance Metrics --- รายละเอียด

| Metric          | ชื่อเต็ม                 | เป้าหมาย | น้ำหนัก |
| --------------- | ------------------------ | :------: | :-----: |
| **FCP**         | First Contentful Paint   |  < 1.8s  |   10%   |
| **LCP**         | Largest Contentful Paint |  < 2.5s  |   25%   |
| **TBT**         | Total Blocking Time      | < 200ms  |   30%   |
| **CLS**         | Cumulative Layout Shift  |  < 0.1   |   25%   |
| **Speed Index** | Speed Index              |  < 3.4s  |   10%   |

### แต่ละ Metric แก้อย่างไร

| Metric          | สาเหตุที่พบบ่อย                             | วิธีแก้                               |
| --------------- | ------------------------------------------- | ------------------------------------- |
| FCP ช้า         | Server response ช้า, render-blocking CSS/JS | Preload fonts, inline critical CSS    |
| LCP ช้า         | รูปใหญ่, lazy load hero image               | Optimize images, preload LCP image    |
| TBT สูง         | JS bundle ใหญ่, long tasks                  | Code splitting, defer non-critical JS |
| CLS สูง         | รูปไม่กำหนด size, font swap                 | ใส่ width/height, font-display: swap  |
| Speed Index ช้า | โหลดทุกอย่างพร้อมกัน                        | Prioritize above-the-fold content     |

---

## Lighthouse CI --- รันใน Pipeline

### npm Script

```json
{
  "scripts": {
    "quality:perf": "lighthouse http://localhost:3030 --chrome-flags='--headless --no-sandbox' --output json --output-path ./lighthouse-report.json --quiet"
  }
}
```

### GitLab CI Integration

```yaml
# .gitlab-ci.yml (ส่วน lighthouse)
lighthouse:
  stage: test
  image: node:20
  script:
    - npm ci
    - npm run build
    - npm run start &
    - sleep 5
    - npx lighthouse http://localhost:3030
      --chrome-flags="--headless --no-sandbox"
      --output json
      --output-path ./lighthouse-report.json
    - |
      PERF=$(cat lighthouse-report.json | jq '.categories.performance.score * 100')
      A11Y=$(cat lighthouse-report.json | jq '.categories.accessibility.score * 100')
      SEO=$(cat lighthouse-report.json | jq '.categories.seo.score * 100')
      echo "Performance: $PERF, Accessibility: $A11Y, SEO: $SEO"
      if [ $(echo "$PERF < 80" | bc) -eq 1 ]; then exit 1; fi
      if [ $(echo "$A11Y < 85" | bc) -eq 1 ]; then exit 1; fi
      if [ $(echo "$SEO < 85" | bc) -eq 1 ]; then exit 1; fi
  artifacts:
    paths:
      - lighthouse-report.json
```

---

## Lighthouse Config --- Custom ปรับแต่ง

```javascript
// lighthouserc.js
module.exports = {
  ci: {
    collect: {
      url: [
        "http://localhost:3030/",
        "http://localhost:3030/login",
        "http://localhost:3030/dashboard",
      ],
      numberOfRuns: 3, // รัน 3 ครั้ง ใช้ค่า median
    },
    assert: {
      assertions: {
        "categories:performance": ["error", { minScore: 0.9 }],
        "categories:accessibility": ["error", { minScore: 0.9 }],
        "categories:seo": ["error", { minScore: 0.9 }],
        "categories:best-practices": ["warn", { minScore: 0.9 }],
      },
    },
    upload: {
      target: "filesystem",
      outputDir: "./lighthouse-reports",
    },
  },
};
```

---

## Common Issues + วิธีแก้

### 1. Performance < 90

```
ปัญหา: Bundle size ใหญ่เกินไป
แก้ไข:
- ใช้ dynamic import / code splitting
- Tree shake unused code
- ย้าย heavy libraries เป็น lazy load
```

### 2. Accessibility < 90

```
ปัญหา: ขาด alt text, contrast ไม่ผ่าน
แก้ไข:
- เพิ่ม alt ทุก <img>
- ตรวจ contrast ratio >= 4.5:1
- เพิ่ม ARIA labels ที่จำเป็น
```

### 3. SEO < 90

```
ปัญหา: ขาด meta tags, ไม่มี sitemap
แก้ไข:
- เพิ่ม title + meta description ทุกหน้า
- สร้าง sitemap.xml
- เพิ่ม robots.txt
- ใช้ semantic HTML (h1, h2, article, etc.)
```

---

## Workflow --- ตรวจ Performance

```
ระหว่าง Dev
  |
  +-- Chrome DevTools Lighthouse (quick check)
  |
ทุก PR
  |
  +-- Lighthouse CI ใน pipeline (automated)
  |
ก่อน Release
  |
  +-- PageSpeed Insights (field data + lab data)
  |
รายสัปดาห์
  |
  +-- ตรวจ PageSpeed Insights ทุกหน้าสำคัญ
```

---

## Prompt Template --- Claude CLI ปรับปรุง Performance

```
วิเคราะห์ Lighthouse report แล้วปรับปรุง performance ของ [ชื่อหน้า/component]

Lighthouse scores ปัจจุบัน:
- Performance: [ค่า]
- Accessibility: [ค่า]
- SEO: [ค่า]

ข้อกำหนด:
1. วิเคราะห์ว่า metric ไหนทำให้คะแนนต่ำ
2. เสนอ 3-5 วิธีแก้ เรียงตาม impact สูง > ต่ำ
3. แก้ code ให้เลย (ถ้าทำได้)
4. ตรวจ: image optimization, bundle size, render-blocking resources
5. เป้าหมาย: ทุกหมวด >= 90

อย่าทำ:
- อย่าลบ functionality เพื่อเพิ่ม score
- อย่าใช้ workaround ที่แก้แค่ Lighthouse แต่ UX แย่ลง
```

---

## อ้างอิง

- Lighthouse Docs: https://developer.chrome.com/docs/lighthouse/
- PageSpeed Insights: https://pagespeed.web.dev/
- Web Vitals: https://web.dev/vitals/
- Lighthouse CI: https://github.com/GoogleChrome/lighthouse-ci

---

> **SYNERRY AI Team** | QA-QC Master v1.0 | April 2026
