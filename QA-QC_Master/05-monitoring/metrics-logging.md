# Metrics & Logging — Prometheus + Grafana + Loki

> 3 เครื่องมือทำงานร่วมกัน แต่ละตัวมีหน้าที่ต่างกัน
> ทั้งหมด free, self-hosted ผ่าน Docker

---

## แต่ละตัวทำอะไร?

| เครื่องมือ       | หน้าที่               | เปรียบเทียบ                                            |
| ---------------- | --------------------- | ------------------------------------------------------ |
| **Prometheus**   | เก็บ metrics (ตัวเลข) | เหมือนนักบัญชี — จด CPU, memory, request count         |
| **Grafana**      | แสดง dashboard สวยๆ   | เหมือนจอทีวี — แสดงกราฟจากข้อมูล Prometheus + Loki     |
| **Loki**         | เก็บ logs (ข้อความ)   | เหมือนสมุดจดบันทึก — เก็บ log ทุกบรรทัด                |
| **AlertManager** | ส่งแจ้งเตือน          | เหมือนเด็กส่งสาร — รับ alert จาก Prometheus แล้วส่งต่อ |

```
App → Prometheus (เก็บ metrics)  ─┐
                                   ├──▶ Grafana (แสดง dashboard)
App → Loki (เก็บ logs)           ─┘
                                        │
Prometheus → AlertManager ──▶ Lark/Email (แจ้งเตือน)
```

---

## Docker Compose

ทั้งหมดอยู่ใน `viberqc-central/monitoring/docker-compose.yml`:

```yaml
services:
  prometheus:
    image: prom/prometheus:latest
    container_name: viberqc-prometheus
    restart: unless-stopped
    volumes:
      - ./prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    ports:
      - "9090:9090"
    command:
      - "--config.file=/etc/prometheus/prometheus.yml"
      - "--storage.tsdb.retention.time=30d"

  grafana:
    image: grafana/grafana:latest
    container_name: viberqc-grafana
    restart: unless-stopped
    volumes:
      - grafana_data:/var/lib/grafana
      - ./grafana/provisioning:/etc/grafana/provisioning
    ports:
      - "3003:3000"
    environment:
      GF_SECURITY_ADMIN_USER: admin
      GF_SECURITY_ADMIN_PASSWORD: ${GRAFANA_PASSWORD:-admin123}
      GF_USERS_ALLOW_SIGN_UP: "false"

  loki:
    image: grafana/loki:latest
    container_name: viberqc-loki
    restart: unless-stopped
    volumes:
      - ./loki/loki-config.yml:/etc/loki/local-config.yaml
      - loki_data:/loki
    ports:
      - "3100:3100"

  alertmanager:
    image: prom/alertmanager:latest
    container_name: viberqc-alertmanager
    restart: unless-stopped
    volumes:
      - ./alertmanager/alertmanager.yml:/etc/alertmanager/alertmanager.yml
    ports:
      - "9093:9093"
```

### เปิดทั้งหมด

```bash
cd viberqc-central/monitoring
docker compose up -d

# ตรวจสถานะ
docker compose ps
```

---

## 1. Prometheus — Metrics Collection

### เข้าถึง

- **URL**: `http://localhost:9090`
- **Port**: 9090

### Prometheus ทำอะไร?

- ดึง (scrape) ตัวเลขจาก targets ทุก 15 วินาที
- เก็บข้อมูลไว้ 30 วัน (ตั้งค่าใน `--storage.tsdb.retention.time=30d`)
- ใช้ภาษา PromQL ในการ query

### Metrics ที่ควรเก็บ

| Metric                          | ประเภท    | ความหมาย                              |
| ------------------------------- | --------- | ------------------------------------- |
| `http_requests_total`           | Counter   | จำนวน HTTP requests ทั้งหมด           |
| `http_request_duration_seconds` | Histogram | เวลาตอบ request                       |
| `process_cpu_seconds_total`     | Counter   | CPU ที่ใช้                            |
| `process_resident_memory_bytes` | Gauge     | Memory ที่ใช้                         |
| `up`                            | Gauge     | Target ยังทำงานอยู่ไหม (1=up, 0=down) |

### PromQL ตัวอย่าง

```promql
# Request rate ใน 5 นาทีที่ผ่านมา
rate(http_requests_total[5m])

# P95 response time
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# Memory usage เป็น MB
process_resident_memory_bytes / 1024 / 1024

# Uptime status ของทุก target
up
```

### Config: prometheus.yml

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: "viberqc-app"
    static_configs:
      - targets: ["host.docker.internal:3030"]

  - job_name: "node-exporter"
    static_configs:
      - targets: ["node-exporter:9100"]
