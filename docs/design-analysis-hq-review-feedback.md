# Design Analysis: HQ Review & Feedback — Tốt/Tệ System

> Phase 1 Output — Context-Aware UI Design Skill

---

## 📋 Screen Overview

- **Screen name**: HQ Restaurants Table + HQ Dashboard — Review Integration
- **Date**: 2026-04-08
- **Target user**: HQ Chain Manager — giám sát chất lượng dịch vụ toàn chuỗi
- **Primary intent**: Phát hiện nhanh cửa hàng nào có vấn đề phản hồi khách hàng và hành động kịp thời
- **Target device**: Desktop (primary), Tablet (secondary)

### Context Vectors Summary

| Vector | Value | Impact |
|---|---|---|
| Page type | Dashboard + Data Table | Cần hiển thị KPI tổng hợp + chi tiết per-store |
| Device | Desktop | Có đủ không gian cho cột phụ |
| User role | HQ Admin (Power User) | Ưu tiên data density, scan nhanh |
| Data state | Populated (mock) | Cần design cho cả empty state (chưa có review) |
| Intent | Monitor + React | Quét nhanh → phát hiện anomaly → hành động |
| Flow stage | Regular use (daily monitoring) | Quen thuộc layout, cần efficiency tối đa |
| Runtime context | Business hours, time-sensitive | Review cũ chưa xử lý = priority cao hơn |

---

## 🔑 Đặc điểm Hệ thống Đánh giá

### Mô hình đánh giá: Binary (Tốt / Tệ)
- **Không dùng 1-5 sao** → Không cần hiển thị star rating
- **"Tốt"** = 1 tap, không cần thêm input
- **"Tệ"** = chọn thêm lý do (multi-select options):

| # | Option "Tệ" | Icon gợi ý |
|---|---|---|
| 1 | Thời gian chờ lâu | Clock |
| 2 | Món không đúng kỳ vọng | UtensilsCrossed |
| 3 | Nhân viên chưa nhiệt tình | UserX |
| 4 | Vệ sinh chưa tốt | SprayHand |
| 5 | Sai món / Thiếu món | PackageX |
| 6 | Khác | MessageCircle |

### Dữ liệu cần hiển thị per-store:
- `totalReviews`: Tổng lượt đánh giá trong kỳ
- `goodCount`: Số lượt "Tốt"
- `badCount`: Số lượt "Tệ"
- `badRate`: % Tệ = badCount / totalReviews
- `badReasons`: Object { reasonId: count } — phân bổ lý do Tệ

---

## 🎯 Content Priority Matrix — Bảng HQ Restaurants

### Kết luận: PHƯƠNG ÁN HYBRID

#### Ops Mode: Badge cảnh báo gắn vào cột CỬA HÀNG

| Priority | Classification | Justification |
|---|---|---|
| 🔵 Supportive | Badge "👎 N tệ" chỉ hiện khi badCount > 0 | **Progressive Disclosure** + **Cognitive Load** |

- Badge chỉ hiện khi `badCount > 0`
- Cửa hàng bình thường = clean row → giảm noise
- Ops mode đã có 5 cột → thêm cột nữa vi phạm Miller's Law (7±2)

#### Phân tích Mode: Cột riêng "PHẢN HỒI"

| Priority | Classification | Justification |
|---|---|---|
| 🟡 Important | Cột với tỉ lệ % + badCount | **Visual Hierarchy** cho compare intent |

- Hiển thị: `{goodRate}% tốt · 👎 {badCount}`
- Nếu `badRate > 20%`: highlight đỏ cảnh báo
- Cho phép sort/compare ngang hàng giữa các cửa hàng

---

## 🎯 Content Priority Matrix — HQ Dashboard (Section Giám sát Đánh giá)

### 🔴 Critical (1)
| # | Thành phần | Nguyên tắc |
|---|---|---|
| 1 | **Summary Bar: Tỉ lệ Tốt/Tệ + Tổng lượt** | Visual Hierarchy — phải nổi nhất |

### 🟡 Important (3)
| # | Thành phần | Nguyên tắc |
|---|---|---|
| 1 | **Top lý do Tệ (breakdown)** | Cognitive Load — max 6 categories |
| 2 | **Priority list: Reviews Tệ chưa xử lý** | Context Congruency — actionable |
| 3 | **Thời gian chờ xử lý** | Progressive Disclosure — time badge |

### 🔵 Supportive
| # | Thành phần |
|---|---|
| 1 | Cửa hàng gốc của review |
| 2 | Lý do cụ thể (tag/chip) |

### ⚪ On-demand
| # | Thành phần | Trigger |
|---|---|---|
| 1 | Chi tiết review (comment "Khác") | Click expand |
| 2 | Lịch sử xử lý | Nút "Xem lịch sử" |

---

## 🧠 Justification

### Ops Mode dùng Badge (không thêm cột)
> **Cognitive Load**: Đã 5 cột, thêm nữa = overload.
> **Progressive Disclosure**: Chỉ anomaly mới hiện badge.
> **Context Congruency**: Manager scan tìm "đốm đỏ" = đúng pattern.

### Phân tích Mode dùng Cột riêng
> **Visual Hierarchy**: Compare mode cần structured data per-row.
> **Data Density Match**: Consistent với pattern cột metric + growth.

### Dashboard dùng Breakdown lý do
> **Actionable Intelligence**: "12% Tệ" chưa đủ. "35% Chờ lâu" → biết cần tối ưu workflow bếp.

---

## ❓ Open Questions

1. Ngưỡng cảnh báo: badRate > 15% = amber, > 25% = red?
2. Hover tooltip cần breakdown chi tiết hay chỉ tổng?
3. "Chưa xử lý" = manager đánh dấu "Đã xem"?

---

## ✅ Checklist

- [x] Critical elements ≤ 2
- [x] Important elements ≤ 5
- [x] On-demand có trigger
- [x] Supportive < 30% screen
- [x] Tổng Critical + Important ≤ 7
- [x] Primary CTA chỉ có 1
- [ ] **User đã review và approve?**

> ⛔ MANDATORY STOP: Chờ anh review và approve trước khi implement.
