# Load Testing --- k6

> **SYNERRY AI Team --- Load & Stress Testing Guide 2026**
>
> k6: Modern load testing tool จาก Grafana ecosystem
> อัปเดตล่าสุด: 2026-04-06

---

## ทำไมเลือก k6 (ไม่ใช่ Artillery)

| เกณฑ์               |                 k6                 |     Artillery     |
| ------------------- | :--------------------------------: | :---------------: |
| ภาษา script         |          JavaScript (ES6)          |     YAML + JS     |
| Performance         |         Go-based (เร็วมาก)         | Node.js (ช้ากว่า) |
| Grafana integration | Native (Grafana Cloud, Prometheus) | ต้อง config เพิ่ม |
| Resource usage      |         ต่ำมาก (Go binary)         | สูงกว่า (Node.js) |
| CLI output          |            สวย + สรุปดี            |      พื้นฐาน      |
| Community (2026)    |           ใหญ่ + active            |     เล็กกว่า      |
| ราคา                |     Free (CLI) / Paid (Cloud)      |    Free + Paid    |

**สรุป:** k6 เร็วกว่า, resource น้อยกว่า, integrate กับ Grafana ecosystem ได้โดยตรง

---

## การติดตั้ง

```bash
# macOS
brew install k6

# หรือ npm (ใช้ k6 จาก container)
# docker run --rm -i grafana/k6 run - <script.js
```

ตรวจสอบ:

```bash
k6 version
# k6 v0.50.0+ expected
```

---

## ประเภท Load Test --- 3 แบบ

| ประเภท          | VUs (Virtual Users) |   ระยะเวลา   | เป้าหมาย                     |
| --------------- | :-----------------: | :----------: | ---------------------------- |
| **Load Test**   |   100 concurrent    |  5-10 นาที   | ทดสอบ normal traffic         |
| **Stress Test** | 500 users (ramp up) |  15-30 นาที  | หาจุด breaking point         |
| **Soak Test**   |    50-100 users     | 8-24 ชั่วโมง | หา memory leaks, degradation |

---

## ตัวอย่าง k6 Scripts

### 1. Basic Load Test (100 concurrent users)

```javascript
// k6/load-test.js
import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  // === Load Profile ===
  stages: [
    { duration: "1m", target: 50 }, // ramp up to 50 users
    { duration: "3m", target: 100 }, // hold at 100 users
    { duration: "1m", target: 0 }, // ramp down to 0
  ],

  // === Thresholds (เกณฑ์ผ่าน/ไม่ผ่าน) ===
  thresholds: {
    http_req_duration: ["p(95)<500"], // 95% requests < 500ms
    http_req_failed: ["rate<0.01"], // error rate < 1%
    http_reqs: ["rate>100"], // throughput > 100 req/s
  },
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:3030";

export default function () {
  // --- Homepage ---
  const homeRes = http.get(`${BASE_URL}/`);
  check(homeRes, {
    "homepage status 200": (r) => r.status === 200,
    "homepage load < 500ms": (r) => r.timings.duration < 500,
  });

  sleep(1); // simulate user think time

  // --- API Endpoint ---
  const apiRes = http.get(`${BASE_URL}/api/projects`);
  check(apiRes, {
    "API status 200": (r) => r.status === 200,
    "API response < 300ms": (r) => r.timings.duration < 300,
    "API returns array": (r) => Array.isArray(JSON.parse(r.body)),
  });

  sleep(1);
}
```

### 2. Stress Test (500 users --- หา breaking point)

```javascript
// k6/stress-test.js
import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "2m", target: 100 }, // ramp up ช้าๆ
    { duration: "3m", target: 200 }, // เพิ่มต่อ
    { duration: "3m", target: 300 }, // เพิ่มต่อ
    { duration: "3m", target: 400 }, // เริ่มหนัก
    { duration: "3m", target: 500 }, // peak load
    { duration: "2m", target: 0 }, // ramp down
  ],

  thresholds: {
    http_req_duration: ["p(99)<2000"], // 99% requests < 2 วินาที
    http_req_failed: ["rate<0.05"], // error rate < 5%
  },
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:3030";

export default function () {
  const res = http.get(`${BASE_URL}/api/health`);
  check(res, {
    "status is 200": (r) => r.status === 200,
  });
  sleep(0.5);
}
```

### 3. Soak Test (8 ชั่วโมง --- หา memory leaks)

```javascript
// k6/soak-test.js
import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "5m", target: 50 }, // ramp up
    { duration: "8h", target: 50 }, // hold 8 ชั่วโมง
    { duration: "5m", target: 0 }, // ramp down
  ],

  thresholds: {
    http_req_duration: ["p(95)<1000"],
    http_req_failed: ["rate<0.01"],
  },
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:3030";

export default function () {
  http.get(`${BASE_URL}/api/health`);
  sleep(2);
}
```

