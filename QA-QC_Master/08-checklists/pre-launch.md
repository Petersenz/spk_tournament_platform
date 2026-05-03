# Pre-Launch Checklist — Deploy & Monitor

> จาก Enterprise 360 Phase 8 — 17 items ก่อน go-live
> ต้องผ่านทุกข้อก่อน deploy production ครั้งแรก/ครั้งสำคัญ

---

## 17 Pre-Launch Items

### Build & Deploy (5 items)

|  ID  | Item                                                                         | Severity | ตรวจด้วย                                        | Status |
| :--: | ---------------------------------------------------------------------------- | :------: | ----------------------------------------------- | :----: |
| PL01 | **Production build สำเร็จ** — `npm run build` ไม่มี error                    | Critical | `npm run build`                                 |   ⬜   |
| PL02 | **Environment variables ครบ** — ทุกค่าใน `.env.production.example` มีค่าจริง | Critical | Manual check                                    |   ⬜   |
| PL03 | **Database migration รันแล้ว** — schema ตรงกับ production DB                 | Critical | `prisma migrate deploy` / `drizzle-kit migrate` |   ⬜   |
| PL04 | **DNS ชี้ถูกต้อง** — domain ชี้ไป production server                          | Critical | `dig viberqc.com`                               |   ⬜   |
| PL05 | **SSL Certificate ติดตั้ง** — HTTPS ใช้งานได้                                | Critical | `curl -I https://viberqc.com`                   |   ⬜   |

### Security (4 items)

|  ID  | Item                                                    | Severity | ตรวจด้วย                    | Status |
| :--: | ------------------------------------------------------- | :------: | --------------------------- | :----: |
| PL06 | **Security scan ผ่าน** — ไม่มี critical/high findings   | Critical | `npm run security`          |   ⬜   |
| PL07 | **Secrets ไม่อยู่ใน code** — API keys ใช้ env variables | Critical | `bash scripts/check-env.sh` |   ⬜   |
| PL08 | **CORS ตั้งถูกต้อง** — เฉพาะ domains ที่อนุญาต          |   High   | Manual check                |   ⬜   |
| PL09 | **Rate limiting เปิด** — ป้องกัน abuse                  |   High   | Manual test                 |   ⬜   |

### Monitoring (4 items)

|  ID  | Item                                                        | Severity | ตรวจด้วย               | Status |
| :--: | ----------------------------------------------------------- | :------: | ---------------------- | :----: |
| PL10 | **Error monitoring เปิด** — Sentry DSN ตั้งค่าแล้ว          | Critical | Check Sentry dashboard |   ⬜   |
| PL11 | **Uptime monitor เปิด** — UptimeRobot/Kuma ตรวจ URL         |   High   | Check UptimeRobot      |   ⬜   |
| PL12 | **Alert notification ตั้งแล้ว** — Lark/Email จะแจ้งเมื่อล่ม |   High   | Test alert             |   ⬜   |
| PL13 | **Health check endpoint มี** — `/api/health` ตอบ 200        |   High   | `curl /api/health`     |   ⬜   |

### Data & Backup (2 items)

|  ID  | Item                                                      | Severity | ตรวจด้วย     | Status |
| :--: | --------------------------------------------------------- | :------: | ------------ | :----: |
| PL14 | **Database backup ตั้งแล้ว** — cron ทำงานทุกวัน 2 AM      | Critical | `crontab -l` |   ⬜   |
| PL15 | **Backup restore ทดสอบแล้ว** — restore จาก backup ได้จริง |   High   | Test restore |   ⬜   |

### Rollback & Recovery (2 items)

|  ID  | Item                                            | Severity | ตรวจด้วย    | Status |
| :--: | ----------------------------------------------- | :------: | ----------- | :----: |
| PL16 | **Rollback plan มี** — รู้วิธีกลับ version เก่า | Critical | Document    |   ⬜   |
| PL17 | **Smoke tests พร้อม** — ทดสอบหลัง deploy ทำงาน  |   High   | Test script |   ⬜   |

---

## Severity Summary

| Severity     | จำนวน | Items                             |
| ------------ | :---: | --------------------------------- |
| **Critical** |   9   | PL01-PL07, PL10, PL14, PL16       |
| **High**     |   8   | PL08, PL09, PL11-PL13, PL15, PL17 |

> Critical ทุกข้อต้องผ่าน — ห้าม deploy ถ้ามีแม้แต่ 1 ข้อ FAIL

---

## Pre-Launch Script

รัน checks อัตโนมัติ:

```bash
#!/bin/bash
# pre-launch-check.sh

echo "Pre-Launch Checklist"
echo "===================="

# PL01: Production build
echo ""
echo "[PL01] Production Build..."
npm run build 2>&1 && echo "  ✅ PASS" || echo "  ❌ FAIL"

# PL06: Security scan
echo ""
echo "[PL06] Security Scan..."
npm run security 2>&1 && echo "  ✅ PASS" || echo "  ❌ FAIL"

# PL07: Secret check
echo ""
echo "[PL07] Secret Check..."
bash scripts/check-env.sh 2>&1 && echo "  ✅ PASS" || echo "  ❌ FAIL"

# PL13: Health check
echo ""
echo "[PL13] Health Check..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3030/api/health)
if [ "$STATUS" = "200" ]; then
  echo "  ✅ PASS (HTTP $STATUS)"
else
  echo "  ❌ FAIL (HTTP $STATUS)"
fi

echo ""
echo "Manual checks remaining:"
echo "  PL02: Verify all env vars are set"
echo "  PL03: Run database migration"
echo "  PL04: Verify DNS records"
echo "  PL05: Verify SSL certificate"
echo "  PL08: Test CORS headers"
echo "  PL09: Test rate limiting"
echo "  PL10: Verify Sentry receives events"
echo "  PL11: Verify uptime monitor"
echo "  PL12: Test alert notification"
echo "  PL14: Verify cron backup"
echo "  PL15: Test backup restore"
echo "  PL16: Document rollback plan"
echo "  PL17: Run smoke tests after deploy"
```

---

## Deploy Day Sequence

```
ก่อน Deploy
  1. รัน pre-launch checklist ทุกข้อ
  2. Backup database (bash scripts/backup-db.sh)
  3. แจ้งทีม: "กำลัง deploy"
  │
Deploy
  4. ตั้ง maintenance page (ถ้าจำเป็น)
  5. Run database migration
  6. Deploy code (GitLab CI/CD → manual trigger)
  7. ปิด maintenance page
  │
หลัง Deploy
  8. รัน smoke tests
  9. ตรวจ Sentry: ไม่มี new errors
  10. ตรวจ Uptime: site ยังเปิดอยู่
  11. แจ้งทีม: "deploy สำเร็จ"
  12. Monitor 15 นาที → ถ้ามีปัญหา → rollback
```

---

## Checklist

- [ ] PL01-PL17 ทุกข้อ ✅
- [ ] Critical items (9 ข้อ) ผ่านทั้งหมด
- [ ] Quality Gate PASS (score >= 60)
- [ ] ทีมรับรู้ว่ากำลัง deploy
- [ ] Rollback plan พร้อม