```

---

## 2. Grafana — Dashboard Visualization

### เข้าถึง

- **URL**: `http://localhost:3003`
- **Port**: 3003
- **Login**: `admin` / `admin123` (ค่า default)
- **เปลี่ยนรหัส**: Settings → Change password (แนะนำ)

### Grafana ทำอะไร?

- แสดง graph/chart จาก Prometheus + Loki
- สร้าง dashboard แบบ drag & drop
- ตั้ง alert ได้ (นอกจาก AlertManager)
- Share dashboard ให้ทีมดูได้

### ตั้ง Data Sources

1. เข้า Grafana → Configuration → Data Sources
2. Add data source:

| Data Source | Type       | URL                      |
| ----------- | ---------- | ------------------------ |
| Prometheus  | Prometheus | `http://prometheus:9090` |
| Loki        | Loki       | `http://loki:3100`       |

> ใช้ชื่อ container (prometheus, loki) เพราะอยู่ใน Docker network เดียวกัน

### Dashboard แนะนำ

| Dashboard          |  ID  | แสดงอะไร                   |
| ------------------ | :--: | -------------------------- |
| Node Exporter Full | 1860 | CPU, Memory, Disk, Network |
| Prometheus Stats   |  2   | Prometheus ตัวเอง          |
| Loki Logs          |  —   | สร้างเอง (Explore → Loki)  |

วิธี import:

1. Dashboards → Import
2. ใส่ Dashboard ID → Load
3. เลือก Data Source → Import

### สร้าง Dashboard เอง

1. Dashboards → New Dashboard → Add Panel
2. เลือก Data Source: Prometheus
3. ใส่ PromQL query
4. เลือก Visualization type (Graph, Gauge, Stat, Table)
5. Save

### Dashboard ที่ควรมี

| Panel             | Query (PromQL)                                 | Type  |
| ----------------- | ---------------------------------------------- | :---: |
| Request Rate      | `rate(http_requests_total[5m])`                | Graph |
| Response Time P95 | `histogram_quantile(0.95, ...)`                | Gauge |
| Error Rate        | `rate(http_requests_total{status=~"5.."}[5m])` | Graph |
| Memory Usage      | `process_resident_memory_bytes / 1024^2`       | Gauge |
| Uptime            | `up`                                           | Stat  |

---

## 3. Loki — Log Aggregation

### เข้าถึง

- **URL**: `http://localhost:3100` (API only — ดูผ่าน Grafana)
- **Port**: 3100

### Loki ทำอะไร?

- เก็บ log จาก application
- ค้นหา log ด้วย LogQL (คล้าย PromQL)
- ดูผ่าน Grafana Explore

### ส่ง Log ไป Loki

วิธีหลัก: ใช้ **Promtail** (log agent) — เพิ่ม `grafana/promtail:latest` ใน docker-compose

### LogQL ตัวอย่าง (ใช้ใน Grafana Explore)

```logql
# ดู log ทั้งหมดจาก viberqc
{app="viberqc"}

# เฉพาะ error logs
{app="viberqc", level="error"}

# ค้นหาคำใน log
{app="viberqc"} |= "database connection"

# นับ error ต่อนาที
count_over_time({app="viberqc", level="error"}[1m])
```

---

## 4. AlertManager — Alert Routing

### เข้าถึง

- **URL**: `http://localhost:9093`
- **Port**: 9093

### AlertManager ทำอะไร?

- รับ alert จาก Prometheus
- จัดกลุ่ม (group) alert ที่คล้ายกัน
- ส่งต่อไป email, Lark, PagerDuty

> ดูรายละเอียดเพิ่มที่ [alerting.md](alerting.md)

---

## Ports สรุป

| Service      | Container Port | Host Port | URL                     |
| ------------ | :------------: | :-------: | ----------------------- |
| Prometheus   |      9090      | **9090**  | `http://localhost:9090` |
| Grafana      |      3000      | **3003**  | `http://localhost:3003` |
| Loki         |      3100      | **3100**  | `http://localhost:3100` |
| AlertManager |      9093      | **9093**  | `http://localhost:9093` |

---

## Checklist

- [ ] `docker compose up -d` เปิด monitoring stack
- [ ] เข้า Grafana `http://localhost:3003` ได้
- [ ] เพิ่ม Data Source: Prometheus + Loki
- [ ] Import dashboard Node Exporter Full (ID: 1860)
- [ ] สร้าง dashboard สำหรับ ViberQC app
- [ ] ตั้ง AlertManager rules (ดู [alerting.md](alerting.md))
- [ ] ทดสอบ: จงใจ crash service แล้วดูว่า alert ส่งออกมา
