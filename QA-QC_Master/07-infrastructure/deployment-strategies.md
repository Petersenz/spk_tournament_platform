# Deployment Strategies

> วิธี deploy ที่ลดความเสี่ยง — ไม่ใช่แค่ `git pull` แล้วจบ
> รวม Canary, Blue-Green, Feature Flags, Rollback Plan

---

## Strategy Comparison

| Strategy               | ความเสี่ยง | ความซับซ้อน | เหมาะกับ           |
| ---------------------- | :--------: | :---------: | ------------------ |
| **Rolling** (ปัจจุบัน) |    สูง     |     ต่ำ     | Dev/Staging        |
| **Canary**             |    ต่ำ     |    กลาง     | Production (แนะนำ) |
| **Blue-Green**         |   ต่ำมาก   |     สูง     | Mission-critical   |
| **Feature Flags**      |   ต่ำมาก   |    กลาง     | Feature-by-feature |

---

## 1. Canary Deployment

### แนวคิด

ส่ง traffic บางส่วน (เช่น 5%) ไป version ใหม่ก่อน
ถ้าไม่มีปัญหา → เพิ่มเป็น 25% → 50% → 100%

```
Users ──▶ Load Balancer
               │
         ┌─────┴─────┐
         ▼           ▼
    Old Version   New Version
     (95%)          (5%)
```

### ขั้นตอน

1. Deploy version ใหม่ไป server ตัวที่ 2 (canary)
2. Route 5% traffic ไป canary
3. Monitor 15 นาที:
   - Error rate ไม่เพิ่ม?
   - Response time ปกติ?
   - User complaints?
4. ถ้า OK → เพิ่ม traffic 25% → 50% → 100%
5. ถ้ามีปัญหา → route traffic กลับ old version ทันที

### ข้อดี/ข้อเสีย

| ข้อดี           | ข้อเสีย              |
| --------------- | -------------------- |
| เห็นปัญหาเร็ว   | ต้องมี 2 servers     |
| กระทบ user น้อย | ต้องมี load balancer |
| Rollback ง่าย   | ซับซ้อนกว่า rolling  |

---

## 2. Blue-Green Deployment

### แนวคิด

มี 2 environments เหมือนกัน (Blue + Green)
ตอนนี้ Blue ให้บริการ → deploy ไป Green → สลับ traffic

```
Before:
Users ──▶ Blue (v1.0) ✅
          Green (idle)

After deploy:
Users ──▶ Green (v1.1) ✅
          Blue (v1.0 — standby for rollback)
```

### ขั้นตอน

1. ปัจจุบัน Blue ให้บริการ
2. Deploy version ใหม่ไป Green
3. Smoke test Green
4. สลับ DNS/Load Balancer ให้ชี้ไป Green
5. Blue กลายเป็น standby (rollback ได้ทันที)

### ข้อดี/ข้อเสีย

| ข้อดี                     | ข้อเสีย                      |
| ------------------------- | ---------------------------- |
| Zero downtime             | ต้องมี infrastructure 2x     |
| Instant rollback          | ค่า server สูงกว่า           |
| ทดสอบ production-like ได้ | Database migration ต้องระวัง |

---

## 3. Feature Flags

### แนวคิด

Deploy code ใหม่ทั้งหมด แต่ซ่อนไว้หลัง flag
เปิด flag → user เห็น feature ใหม่
ปิด flag → user เห็น feature เดิม

```typescript
if (featureFlags.isEnabled("new-dashboard")) {
  showNewDashboard();
} else {
  showOldDashboard();
}
```

### เครื่องมือ: LaunchDarkly (Option)

| Plan      |    ราคา     | Features               |
| --------- | :---------: | ---------------------- |
| Developer |    Free     | 1,000 seats, 1 project |
| Starter   | $12/seat/mo | Multiple projects      |
| Pro       | $25/seat/mo | Advanced targeting     |

### Alternative: PostHog Feature Flags (ฟรี)

PostHog มี Feature Flags built-in — ไม่ต้องจ่ายเพิ่ม
ดู [../05-monitoring/analytics.md](../05-monitoring/analytics.md)

