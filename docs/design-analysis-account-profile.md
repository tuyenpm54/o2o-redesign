# Design Analysis: Account Profile Card

## 1. Context Detection
- **Page Type:** Account Overview / Profile Dashboard
- **Device:** Mobile-First Web App (Responsive)
- **User Role:** End-user (Customer)
- **Data State:** Populated (User has name, phone, tier, points)
- **User Intent:** Check membership status, access check-in QR, view points/rewards.
- **Runtime Context:** Frequently accessed in-store or pre-ordering to check points.

## 2. Content Priority Strategy

### 🔴 Critical (Hiển thị to nhất, đập vào mắt đầu tiên)
1. **Name (Tên)**: Xác nhận đúng tài khoản.
2. **Current Points & Tier (Điểm & Hạng)**: Lý do chính user vào trang này.
3. **Check-in QR Trigger**: Hành động quan trọng nhất tại cửa hàng.

### 🟡 Important (Hỗ trợ trực tiếp cho Critical)
1. **Progress to Next Reward (Thanh tiến trình)**: Thúc đẩy mua sắm thêm.

### 🔵 Supportive (Hiển thị gọn gàng, mờ hơn)
1. **Avatar**: Nhận diện hình ảnh phụ trợ.
2. **Phone Number**: Xác thực danh tính phụ trợ (không cần to).

### ⚪ On-demand (Ẩn đi, chỉ hiện khi click)
1. **Check-in QR Code (Modal)**: Đã được xử lý bằng Pop-up Modal hiện tại.

## 3. Justification (Triết lý thiết kế)
- **Visual Hierarchy**: Hiện tại theo ảnh chụp màn hình, chữ "THÀNH VIÊN" và "Nâng cấp" cùng màu xanh với Tên user, lấn át thông tin chính. Cần thu gọn "THÀNH VIÊN" thành một badge nhỏ gọn chuẩn hệ thống membership, và nhường không gian cho Text (Tên).
- **Proximity**: Gom cụm (Name + Phone) và cụm (Tier + Points) rõ ràng.
- **Cognitive Load**: Giảm bớt viền xanh to đùng không cần thiết, chuyển sang thiết kế Card dạng Glassmorphism hoặc Minimalist Solid Shadow để toát lên vẻ "Premium", làm nổi bật nội dung thay vì viền khối.

---
**YÊU CẦU DUYỆT:** Bạn hãy xem qua bản phân tích ưu tiên phía trên. Nếu bạn đồng ý với chiến lược này, tôi sẽ tiến hành Code phần giao diện Visual Design (Phase 2) với CSS Modules mới để lột xác hoàn toàn khối Card này!
