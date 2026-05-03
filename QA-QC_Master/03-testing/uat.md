# UAT --- User Acceptance Testing

> **SYNERRY AI Team --- UAT Process Guide 2026**
>
> กระบวนการทดสอบโดย user จริงก่อน launch
> อัปเดตล่าสุด: 2026-04-06

---

## UAT คืออะไร

UAT คือขั้นตอนสุดท้ายของ Testing Pyramid --- ให้ **user จริง** (ไม่ใช่ dev) ทดสอบว่า:

- ระบบทำงานตรงกับ requirements ที่ตกลงไว้
- UX ใช้งานได้จริงในสถานการณ์จริง
- ไม่มี flow ที่สับสนหรือติดขัด

---

## ใครทดสอบ

| บทบาท                  | ทำอะไร                           | จำนวน  |
| ---------------------- | -------------------------------- | :----: |
| **Product Owner**      | ตรวจว่าตรง requirements          |  1 คน  |
| **End Users (ตัวแทน)** | ใช้งานจริงตาม flow               | 3-5 คน |
| **Stakeholders**       | review ภาพรวม + approve          | 1-2 คน |
| **QA Lead**            | จัดการ session + รวบรวม feedback |  1 คน  |

**รวม:** 6-9 คน ต่อ UAT session

---

## เมื่อไหร่ทำ UAT

```
Dev Complete --> Unit Tests PASS --> Integration Tests PASS --> E2E Tests PASS
    |
    +--> Deploy to Staging
            |
            +--> UAT Session (1-3 วัน)
                    |
                    +--> PASS --> Deploy to Production
                    |
                    +--> FAIL --> Fix --> Re-test --> PASS
```

### เงื่อนไขก่อนเริ่ม UAT

- [ ] ทุก automated tests ผ่าน (unit, integration, e2e)
- [ ] Deploy ขึ้น staging environment แล้ว
- [ ] Test data พร้อม (ข้อมูลจำลองสำหรับทดสอบ)
- [ ] UAT test cases เตรียมไว้แล้ว
- [ ] ผู้ทดสอบได้รับ brief + access

---

## UAT Process --- 5 ขั้นตอน

### 1. เตรียม Test Cases

สร้าง test cases จาก user stories / requirements:

|  #  | Feature | Test Case                   | Steps                                             | Expected Result      | Status |
| :-: | ------- | --------------------------- | ------------------------------------------------- | -------------------- | :----: |
|  1  | Login   | login ด้วย email + password | 1. ไปหน้า login 2. ใส่ credentials 3. คลิก login  | เข้า dashboard       |        |
|  2  | Login   | login ด้วย password ผิด     | 1. ไปหน้า login 2. ใส่ password ผิด 3. คลิก login | แสดง error message   |        |
|  3  | Project | สร้าง project ใหม่          | 1. คลิก "New Project" 2. กรอกข้อมูล 3. บันทึก     | project ปรากฏใน list |        |

### 2. จัด UAT Session

- **ระยะเวลา:** 1-3 วัน (ขึ้นกับ scope)
- **สถานที่:** remote (ผ่าน video call + screen share) หรือ on-site
- **เครื่องมือ:** Google Meet/Zoom + Google Sheets (tracking)

### 3. ผู้ทดสอบทำตาม Test Cases

- ทำตาม steps ที่เตรียมไว้
- บันทึกผล: PASS / FAIL / BLOCKED
- ถ้า FAIL: ถ่าย screenshot + อธิบายปัญหา

### 4. รวบรวม Feedback

รวม feedback ทั้งหมดแบ่งเป็น 3 กลุ่ม:

| กลุ่ม       | ความหมาย                | Action                |
| ----------- | ----------------------- | --------------------- |
| **Blocker** | ใช้งานไม่ได้เลย         | ต้องแก้ก่อน launch    |
| **Major**   | ใช้ได้แต่สร้างปัญหา     | ควรแก้ก่อน launch     |
| **Minor**   | cosmetic / nice-to-have | แก้ใน sprint ถัดไปได้ |

### 5. Sign-off

