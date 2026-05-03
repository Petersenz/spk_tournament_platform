# Design Checklist — UI/UX Testing

> จาก Enterprise 360 Phase 1 (Planning) + Phase 3 (Functional Testing)
> ครอบคลุม Browser/Device compatibility, Responsive, Error pages

---

## Browser/Device Matrix

### Browsers ที่ต้องทดสอบ

| Browser              |  Version   | Priority | Market Share |
| -------------------- | :--------: | :------: | :----------: |
| **Chrome**           | Latest + 1 | Critical |     ~65%     |
| **Safari**           | Latest + 1 | Critical |     ~18%     |
| **Firefox**          |   Latest   |   High   |     ~3%      |
| **Edge**             |   Latest   |   High   |     ~5%      |
| **Samsung Internet** |   Latest   |  Medium  |     ~3%      |

### Devices ที่ต้องทดสอบ

| Device             |  Screen   | Priority |
| ------------------ | :-------: | :------: |
| iPhone 14/15       |  390x844  | Critical |
| iPhone SE          |  375x667  |   High   |
| Samsung Galaxy S24 |  360x780  |   High   |
| iPad               | 768x1024  |   High   |
| iPad Pro           | 1024x1366 |  Medium  |
| Desktop 1080p      | 1920x1080 | Critical |
| Desktop 1440p      | 2560x1440 |  Medium  |
| Ultrawide          | 3440x1440 |   Low    |

---

## Responsive Testing

### Breakpoints

| ชื่อ         |  Width  |          ทดสอบ          |
| ------------ | :-----: | :---------------------: |
| **Mobile S** |  320px  | Text ไม่ล้น, ปุ่มกดได้  |
| **Mobile M** |  375px  |  Layout ถูก, ภาพไม่หาย  |
| **Mobile L** |  425px  |     Form ใช้งานได้      |
| **Tablet**   |  768px  | 2-column layout (ถ้ามี) |
| **Laptop**   | 1024px  |     Navigation ครบ      |
| **Desktop**  | 1440px  |      Max-width ถูก      |
| **Large**    | 1920px+ | ไม่มี whitespace เกินไป |

### Responsive Checklist

- [ ] **Mobile 320-480px**
  - [ ] Text อ่านได้ ไม่ต้อง zoom
  - [ ] ปุ่มขนาด >= 44x44px (touch target)
  - [ ] ไม่มี horizontal scroll
  - [ ] Navigation ใช้ hamburger menu
  - [ ] Form inputs เต็มความกว้าง
  - [ ] Images ย่อตาม viewport
  - [ ] Font size >= 16px (ป้องกัน iOS zoom)

- [ ] **Tablet 768-1024px**
  - [ ] Layout ปรับเป็น 2 columns (ถ้าเหมาะสม)
  - [ ] Sidebar แสดง/ซ่อนถูกต้อง
  - [ ] Table แสดงผลถูก (horizontal scroll ถ้าจำเป็น)
  - [ ] Modal ไม่เกินขอบจอ

- [ ] **Desktop 1024-1920px**
  - [ ] Max-width container ถูกต้อง
  - [ ] Sidebar + Main content แสดงพร้อมกัน
  - [ ] Table columns ครบถ้วน
  - [ ] Hover states ทำงาน

- [ ] **Large Screen 1920px+**
  - [ ] Content ไม่กว้างเกินไป (max-width)
  - [ ] ไม่มี whitespace มากเกิน
  - [ ] Font ไม่เล็กเกินไป relative กับจอ

---

## Cross-Browser Checklist

### Chrome (Primary)

- [ ] Layout ถูกต้องทุกหน้า
- [ ] JavaScript ทำงานครบ
- [ ] CSS animations smooth
- [ ] DevTools: ไม่มี console errors
- [ ] Lighthouse score >= 90 (Performance)

### Firefox

- [ ] Layout ไม่แตก (CSS Grid/Flexbox)
- [ ] Fonts render ถูกต้อง
- [ ] Form validation ทำงาน
- [ ] Custom scrollbar (ถ้ามี) ทำงาน

