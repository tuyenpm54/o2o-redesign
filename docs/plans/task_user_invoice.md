# Kế hoạch triển khai Luồng Người dùng, Hóa đơn & Đánh giá

- [x] Tổng hợp logic user này vào core logic (`docs/core_logic/user_and_invoice_architecture.md`)
- [ ] Phần 1: Tách biệt Hóa đơn (`invoices`) khỏi Phiên bàn (`table_sessions`)
  - [x] Cập nhật Database Schema (`src/lib/db.ts`): Tạo bảng `invoices`, thêm `invoice_id` vào `order_items`.
  - [x] Cập nhật API Thanh toán (`PUT /api/admin/tables` & `/api/admin/tables/clear`) để tạo mới `invoices` khi đóng `table_sessions`.
  - [x] Cập nhật API Lịch sử hóa đơn (`GET /api/account/invoices`) để query từ `invoices`.
- [x] Phần 2: Cập nhật Lượt ăn (`visit_count`), Điểm, và Sở thích cá nhân
  - [x] Xây dựng Background computation: Tự động cộng `visit_count`, `points`, `preferences` khi Hóa đơn `STATUS = PAID`.
  - [x] Gỡ bỏ logic cộng dồn "thủ công" dựa trên số giờ Online trong `GET /api/auth/me`.
- [x] Phần 3: Tính năng xuất Hóa đơn (VAT)
  - [x] Tạo bảng `invoice_vats` (Ràng buộc UNIQUE khóa `invoice_id`).
  - [x] Viết API Yêu cầu/Kiểm tra VAT (Đảm bảo Rule: Chỉ người Yêu cầu thanh toán mới được nhập/nhìn thấy form).
  - [x] Nối API vào giao diện `AccountOverview.tsx` (Thực chất tích hợp thẳng vào flow Checkout ở `bill/page.tsx`).
- [x] Phần 4: Tính năng Đánh giá chất lượng (Reviews)
  - [x] Tạo bảng `reviews` (Khóa UNIQUE kép `invoice_id`, `user_id`).
  - [x] Viết API đệ trình Đánh giá sao/Feedback.
  - [x] Tích hợp giao diện hiển thị Mời đánh giá chung cho tất cả các khách trong bàn khi Hóa đơn hoàn tất.
