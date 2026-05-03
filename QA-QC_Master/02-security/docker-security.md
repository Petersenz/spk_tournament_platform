# Docker Security — Trivy + Hadolint

> ตรวจ security ของ Docker container images และ Dockerfile
> 2 เครื่องมือทำงานคนละหน้าที่: Trivy (image scanning) + Hadolint (Dockerfile linting)

---

## ตาราง Comparison

| Feature              | Trivy                              | Hadolint                               |
| -------------------- | ---------------------------------- | -------------------------------------- |
| **ราคา**             | Free (open-source, Aqua Security)  | Free (open-source)                     |
| **ตรวจอะไร**         | Vulnerabilities ใน container image | Best practices ใน Dockerfile           |
| **เมื่อไหร่**        | หลัง build image / ก่อน deploy     | ขณะเขียน Dockerfile / CI/CD            |
| **Output**           | CVE list + severity                | Lint warnings + suggestions            |
| **Vulnerability DB** | NVD, Red Hat, Alpine, Ubuntu, etc. | Dockerfile best practices (ShellCheck) |

---

## 1. Trivy — Container Image Vulnerability Scanner

### จุดเด่น

- สแกนได้ทั้ง: container image, filesystem, git repo, Kubernetes
- Vulnerability DB อัปเดตอัตโนมัติ
- เร็วมาก (ใช้ local DB cache)
- รองรับ output หลายรูปแบบ: table, JSON, SARIF

### ติดตั้ง

```bash
# macOS
brew install trivy

# Linux
curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b /usr/local/bin

# Docker (ไม่ต้องติดตั้ง)
docker run --rm aquasec/trivy image node:20-alpine

# ตรวจว่าติดตั้งแล้ว
trivy --version
```

### วิธีใช้

```bash
# สแกน Docker image
trivy image node:20-alpine

# สแกนเฉพาะ HIGH + CRITICAL
trivy image --severity HIGH,CRITICAL node:20-alpine

# สแกน local image (ที่ build เอง)
docker build -t viberqc:latest .
trivy image viberqc:latest

# สแกน filesystem (เหมือน SCA)
trivy fs --scanners vuln .

# สร้าง JSON report
trivy image --format json -o trivy-report.json node:20-alpine

# สแกน + fail ถ้าพบ CRITICAL
trivy image --exit-code 1 --severity CRITICAL viberqc:latest
```

### ตัวอย่าง Output

```
node:20-alpine (alpine 3.19.1)

Total: 5 (HIGH: 3, CRITICAL: 2)

┌──────────────┬────────────────┬──────────┬────────────────────┐
│   Library    │ Vulnerability  │ Severity │    Fixed Version   │
├──────────────┼────────────────┼──────────┼────────────────────┤
│ openssl      │ CVE-2024-0727  │ HIGH     │ 3.1.4-r5           │
│ libcrypto3   │ CVE-2024-0727  │ HIGH     │ 3.1.4-r5           │
│ busybox      │ CVE-2023-42364 │ CRITICAL │ 1.36.1-r15         │
└──────────────┴────────────────┴──────────┴────────────────────┘
```

### เพิ่มใน GitLab CI/CD

```yaml
trivy-scan:
  stage: security
  image:
    name: aquasec/trivy:latest
    entrypoint: [""]
  tags:
    - docker
  script:
    - trivy image --exit-code 0 --severity HIGH,CRITICAL --format table $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
  allow_failure: true
  rules:
    - if: $CI_COMMIT_BRANCH == "main"
```

---

## 2. Hadolint — Dockerfile Best Practices Linter

### จุดเด่น

- ตรวจ Dockerfile ตาม best practices
- ใช้ ShellCheck ตรวจ RUN commands
- เร็วมาก (static analysis)
- ป้องกัน: ใช้ root user, ไม่ pin version, layer ไม่ optimized

### ติดตั้ง

```bash
# macOS
brew install hadolint

# Docker (ไม่ต้องติดตั้ง)
docker run --rm -i hadolint/hadolint < Dockerfile

# ตรวจว่าติดตั้งแล้ว
hadolint --version
```

### วิธีใช้

```bash
# ตรวจ Dockerfile
hadolint Dockerfile

# ตรวจด้วย Docker (ไม่ต้องติดตั้ง)
docker run --rm -i hadolint/hadolint < Dockerfile

# ตรวจพร้อม ignore rules
hadolint --ignore DL3008 --ignore DL3009 Dockerfile

# สร้าง JSON report
hadolint --format json Dockerfile > hadolint-report.json
```

### Rules ที่สำคัญ

| Rule       | ตรวจอะไร                                  | Severity |
| ---------- | ----------------------------------------- | -------- |
| **DL3006** | ไม่ระบุ tag ของ base image (ใช้ `latest`) | Warning  |
| **DL3007** | ใช้ `latest` tag                          | Warning  |
| **DL3008** | ไม่ pin version ใน `apt-get install`      | Warning  |
| **DL3009** | ไม่ลบ apt cache หลัง install              | Info     |
| **DL3025** | ใช้ JSON form ใน CMD/ENTRYPOINT           | Warning  |
| **DL4006** | ไม่ตั้ง `SHELL` สำหรับ pipe               | Warning  |
| **SC2086** | ไม่ quote variable ใน shell command       | Warning  |

### ตัวอย่าง Output

```
Dockerfile:3 DL3006 warning: Always tag the version of an image explicitly
Dockerfile:7 DL3008 warning: Pin versions in apt get install
Dockerfile:12 DL3025 warning: Use arguments JSON notation for CMD and ENTRYPOINT arguments
```

### Hadolint Config — `.hadolint.yaml`

```yaml
ignored:
  - DL3008 # ไม่ pin apt version (ยอมรับได้ใน dev)
  - DL3009 # ไม่ลบ apt cache

trustedRegistries:
  - docker.io
  - ghcr.io
```

---

## Workflow แนะนำ

```
เขียน Dockerfile
     │
     ▼
Hadolint (ตรวจ best practices)
     │
     ▼
docker build (build image)
     │
     ▼
Trivy (สแกน vulnerabilities ใน image)
     │
     ▼
ถ้า CRITICAL = 0 → Push to registry
ถ้า CRITICAL > 0 → แก้ base image / upgrade packages
```

---

## Troubleshooting

| ปัญหา                                | วิธีแก้                                       |
| ------------------------------------ | --------------------------------------------- |
| Trivy DB download ช้า                | ใช้ `--skip-db-update` หลัง download ครั้งแรก |
| Trivy สแกน local image ไม่เจอ        | ตรวจว่า build แล้ว: `docker images`           |
| Hadolint ไม่เข้าใจ multi-stage build | ปกติรองรับ — ตรวจ Dockerfile syntax           |
| CI/CD ไม่มี Docker socket            | ใช้ Trivy image mode + Hadolint Docker image  |

---

## Claude CLI Prompt Template

```
ตรวจ Docker security:
1. ถ้ามี Dockerfile — รัน `hadolint Dockerfile` ดู best practices
2. ถ้ามี Docker image — รัน `trivy image --severity HIGH,CRITICAL <image-name>`
3. สรุป: จำนวน findings + severity + วิธีแก้
```
