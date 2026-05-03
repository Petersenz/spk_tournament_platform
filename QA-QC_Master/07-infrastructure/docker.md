# Docker Services

> Docker services ทั้งหมดที่ ViberQC ใช้
> แยกเป็น 3 Docker Compose files ตามหน้าที่

---

## Docker Compose Files

| ไฟล์                                            | หน้าที่      |                       Services                       |
| ----------------------------------------------- | ------------ | :--------------------------------------------------: |
| `docker-compose.sonarqube.yml`                  | Code Quality |                SonarQube + PostgreSQL                |
| `viberqc-central/app/docker-compose.yml`        | Application  |                  PostgreSQL + Redis                  |
| `viberqc-central/monitoring/docker-compose.yml` | Monitoring   | Prometheus, Grafana, Loki, AlertManager, Uptime Kuma |

---

## 1. SonarQube Stack

**ไฟล์**: `docker-compose.sonarqube.yml` (project root)

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
    volumes:
      - sonarqube_pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U sonarqube"]
      interval: 10s
      timeout: 5s
      retries: 5
```

### Commands

```bash
# เปิด SonarQube
npm run sonar:up

# ปิด SonarQube
npm run sonar:down

# ดู logs
npm run sonar:logs

# รัน scan
npm run sonar:scan
```

**URL**: `http://localhost:9000` | Login: `admin` / `admin`

---

## 2. Application Stack (ViberQC Central)

**ไฟล์**: `viberqc-central/app/docker-compose.yml`

```yaml
services:
  postgres:
    image: postgres:16-alpine
    container_name: viberqc-postgres
    environment:
      POSTGRES_USER: viberqc
      POSTGRES_PASSWORD: viberqc_dev_2026
      POSTGRES_DB: viberqc_central
    ports:
      - "5434:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    container_name: viberqc-redis
    ports:
      - "6381:6379"
    volumes:
      - redis_data:/data
```

### Commands

```bash
cd viberqc-central/app
docker compose up -d

# ตรวจสถานะ
docker compose ps
```

| Service    | Image              | Container Port | Host Port |
| ---------- | ------------------ | :------------: | :-------: |
| PostgreSQL | postgres:16-alpine |      5432      | **5434**  |
| Redis      | redis:7-alpine     |      6379      | **6381**  |

---

## 3. Monitoring Stack

**ไฟล์**: `viberqc-central/monitoring/docker-compose.yml`

```yaml
services:
  prometheus:
    image: prom/prometheus:latest
    container_name: viberqc-prometheus
    ports:
      - "9090:9090"
    command:
      - "--config.file=/etc/prometheus/prometheus.yml"
      - "--storage.tsdb.retention.time=30d"

  grafana:
    image: grafana/grafana:latest
    container_name: viberqc-grafana
    ports:
      - "3003:3000"
    environment:
      GF_SECURITY_ADMIN_USER: admin
      GF_SECURITY_ADMIN_PASSWORD: ${GRAFANA_PASSWORD:-admin123}

  loki:
    image: grafana/loki:latest
    container_name: viberqc-loki
    ports:
      - "3100:3100"

  alertmanager:
    image: prom/alertmanager:latest
    container_name: viberqc-alertmanager
    ports:
      - "9093:9093"

  uptime-kuma:
    image: louislam/uptime-kuma:latest
    container_name: viberqc-uptime-kuma
    ports:
      - "3004:3001"
```

### Commands

```bash
cd viberqc-central/monitoring
docker compose up -d

# ตรวจสถานะ
docker compose ps
```

| Service      | Container Port | Host Port | URL                     |
| ------------ | :------------: | :-------: | ----------------------- |
| Prometheus   |      9090      | **9090**  | `http://localhost:9090` |
| Grafana      |      3000      | **3003**  | `http://localhost:3003` |
| Loki         |      3100      | **3100**  | `http://localhost:3100` |
| AlertManager |      9093      | **9093**  | `http://localhost:9093` |
| Uptime Kuma  |      3001      | **3004**  | `http://localhost:3004` |

---

## Port Map รวม

| Port | Service           | Stack        |
| :--: | ----------------- | ------------ |
| 3003 | Grafana           | Monitoring   |
| 3004 | Uptime Kuma       | Monitoring   |
| 3030 | ViberQC App (dev) | Application  |
| 3100 | Loki              | Monitoring   |
| 5434 | PostgreSQL        | Application  |
| 6381 | Redis             | Application  |
| 9000 | SonarQube         | Code Quality |
| 9090 | Prometheus        | Monitoring   |
| 9093 | AlertManager      | Monitoring   |

---

## Docker Commands ที่ใช้บ่อย

```bash
# ดู containers ที่รันอยู่
docker ps

# ดู logs ของ container
docker logs -f <container-name>

# เข้าไปใน container
docker exec -it <container-name> bash

# ลบ volumes ทั้งหมด (ระวัง! ข้อมูลหาย)
docker compose down -v

# ดู disk usage ของ Docker
docker system df

# ลบ unused images/containers
docker system prune
```

---

## Checklist

- [ ] Docker + Docker Compose ติดตั้งแล้ว
- [ ] SonarQube: `npm run sonar:up` → เข้า `localhost:9000` ได้
- [ ] Application: `docker compose up -d` → PostgreSQL + Redis ทำงาน
- [ ] Monitoring: `docker compose up -d` → Grafana `localhost:3003` ได้
- [ ] ไม่มี port conflict (ตรวจด้วย `docker ps`)
