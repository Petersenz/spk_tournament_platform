# SonarQube Community Edition — SAST + Code Quality

> SonarQube = Static Application Security Testing (SAST) + Code Smells + Tech Debt + Coverage
> Self-hosted ผ่าน Docker, มี dashboard สวยงาม, free สำหรับ Community Edition

---

## ข้อมูลเบื้องต้น

| รายการ            | รายละเอียด                                   |
| ----------------- | -------------------------------------------- |
| **ประเภท**        | SAST + Code Quality Platform                 |
| **ราคา**          | Free (Community Edition, self-hosted)        |
| **ทำงานที่**      | Docker container (localhost:9000)            |
| **ใช้ตอนไหน**     | สัปดาห์ละครั้ง / ก่อน release / ใน CI/CD     |
| **ภาษาที่รองรับ** | 30+ ภาษา (JS, TS, Java, Python, Go, C#, ...) |
| **Dashboard**     | `http://localhost:9000`                      |

---

## สิ่งที่ SonarQube ตรวจ

| หมวด                  | ตรวจอะไร                               | ตัวอย่าง                                  |
| --------------------- | -------------------------------------- | ----------------------------------------- |
| **Bugs**              | Code ที่อาจทำให้เกิด runtime error     | null pointer, type mismatch               |
| **Vulnerabilities**   | ช่องโหว่ด้าน security (SAST)           | SQL injection, XSS, hardcoded credentials |
| **Code Smells**       | Code ที่ทำงานได้แต่ maintain ยาก       | cognitive complexity, duplicate code      |
| **Tech Debt**         | เวลาที่ต้องใช้ fix code smells ทั้งหมด | "2 days to fix all issues"                |
| **Coverage**          | Test coverage (ถ้าส่ง lcov report)     | "67% line coverage"                       |
| **Duplications**      | Code ที่ copy-paste                    | "15 duplicated blocks"                    |
| **Security Hotspots** | Code ที่ต้อง review ด้าน security      | crypto usage, file permissions            |

---

## สิ่งที่ตั้งค่าไว้แล้วใน project

### 1. Docker Compose — `docker-compose.sonarqube.yml`

```yaml
services:
  sonarqube:
    image: sonarqube:community
    container_name: viberqc-sonarqube
    depends_on:
      sonarqube-db:
        condition: service_healthy
    environment:
      SONAR_JDBC_URL: jdbc:postgresql://sonarqube-db:5432/sonarqube
      SONAR_JDBC_USERNAME: sonarqube
      SONAR_JDBC_PASSWORD: sonarqube
    ports:
      - "9000:9000"
    volumes:
      - sonarqube_data:/opt/sonarqube/data
      - sonarqube_logs:/opt/sonarqube/logs
      - sonarqube_extensions:/opt/sonarqube/extensions

  sonarqube-db:
    image: postgres:16-alpine
    container_name: viberqc-sonarqube-db
    environment:
      POSTGRES_USER: sonarqube
      POSTGRES_PASSWORD: sonarqube
      POSTGRES_DB: sonarqube
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U sonarqube"]
      interval: 10s
      timeout: 5s
      retries: 5
```

### 2. Project Config — `sonar-project.properties`

```properties
sonar.projectKey=viberqc
sonar.projectName=ViberQC
sonar.projectVersion=1.0.0

sonar.sources=src
sonar.tests=src
sonar.test.inclusions=**/*.test.ts,**/*.test.tsx,**/*.spec.ts,**/*.spec.tsx

sonar.exclusions=node_modules/**,.next/**,coverage/**,public/**,Docs/**,scripts/**

sonar.typescript.lcov.reportPaths=coverage/lcov.info
sonar.javascript.lcov.reportPaths=coverage/lcov.info
sonar.sourceEncoding=UTF-8
```

### 3. npm Scripts (package.json)

```bash
npm run sonar:up      # เปิด SonarQube + PostgreSQL (Docker)
npm run sonar:scan    # สแกน project ด้วย sonar-scanner
npm run sonar:down    # ปิด SonarQube
npm run sonar:logs    # ดู logs ของ SonarQube container
```

---

## วิธีใช้งาน — Step by Step

### ครั้งแรก: Setup

```bash
# 1. เปิด SonarQube (ใช้เวลาประมาณ 1-2 นาที)
npm run sonar:up

# 2. รอจนพร้อม — เปิด browser ไปที่:
#    http://localhost:9000
#    Login: admin / admin (เปลี่ยน password ครั้งแรก)

# 3. สร้าง Project Token:
#    My Account → Security → Generate Tokens
#    ตั้งชื่อ: viberqc-scanner
#    Copy token แล้วเก็บใน .env:
echo "SONAR_TOKEN=sqp_xxxxxxxxxxxx" >> .env

# 4. สแกนครั้งแรก
npm run sonar:scan

# 5. ดูผลลัพธ์ที่ dashboard
#    http://localhost:9000/dashboard?id=viberqc
```

### ใช้งานประจำ

```bash
# เปิด SonarQube
npm run sonar:up

# สแกน (ทุกครั้งที่ต้องการตรวจ)
npm run sonar:scan

# ดูผลลัพธ์ที่ http://localhost:9000

# ปิดเมื่อเสร็จ (ประหยัด resource)
npm run sonar:down
```

---

## SonarQube Dashboard — อ่านผลลัพธ์อย่างไร

### Quality Gate Status

| สถานะ                | ความหมาย                     |
| -------------------- | ---------------------------- |
| **Passed** (สีเขียว) | ผ่านเกณฑ์ทุกข้อ — deploy ได้ |
| **Failed** (สีแดง)   | ไม่ผ่านเกณฑ์ — ต้องแก้ก่อน   |

### Metrics ที่สำคัญ

| Metric          | เกณฑ์ที่ดี | ความหมาย              |
| --------------- | ---------- | --------------------- |
| Bugs            | 0          | ไม่มี bug ที่ตรวจพบ   |
| Vulnerabilities | 0          | ไม่มีช่องโหว่         |
| Code Smells     | < 50       | Code ที่ maintain ยาก |
| Coverage        | > 60%      | Test coverage         |
| Duplications    | < 5%       | Code ซ้ำ              |
| Debt Ratio      | < 5%       | สัดส่วน tech debt     |

### Severity Levels

| ระดับ        | ความหมาย                            | ต้องแก้เมื่อ |
| ------------ | ----------------------------------- | ------------ |
| **Blocker**  | ทำให้ app crash / มีช่องโหว่ร้ายแรง | ทันที        |
| **Critical** | Bug ร้ายแรง / security issue        | ก่อน release |
| **Major**    | Code smell ที่ส่งผลกระทบ            | Sprint ถัดไป |
| **Minor**    | Code smell เล็กน้อย                 | เมื่อมีเวลา  |
| **Info**     | ข้อมูลเพิ่มเติม                     | Optional     |

---

## SonarLint — Real-time Scanning ใน IDE

SonarLint เป็น extension สำหรับ VS Code / Cursor ที่ตรวจ code ขณะเขียน:

### ติดตั้ง

1. เปิด VS Code / Cursor
2. Extensions → ค้นหา `SonarLint`
3. Install: **SonarQube for IDE** (ID: `sonarsource.sonarlint-vscode`)

### เชื่อมต่อกับ SonarQube (Connected Mode)

1. เปิด VS Code Settings (Ctrl+,)
2. ค้นหา `sonarlint.connectedMode`
3. เพิ่ม config:

```json
{
  "sonarlint.connectedMode.connections.sonarqube": [
    {
      "connectionId": "viberqc-local",
      "serverUrl": "http://localhost:9000",
      "token": "sqp_xxxxxxxxxxxx"
    }
  ],
  "sonarlint.connectedMode.project": {
    "connectionId": "viberqc-local",
    "projectKey": "viberqc"
  }
}
```

### ประโยชน์ของ Connected Mode

- rules ใน IDE ตรงกับ SonarQube server
- เห็น issue ทันทีขณะเขียน ไม่ต้องรอ scan
- ลด feedback loop จากนาที เหลือวินาที

---

## SonarQube + Coverage Report

ส่ง test coverage ไปยัง SonarQube:

```bash
# 1. รัน test พร้อม coverage
npx vitest run --coverage

# 2. ตรวจว่า coverage/lcov.info ถูกสร้าง
ls coverage/lcov.info

# 3. สแกน SonarQube (จะอ่าน lcov.info อัตโนมัติ)
npm run sonar:scan
```

Config ที่เกี่ยวข้องใน `sonar-project.properties`:

```properties
sonar.typescript.lcov.reportPaths=coverage/lcov.info
sonar.javascript.lcov.reportPaths=coverage/lcov.info
```

---

## Troubleshooting

| ปัญหา                     | วิธีแก้                                               |
| ------------------------- | ----------------------------------------------------- |
| SonarQube เปิดช้า         | ปกติใช้เวลา 1-2 นาที — ตรวจ `npm run sonar:logs`      |
| Port 9000 ถูกใช้อยู่      | เปลี่ยน port ใน docker-compose.sonarqube.yml          |
| Scanner หา project ไม่เจอ | ตรวจว่า `sonar-project.properties` อยู่ที่ root       |
| SONAR_TOKEN ไม่ถูก        | สร้าง token ใหม่ที่ Dashboard → My Account → Security |
| Out of memory             | เพิ่ม Docker memory limit เป็น 4GB+                   |
| Coverage ไม่แสดง          | ตรวจว่า coverage/lcov.info มีอยู่จริง                 |

---

## Claude CLI Prompt Template

```
ตรวจ code quality ด้วย SonarQube:
1. ตรวจว่า SonarQube container รันอยู่ไหม (docker ps | grep sonarqube)
2. ถ้าไม่รัน — เปิดด้วย `npm run sonar:up` แล้วรอจนพร้อม
3. รัน `npm run sonar:scan` แล้วสรุปผล
4. เปิด http://localhost:9000/dashboard?id=viberqc ดู:
   - Bugs / Vulnerabilities / Code Smells จำนวนเท่าไหร่
   - Quality Gate ผ่านไหม
   - Blocker/Critical issues มีอะไรบ้าง
5. สรุปเป็นตาราง: หมวด | จำนวน | severity | ต้องแก้ก่อน release ไหม
6. ถ้ามี Blocker/Critical — เสนอแนวทางแก้ไข
```
