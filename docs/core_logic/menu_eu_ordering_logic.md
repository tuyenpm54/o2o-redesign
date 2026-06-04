# Logic Gọi Món Menu EU - Tài Liệu Cốt Lõi

Tài liệu này ghi lại toàn bộ các logic được triển khai trong trang thực đơn chính dành cho khách hàng (`/menu`). Đây là tài liệu tham chiếu cho trải nghiệm gọi món của người dùng cuối (EU).

## 1. Quản Lý Định Danh & Phiên Làm Việc (Identity & Session)

| Tính năng | Logic |
|-----------|-------|
| **Tự động tạo khách (Auto-Guest)** | Nếu chưa có phiên làm việc, hệ thống tự động kích hoạt `loginAsGuest()` thông qua `AuthContext`. |
| **Ràng buộc phiên (Session Binding)** | Mỗi lần tải trang hoặc đăng nhập sẽ gửi POST tới `/api/auth/session` để ràng buộc `session_id` hiện tại với ngữ cảnh `{resid, tableid}` cụ thể. |
| **Tính liên tục của định danh** | Khách vãng lai có thể nâng cấp lên người dùng đã đăng ký ngay giữa bữa ăn; việc "khâu dữ liệu" (xử lý phía server) đảm bảo các món đã đặt được bảo toàn. |

## 2. Đồng Bộ Dữ Liệu & Polling

Hệ thống sử dụng cơ chế "Smart Polling" (Truy vấn thông minh) để duy trì cảm giác thời gian thực mà không làm quá tải máy chủ.

- **Tải dữ liệu ban đầu**: Lấy thông tin nhà hàng, danh mục món ăn, và giỏ hàng hiện tại của người dùng.
- **Kiểm tra phiên bản (Version Check)**: Mỗi **1.5 giây**, client sẽ truy vấn `/api/restaurants/[resid]/sync?tableid=[tableid]`.
- **Tải dữ liệu có điều kiện**: Nếu `version` phía server mới hơn `localVersion`, một lệnh tải toàn bộ dữ liệu (full fetch) sẽ được kích hoạt cho:
    - **Thành viên bàn**: Những người hiện đang ở bàn và trạng thái "đang chọn món" (drafting) của họ.
    - **Đơn hàng của bàn**: Tất cả các món đã xác nhận trong phiên làm việc hiện tại của bàn.
    - **Cờ trạng thái phiên**: `isCheckoutRequested` (yêu cầu thanh toán), `isPaid` (đã thanh toán), `isTableClosed` (đóng bàn).
    - **Thông báo**: Các cảnh báo hệ thống hoặc cập nhật trạng thái.

## 3. Logic Giỏ Hàng & Xung Đột (Collision Logic)

Logic giỏ hàng được thiết kế để ngăn chặn việc đặt món trùng lặp và giảm thiểu sự nhầm lẫn cho nhà bếp trong trường hợp đi ăn theo nhóm.

### Xung đột khi đang chọn (Drafting Collision - Thời gian thực)
- Khi một người dùng mở chi tiết món ăn, họ sẽ được đánh dấu là "đang chọn" (drafting) món đó.
- Nếu **Người dùng A** cố gắng thêm một món mà **Người dùng B** đang tùy chỉnh, hệ thống sẽ chặn lại với thông báo: *"X đang chọn món này, vui lòng đợi."*

### Xung đột khi đã xác nhận (Order Collision - Đã đặt)
- Trước khi thêm món vào giỏ, hệ thống kiểm tra xem CÓ BẤT KỲ thành viên nào cùng bàn đã đặt món đó chưa.
- Nếu tìm thấy, một thông báo cảnh báo (`collisionData`) sẽ hiện ra: *"X tại bàn của bạn đã gọi món này rồi, bạn có chắc muốn gọi thêm không?"*