---

## การรัน

```bash
# Load Test
k6 run k6/load-test.js

# Stress Test
k6 run k6/stress-test.js

# Soak Test (รัน background)
k6 run k6/soak-test.js

# กำหนด BASE_URL
k6 run -e BASE_URL=https://staging.viberqc.com k6/load-test.js

# Export results เป็น JSON
k6 run --out json=results.json k6/load-test.js
```

---

## npm Scripts

```json
{
  "scripts": {
    "test:load": "k6 run k6/load-test.js",
    "test:stress": "k6 run k6/stress-test.js",
    "test:soak": "k6 run k6/soak-test.js"
  }
}
```

---

## อ่านผลลัพธ์ k6

```
          /\      |‾‾| /‾‾/   /‾‾/
     /\  /  \     |  |/  /   /  /
    /  \/    \    |     (   /   ‾‾\
   /          \   |  |\  \ |  (‾)  |
  / __________ \  |__| \__\ \_____/ .io

  scenarios: (100.00%) 1 scenario, 100 max VUs, 5m30s max duration

     ✓ homepage status 200
     ✓ homepage load < 500ms
     ✓ API status 200

     checks.........................: 100.00% ✓ 15000 ✗ 0
     http_req_duration..............: avg=120ms  p(95)=350ms  p(99)=480ms
     http_req_failed................: 0.00%   ✓ 0     ✗ 15000
     http_reqs......................: 15000   50.0/s
     vus............................: 100     min=0   max=100
```

| Metric                    | ความหมาย                     | เกณฑ์ผ่าน |
| ------------------------- | ---------------------------- | :-------: |
| `http_req_duration` avg   | เวลาเฉลี่ยต่อ request        |  < 500ms  |
| `http_req_duration` p(95) | 95% ของ requests เร็วกว่านี้ |  < 500ms  |
| `http_req_failed`         | อัตรา error                  |   < 1%    |
| `http_reqs` rate          | จำนวน requests/วินาที        |  > 100/s  |

---

## Performance Checklist --- 19 รายการ (Enterprise 360 Phase 4)

|  #  | รายการตรวจ                      | เกณฑ์                | สถานะ |
| :-: | ------------------------------- | -------------------- | :---: |
|  1  | LCP (Largest Contentful Paint)  | < 2.5 วินาที         |       |
|  2  | INP (Interaction to Next Paint) | < 200ms              |       |
|  3  | CLS (Cumulative Layout Shift)   | < 0.1                |       |
|  4  | TTFB (Time to First Byte)       | < 800ms              |       |
|  5  | FCP (First Contentful Paint)    | < 1.8 วินาที         |       |
|  6  | TBT (Total Blocking Time)       | < 200ms              |       |
|  7  | Speed Index                     | < 3.4 วินาที         |       |
|  8  | API response time (p95)         | < 500ms              |       |
|  9  | API response time (p99)         | < 1 วินาที           |       |
| 10  | Error rate under load           | < 1%                 |       |
| 11  | Concurrent users supported      | >= 100               |       |
| 12  | Database query time (p95)       | < 100ms              |       |
| 13  | Image optimization (WebP/AVIF)  | ใช้ทุกรูป            |       |
| 14  | Gzip/Brotli compression         | เปิด                 |       |
| 15  | CDN configured                  | สำหรับ static assets |       |
| 16  | Bundle size (JS)                | < 200KB gzipped      |       |
| 17  | Bundle size (CSS)               | < 50KB gzipped       |       |
| 18  | Memory usage stable (soak test) | ไม่เพิ่มต่อเนื่อง    |       |
| 19  | Recovery after stress           | กลับปกติ < 1 นาที    |       |

---

## Prompt Template --- Claude CLI สร้าง k6 Tests

```
สร้าง k6 load test script สำหรับ [ชื่อ API / feature]

ข้อกำหนด:
1. ประเภท: [load / stress / soak]
2. VUs: [จำนวน concurrent users]
3. ระยะเวลา: [นาที/ชั่วโมง]
4. Endpoints ที่ต้อง test: [ระบุ]
5. Thresholds:
   - p(95) response time < [ค่า]ms
   - error rate < [ค่า]%
   - throughput > [ค่า] req/s
6. ใส่ checks สำหรับ status code + response body
7. ใส่ sleep เพื่อจำลอง think time

Output:
- ไฟล์ k6 script พร้อมรัน
- อธิบาย stages ว่าทำอะไร
```

---

## อ้างอิง

- k6 Docs: https://grafana.com/docs/k6/
- k6 Examples: https://github.com/grafana/k6/tree/master/examples

---

> **SYNERRY AI Team** | QA-QC Master v1.0 | April 2026