### Safari (macOS + iOS)

- [ ] CSS features ที่ใช้ supported (ดู caniuse.com)
- [ ] `-webkit-` prefixes ที่จำเป็น
- [ ] Date inputs แสดงถูก
- [ ] Backdrop filter ทำงาน
- [ ] PWA features (ถ้ามี)
- [ ] iOS: fixed position ทำงานถูกเมื่อ keyboard เปิด

### Edge

- [ ] Layout ถูกต้อง (Chromium-based — ใกล้เคียง Chrome)
- [ ] Extensions ไม่ conflict
- [ ] Download/Print ทำงาน

---

## Error Pages

### 404 Page (Not Found)

- [ ] มี 404 page custom (ไม่ใช่ default)
- [ ] แสดงข้อความเป็นมิตร (ไม่ใช่ "Error 404")
- [ ] มีลิงก์กลับหน้าหลัก
- [ ] มี search box (ถ้าเหมาะสม)
- [ ] Design สอดคล้องกับ branding
- [ ] HTTP status code = 404 (ไม่ใช่ 200)

### 500 Page (Server Error)

- [ ] มี 500 page custom
- [ ] ไม่แสดง error stack trace (security risk!)
- [ ] แสดงข้อความ "กำลังแก้ไข"
- [ ] มีลิงก์ refresh / กลับหน้าหลัก
- [ ] Log error ไป Sentry (ดู [../05-monitoring/error-tracking.md](../05-monitoring/error-tracking.md))

### Other Error Pages

- [ ] 403 Forbidden — ไม่มีสิทธิ์เข้าถึง
- [ ] Maintenance page — ระหว่าง maintenance
- [ ] Offline page — ไม่มี internet (ถ้ามี PWA)

---

## UI/UX Quality Items

### Typography

- [ ] Font loading: ใช้ `font-display: swap` (ป้องกัน FOIT)
- [ ] Line height: 1.5-1.6 สำหรับ body text
- [ ] Paragraph width: ไม่เกิน 75 characters
- [ ] Heading hierarchy: H1 → H2 → H3 ตามลำดับ

### Colors & Contrast

- [ ] Text contrast ratio >= 4.5:1 (WCAG AA)
- [ ] Large text contrast ratio >= 3:1
- [ ] ไม่ใช้สีอย่างเดียวสื่อความหมาย (color-blind friendly)
- [ ] Dark mode (ถ้ามี) ทำงานถูกต้อง

### Interactive Elements

- [ ] ทุกปุ่มมี hover/active state
- [ ] Loading states แสดงเมื่อรอ
- [ ] Disabled state ชัดเจน
- [ ] Focus indicator มองเห็นได้ (accessibility)
- [ ] Error messages สีแดง + icon
- [ ] Success messages สีเขียว + icon

### Forms

- [ ] Label ทุก input field
- [ ] Placeholder text ไม่ใช้แทน label
- [ ] Validation แสดง inline (ไม่ต้องกด submit)
- [ ] Required fields มีเครื่องหมาย \*
- [ ] Auto-complete ทำงาน (name, email, address)
- [ ] Tab order ถูกต้อง

---

## Testing Tools

| เครื่องมือ      | ใช้ทดสอบ                |  ราคา  |
| --------------- | ----------------------- | :----: |
| Chrome DevTools | Responsive, Performance |  Free  |
| BrowserStack    | Cross-browser           | $29/mo |
| Playwright      | Automated UI tests      |  Free  |
| Lighthouse      | Performance, A11y       |  Free  |
| axe DevTools    | Accessibility           |  Free  |

---

## Checklist Summary

| หมวด                 | Items | Priority |
| -------------------- | :---: | :------: |
| Responsive (Mobile)  |   7   | Critical |
| Responsive (Tablet)  |   4   |   High   |
| Responsive (Desktop) |   3   |   High   |
| Cross-Browser        |  12   |   High   |
| Error Pages          |   8   | Critical |
| Typography           |   4   |  Medium  |
| Colors               |   4   |   High   |
| Interactive          |   6   |   High   |
| Forms                |   6   |   High   |