### Bán chéo & Gợi ý (Cross-Selling & Recommendations)
- **Bán chéo**: Khi thêm "Món chính", hệ thống gợi ý 3 loại đồ uống nếu trong giỏ hàng chưa có đồ uống nào.
- **Kết hợp hoàn hảo (Perfect Pairing)**: Sử dụng `pairings.json` để tính toán gợi ý. Nếu một thành viên đã gọi "Phở Bò", và cấu hình nói rằng "Phở Bò" hợp với "Quẩy" (80%), hệ thống sẽ hiển thị: *"80% ăn cùng Quẩy"* trên thẻ món Quẩy.

## 4. Luồng Đặt Món (Ordering Flow)

1. **Gửi đơn**: Hàm `handlePlaceOrder` gửi các món trong giỏ hàng tới `/api/orders`.
2. **Đồng bộ lịch sử**: Khi thành công, các món sẽ ngay lập tức được thêm vào `localStorage` (`user_order_history`) để hiển thị trong phần "Món bạn từng gọi" ngay tức thì.
3. **Tiến trình trạng thái**: Đơn hàng chuyển qua các trạng thái `pending` (chờ) → `cooking` (đang nấu) → `ready` (sẵn sàng) → `served` (đã phục vụ).
4. **Thông báo**: Thay đổi trạng thái (đặc biệt là `ready`) sẽ kích hoạt `StatusToast` và tự động chuyển giao diện sang vòng gọi món (round) vừa cập nhật.

## 5. Kiến Trúc UI & Ngữ Cảnh

### Sắp xếp danh mục động (Dynamic Category Sorting)
Danh mục không cố định mà tự động sắp xếp lại dựa trên `TimeOfDay` (Thời điểm trong ngày):
- **Buổi sáng**: `Đồ uống` -> `Tráng miệng` -> `Khai vị`.
- **Buổi tối**: `Lẩu & Nướng` -> `Thức ăn kèm` -> `Bia Tươi`.
- **Dành cho bạn**: Nếu tính năng `for-you` được bật và khách có lịch sử, block "Món bạn từng gọi" luôn nằm trên cùng menu.
- **Nhóm ưu tiên khác**: "Món bán chạy", combo hoặc nhóm đặc biệt không tự ghim cứng; chúng được quyết định bởi `MenuDisplayGroup` trong cấu hình hiển thị.

### Hiển thị Module động
Bố cục trang được điều khiển bởi `restaurant_display_configs`. Các khối phổ biến bao gồm:
- `onboarding-wizard`: Trợ lý cá nhân hóa khi mới vào trang.
- `for-you`: Tính năng phụ on/off; nếu bật thì tự render món dựa trên lịch sử người dùng ở đầu menu.
- `menu-groups`: Cấu trúc chung cho nhóm gốc, nhóm tự tạo, nhóm đặc biệt, lịch hiển thị và countdown.

### Nhận diện ngữ cảnh
- **Chủ đề theo thời gian**: Giao diện (màu sắc, gradient, lời chào) thay đổi theo các buổi sáng, trưa, chiều, tối.
- **Tìm kiếm sinh động**: Thanh tìm kiếm tự động gõ các cụm từ liên quan đến thời điểm trong ngày và các món yêu thích của người dùng.
- **Chế độ nhóm (Group Mode)**: Nếu phát hiện có từ 4 thành viên trở lên, giao diện sẽ ưu tiên hiển thị "Combo Nhóm".

## 6. Hỗ Trợ & Dịch Vụ
- **Chuông phục vụ**: Người dùng có thể gửi các yêu cầu hỗ trợ định sẵn (Khăn giấy, Nước lọc, Gọi nhân viên).
- **Truy vấn yêu cầu**: Client kiểm tra các tin nhắn/phản hồi chưa đọc từ nhà hàng mỗi vài giây để hiển thị số lượng thông báo.
- **Phản hồi (Feedback)**: Khi đóng bàn hoặc thanh toán, một bảng khảo sát (feedback sheet) sẽ được kích hoạt để thu thập đánh giá của người dùng.
