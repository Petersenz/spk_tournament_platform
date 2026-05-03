# Database — PostgreSQL + Redis

> PostgreSQL 16 = primary database
> Redis 7 = caching + sessions
> 2 ORM: Drizzle (root app) + Prisma (central app)

---

## Database Architecture

```
ViberQC App (root)          ViberQC Central
     │                            │
     ▼                            ▼
 Drizzle ORM                 Prisma ORM
     │                            │
     ▼                            ▼
 PostgreSQL                  PostgreSQL
 (port 5432)                 (port 5434)
                                  │
                                  ▼
                              Redis 7
                             (port 6381)
```

---

## PostgreSQL 16

### Docker (ViberQC Central)

```yaml
# viberqc-central/app/docker-compose.yml
postgres:
  image: postgres:16-alpine
  container_name: viberqc-postgres
  environment:
    POSTGRES_USER: viberqc
    POSTGRES_PASSWORD: viberqc_dev_2026
    POSTGRES_DB: viberqc_central
  ports:
    - "5434:5432"
```

### Connection

```env
# Root app (Drizzle)
DATABASE_URL=postgresql://user:password@localhost:5432/viberqc

# Central app (Prisma) — Docker port 5434
DATABASE_URL=postgresql://viberqc:viberqc_dev_2026@localhost:5434/viberqc_central
```

### Connect ด้วย CLI

```bash
# เข้า PostgreSQL ใน Docker
docker exec -it viberqc-postgres psql -U viberqc -d viberqc_central

# หรือใช้ psql จาก host
psql postgresql://viberqc:viberqc_dev_2026@localhost:5434/viberqc_central
```

---

## Redis 7

### Docker

```yaml
# viberqc-central/app/docker-compose.yml
redis:
  image: redis:7-alpine
  container_name: viberqc-redis
  ports:
    - "6381:6379"
```

### ใช้สำหรับ

| Use Case          | ตัวอย่าง                          |
| ----------------- | --------------------------------- |
| **Caching**       | Cache scan results, API responses |
| **Sessions**      | Store user sessions               |
| **Rate Limiting** | Track API request counts          |
| **Queue**         | Background job queue              |

### Connect ด้วย CLI

```bash
# เข้า Redis ใน Docker
docker exec -it viberqc-redis redis-cli

# หรือจาก host
redis-cli -p 6381

# ทดสอบ
redis-cli -p 6381 ping
# → PONG
```

---

## ORM 1: Drizzle (Root App)

### Package

```json
"drizzle-orm": "^0.45.1",      // runtime
"drizzle-kit": "^0.31.9"       // dev tools
```

### Commands

```bash
# Generate migration จาก schema
npm run db:generate

# รัน migration
npm run db:migrate

# Push schema ไป DB (dev only — ไม่สร้าง migration file)
npm run db:push

# เปิด Drizzle Studio (GUI)
npm run db:studio
```

| Command                | npm script            | ทำอะไร                                 |
| ---------------------- | --------------------- | -------------------------------------- |
| `drizzle-kit generate` | `npm run db:generate` | สร้าง migration SQL จาก schema changes |
| `drizzle-kit migrate`  | `npm run db:migrate`  | รัน pending migrations                 |
| `drizzle-kit push`     | `npm run db:push`     | Sync schema → DB โดยตรง (dev)          |
| `drizzle-kit studio`   | `npm run db:studio`   | เปิด web GUI ดูข้อมูล                  |

### Drizzle Studio

```bash
npm run db:studio
# เปิดที่ https://local.drizzle.studio
```

---

## ORM 2: Prisma (Central App)

### Commands (รันใน viberqc-central/app/)

```bash
# สร้าง + รัน migration
npx prisma migrate dev --name <name>

# รัน migration ใน production
npx prisma migrate deploy

# Seed ข้อมูลเริ่มต้น
npx prisma db seed

# Reset DB (ลบทุกอย่าง + seed ใหม่)
npx prisma migrate reset

# เปิด Prisma Studio (GUI)
npx prisma studio
```

| Command                 | ทำอะไร                              |
| ----------------------- | ----------------------------------- |
| `prisma migrate dev`    | สร้าง migration + รัน (development) |
| `prisma migrate deploy` | รัน pending migrations (production) |
| `prisma db seed`        | ใส่ข้อมูลเริ่มต้น                   |
| `prisma migrate reset`  | ลบทั้งหมด + migrate + seed ใหม่     |
| `prisma studio`         | Web GUI ดู/แก้ข้อมูล                |

---

## Backup

### Script

**ไฟล์**: `scripts/backup-db.sh`

```bash
bash scripts/backup-db.sh
```

### ทำอะไร

1. `pg_dump` → compress ด้วย `gzip`
2. เก็บใน `backups/viberqc_YYYYMMDD_HHMMSS.sql.gz`
3. ลบ backup เก่ากว่า 7 วัน

### Cron Setup (Backup ทุกวัน 2 AM)

```bash
# เปิด crontab
crontab -e

# เพิ่มบรรทัดนี้
0 2 * * * /path/to/ViberQC/scripts/backup-db.sh
```

### Restore จาก Backup

```bash
# Decompress + restore
gunzip -c backups/viberqc_20260406_020000.sql.gz | psql $DATABASE_URL
```

---

## Ports สรุป

| Service              | Container Port | Host Port |
| -------------------- | :------------: | :-------: |
| PostgreSQL (central) |      5432      | **5434**  |
| Redis                |      6379      | **6381**  |

---

## Checklist

- [ ] PostgreSQL Docker ทำงาน: `docker exec -it viberqc-postgres pg_isready`
- [ ] Redis Docker ทำงาน: `redis-cli -p 6381 ping` → PONG
- [ ] Drizzle: `npm run db:push` สำเร็จ
- [ ] Drizzle Studio: `npm run db:studio` เปิดได้
- [ ] Backup script: `bash scripts/backup-db.sh` ทำงาน
- [ ] Cron: ตั้ง backup ทุกวัน 2 AM
