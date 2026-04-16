# Kiến trúc Dữ liệu: User, Table Sessions, Invoices & Reviews

Tài liệu này miêu tả luồng cốt lõi (Core Logic) về cách hệ thống O2O thu thập dữ liệu người dùng, quản lý vòng đời của một bàn ăn (Table Session), và cách xuất hóa đơn (Invoice). Kèm theo đó là luồng nghiệp vụ của Yêu cầu VAT và Đánh giá (Feedback/Reviews).

## 1. Dữ liệu Người dùng (User / Guest)
Hệ thống quản lý định danh người dùng xoay quanh đúng một bảng dữ liệu `users` duy nhất với nguyên lý "Một thực thể - Hai trạng thái" (Device Identity vs Verified Identity).

- **Trạng thái 1: Guest (Định danh Thiết bị)** 
  - Khách vãng lai (`isGuest = 1`, `phone = null`).
  - Được ghim chặt vào một trình duyệt/thiết bị cục bộ thông qua cookie `device_id`.
  - Nhiệm vụ: Đảm bảo khách hàng luôn có lịch sử gọi món, món khoái khẩu (để AI gợi ý) khi dùng lại trình duyệt đó mà không cần đăng nhập.

- **Trạng thái 2: Verified (Định danh Xác thực)**
  - Khách hàng đã liên kết (`isGuest = 0`, đã gắn `phone`).
  - Bứt phá khỏi giới hạn thiết bị: Khách hàng kế thừa toàn bộ lịch sử ăn uống, Tích điểm, Hội viên, Voucher và Hóa đơn.

**Triết lý Chuyển đổi Trạng thái:**
- **Đăng nhập lần đầu (SĐT mới):** Nếu Guest này liên kết một SĐT mới tinh, hệ thống sẽ thực hiện nâng cấp (`Upgrade`) trực tiếp bản ghi `users` đó lên `isGuest = 0` và gắn SĐT. Toàn bộ Lịch sử của trình duyệt chính thức trở thành "tài sản" của SĐT đó. Khi logout, thiết bị này hiển nhiên sẽ chuyển về trạng thái trống (Sinh ra một `guest_id` mới tò te).
- **Đăng nhập SĐT cũ (SĐT đã tồn tại):** Khách hàng sử dụng trình duyệt để đăng nhập vào một SĐT đã có trên hệ thống. Lúc này, Cookie phiên đăng nhập `session_id` sẽ được trỏ sang Tài khoản Verified đó. Nhưng dữ liệu của Guest cũ trên thiết bị KHÔNG bị xóa hay ghi đè, mà chỉ rơi vào trạng thái "Ngủ đông". Chỉ cần khách hàng Logout (Đăng xuất khỏi SĐT), hệ thống sẽ ngắt `session_id` để đưa trình duyệt trở về với dữ liệu `device_id` (Guest cũ) như chưa hề có cuộc chia ly.

- **Phân tách Hóa đơn chung & Sở thích cá nhân:**
  - Một nhóm 4 người chung bàn sẽ chia sẻ 1 Hóa Đơn Chung (Invoice).
  - Tuy nhiên, Sở thích (Preferences) và Lịch sử gọi món của mỗi người được bóc tách độc lập dựa vào chính xác những `order_items` mà họ ấn nút "Thêm vào giỏ" trên thiết bị của họ. (Tracking bằng `order_items.user_id`).

## 2. Vòng đời Bàn ăn (Table Sessions) vs Hóa đơn (Invoices)
Hệ thống sử dụng khái niệm **Tách biệt Physical Session và Financial Bill** để đảm bảo khả năng mở rộng (như Split Bill, Ngồi thêm sau khi thanh toán).

### A. Table Sessions (Phiên bàn vật lý)
- **Bảng `table_sessions`:** Được sinh ra ngay khi có nhóm khách đầu tiên quét mã QR một bàn trống.
- **Trạng thái (Status):** Chỉ báo trạng thái chiếm dụng không gian của khách. Thường bắt đầu là `ACTIVE`.
- Vai trò của nó là cái "Rổ" lớn nhất chứa toàn bộ các Khách hàng (`session_presences`), Giỏ hàng chưa chốt (`cart_items`) và các lượt gọi món (`order_rounds`, `order_items`).

### B. Invoices (Hóa đơn tài chính)
- **Bảng `invoices`:** Chỉ được sinh ra khi Nhân viên / Khách hàng bấm gửi lệnh **Thanh toán bàn**.
- **Quy trình chốt Bill:**
  1. Freeze toàn bộ `order_items` thuộc về Bàn hiện tại, gán thẻ `invoice_id` tương ứng.
  2. Tổng hợp tổng tiền, thuế, giảm giá.
  3. Cập nhật `table_sessions.status = 'PAID'` (Và kết thúc `ended_at`).

## 3. Worker tự động tổng hợp (Auto-computation sau Invoices)
Thay vì load Data liên tục lúc User mở Web (làm giả lập `visit_count` không chính xác), O2O Redesign chỉ chạy Background Worker khi có **Sự kiện (Event) Chốt Hóa Đơn (`PAID`)**:
1. Scan toàn bộ `user_id` có trong hóa đơn vừa chốt.
2. Tác động tới bảng `users`:
   - Cộng dồn `visit_count = visit_count + 1`.
   - Lọc tất cả `order_items` của riêng User đó, trích xuất text (Tags ngọt, cay, tên món) gộp vào Cột `preferences`.
   - Tính tổng tiền của User để cộng Điểm thưởng (`points`).

## 4. Đặc tả tính năng Chuyên sâu: VAT & Reviews

### Hóa đơn đỏ (VAT)
- **Độc quyền:** Chỉ **1 người duy nhất** trong bàn được quyền nhập Form VAT.
- **Rule First-come, First-Served:** Người nào đại diện bấm "Yêu cầu thanh toán" sẽ được mở quyền nhập VAT. Các User khác nếu cố gắng đăng ký VAT cho cùng 1 Hóa đơn (`invoice_id`) sẽ bị chặn bằng UI (Bảng `invoice_vats` đảm bảo constraint 1-1 qua cột `invoice_id UNIQUE`).

### Đánh giá chất lượng (Reviews)
- **Quyền bình đẳng:** Toàn bộ mọi người ngồi trong bàn (có ID tham gia gọi món trong `invoice`) đều được phép để lại 1 lượt Đánh giá.
- Rating được ghi nhận riêng biệt cho từng người (Bảng `reviews` đảm bảo unique constraint qua cặp `(invoice_id, user_id)`). Việc này giúp nhà hàng lấy được nhiều ý kiến đa dạng từ cùng 1 bàn.