- Product Owner + Stakeholders approve
- ลงชื่อ sign-off document
- ถ้ามี open issues --- ต้อง agree ว่าข้อไหนยอมรับได้

---

## Maze --- Usability Testing (Optional, Paid)

> Maze เป็น platform สำหรับ remote usability testing

### เมื่อไหร่ควรใช้ Maze

- ต้องการ quantitative data (task completion rate, time on task)
- ต้องการทดสอบกับ user จำนวนมาก (> 10 คน)
- ต้อง heatmap + click tracking

### เมื่อไหร่ไม่ต้องใช้

- ทีมเล็ก (< 5 คน) --- ใช้ video call + Google Sheets ก็พอ
- Budget จำกัด --- Maze เริ่มต้น $99/mo

### ราคา Maze

| Plan         |         ราคา/เดือน          |
| ------------ | :-------------------------: |
| Free         | 1 project, limited features |
| Pro          |           $99/mo            |
| Organization |           Custom            |

---

## Cross-Device Testing Requirements

UAT ต้องทดสอบบนอุปกรณ์หลากหลาย:

| อุปกรณ์             | Viewport | ต้อง test |
| ------------------- | -------- | :-------: |
| Desktop (1920x1080) | Full HD  |    Yes    |
| Laptop (1366x768)   | HD       |    Yes    |
| Tablet (iPad)       | 810x1080 |    Yes    |
| Mobile (iPhone 14)  | 390x844  |    Yes    |
| Mobile (Android)    | 360x800  |    Yes    |

### Checklist Cross-Device

- [ ] Layout ไม่แตก / ไม่ overflow บนทุกขนาด
- [ ] Touch targets >= 44x44px บน mobile
- [ ] Forms ใช้งานได้บน mobile keyboard
- [ ] Navigation menu ทำงานถูกต้องบน mobile (hamburger menu)
- [ ] Images scale ถูกต้อง ไม่หาย / ไม่ล้น
- [ ] Scroll ทำงานปกติ ไม่ติดค้าง
- [ ] Modals/Popups ไม่ล้นจอบน mobile

---

## Manual Testing Checklists

### Functional Testing

- [ ] ทุก form submit ทำงานถูกต้อง
- [ ] ทุก button/link นำไปหน้าที่ถูกต้อง
- [ ] Error messages แสดงเมื่อ input ไม่ถูกต้อง
- [ ] Loading states แสดงระหว่างรอ
- [ ] Empty states แสดงเมื่อไม่มีข้อมูล
- [ ] Pagination ทำงานถูกต้อง
- [ ] Search/Filter ให้ผลลัพธ์ถูกต้อง
- [ ] CRUD operations ทำงานครบ (Create, Read, Update, Delete)

### UX Testing

- [ ] Flow ใช้งานเข้าใจง่าย ไม่ต้องอ่าน manual
- [ ] ข้อความ/label ชัดเจน ไม่กำกวม
- [ ] Feedback ทุก action (success toast, error message)
- [ ] ไม่มี dead-end (หน้าที่ไปต่อไม่ได้)
- [ ] Back button ทำงานถูกต้อง
- [ ] Breadcrumb/navigation ช่วยให้รู้ว่าอยู่ตรงไหน

---

## Definition of Done (UAT)

UAT ถือว่า **ผ่าน** เมื่อ:

|  #  | เกณฑ์                                              | Required |
| :-: | -------------------------------------------------- | :------: |
|  1  | ทุก Blocker issues ถูกแก้ไขแล้ว                    |   Yes    |
|  2  | Major issues ถูกแก้ หรือมี workaround ที่ approved |   Yes    |
|  3  | Test cases ผ่าน >= 95%                             |   Yes    |
|  4  | Product Owner sign-off                             |   Yes    |
|  5  | Cross-device testing ผ่านบน 5 devices              |   Yes    |
|  6  | Minor issues มี ticket ใน backlog                  |   Yes    |
|  7  | Performance acceptable (ไม่ช้าจนรบกวน UX)          |   Yes    |

**ถ้าไม่ผ่านเกณฑ์ข้อ 1-5 --- ห้าม deploy to production**

---

> **SYNERRY AI Team** | QA-QC Master v1.0 | April 2026