### ข้อดี/ข้อเสีย

| ข้อดี                  | ข้อเสีย                    |
| ---------------------- | -------------------------- |
| Deploy ได้ทุกเมื่อ     | Code ซับซ้อนขึ้น (if/else) |
| เปิด/ปิดไม่ต้อง deploy | ต้องลบ flag เก่าเป็นระยะ   |
| A/B test ได้           | ต้องทดสอบ 2 paths          |

---

## 4. Rollback Plan

### ทุกครั้งที่ deploy ต้องมี rollback plan พร้อม:

| ขั้นตอน | Command                | ทำอะไร              |
| :-----: | ---------------------- | ------------------- |
|    1    | `git log --oneline -5` | ดู commit ก่อนหน้า  |
|    2    | `git revert HEAD`      | สร้าง revert commit |
|    3    | `git push origin main` | Push revert         |
|    4    | Deploy revert commit   | ใช้ CI/CD pipeline  |

### Database Rollback

ถ้า deploy มี database migration:

1. ทดสอบ migration ใน staging ก่อน
2. เขียน rollback migration (down migration) เสมอ
3. Backup database ก่อน migrate (ดู [database.md](database.md))

```bash
# Backup ก่อน deploy
bash scripts/backup-db.sh

# ถ้าต้อง rollback
gunzip -c backups/viberqc_latest.sql.gz | psql $DATABASE_URL
```

---

## 5. Post-Deploy Smoke Tests

### ทดสอบหลัง deploy ทุกครั้ง:

| Test           | ตรวจอะไร          | วิธี                                                         |
| -------------- | ----------------- | ------------------------------------------------------------ |
| Homepage loads | เว็บเปิดได้       | `curl -s -o /dev/null -w "%{http_code}" https://viberqc.com` |
| API health     | API ทำงาน         | `curl https://viberqc.com/api/health`                        |
| Login works    | Auth ทำงาน        | Manual test / E2E                                            |
| Core feature   | Scan ทำงาน        | Manual test / E2E                                            |
| Error rate     | ไม่มี error spike | Check Sentry dashboard                                       |

### Automated Smoke Test Script

```bash
#!/bin/bash
# post-deploy-smoke.sh

URL="${1:-https://viberqc.com}"
PASS=0
FAIL=0

check() {
  local name=$1
  local endpoint=$2
  local expected=$3
  local status=$(curl -s -o /dev/null -w "%{http_code}" "$endpoint")

  if [ "$status" = "$expected" ]; then
    echo "  ✅ $name (HTTP $status)"
    ((PASS++))
  else
    echo "  ❌ $name (HTTP $status, expected $expected)"
    ((FAIL++))
  fi
}

echo "🔍 Post-Deploy Smoke Tests"
echo "   URL: $URL"
echo ""

check "Homepage" "$URL" "200"
check "API Health" "$URL/api/health" "200"
check "Login Page" "$URL/login" "200"
check "404 Page" "$URL/nonexistent-page-test" "404"

echo ""
echo "Results: $PASS passed, $FAIL failed"

if [ $FAIL -gt 0 ]; then
  echo "❌ SMOKE TESTS FAILED — consider rollback"
  exit 1
fi
echo "✅ All smoke tests passed"
```

---

## Deployment Strategy ที่แนะนำตาม Stage

| Stage                | Strategy                   | เหตุผล        |
| -------------------- | -------------------------- | ------------- |
| MVP / Early          | Rolling + Smoke tests      | เร็ว, ง่าย    |
| Growth (users > 100) | **Canary** + Feature Flags | ลดความเสี่ยง  |
| Enterprise (SLA)     | Blue-Green + Canary        | Zero downtime |

---

## Checklist

- [ ] มี rollback plan ก่อน deploy ทุกครั้ง
- [ ] Backup database ก่อน deploy ที่มี migration
- [ ] รัน smoke tests หลัง deploy
- [ ] Monitor error rate 15 นาทีหลัง deploy (Sentry)
- [ ] ตรวจ Uptime Monitor ไม่มี downtime
