# Landing Page & Auth - One-Page PRD

**Date**: 2026-02-21
**Author**: Antigravity
**Status**: Draft

#### Problem
Restaurant owners need to understand the product value and pricing before signing up. Currently, the project lacks a marketing front-door and a secure access control for the CMS Admin.

#### Solution
- A modern, high-conversion **Landing Page** at `/home`.
- A **Pricing Component** with Free and Pro tiers.
- A **Login Page** to gate access to `/admin`.

#### Pricing Tiers
- **Free Plan**: 
  - Thống kê cơ bản (Stats).
  - Sử dụng các module mặc định.
  - Không tùy chỉnh giao diện.
- **Pro Plan (Trình quản lý giao diện v2)**:
  - Tất cả tính năng Free.
  - **Tùy chỉnh Style Giao Diện** (Màu sắc, Font, Bo góc).
  - Ưu tiên hỗ trợ.
  - Phân tích sâu (Deep Analytics).

#### Success Metrics
| Metric | Current | Target |
|--------|---------|--------|
| Conversion Rate | 0% | 5% |
| Auth Security | None | Login Required |

#### Scope
**In**:
- Landing Page with Hero, Features, Pricing.
- Login Page with validation.
- Mock Auth logic to protect `/admin`.
**Out**:
- Real Database backend for Auth (using mock for now).
- Payment gateway integration (Stripe/Momo).

#### User Flow
```
Visitor → Landing Page → View Pricing → Click "Bắt đầu ngay" → Login Page → CMS Admin
```
