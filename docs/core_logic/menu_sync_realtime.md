# Logic Menu: Đồng bộ Thời gian thực & Polling

Trang Menu sử dụng chiến lược truy vấn (polling) đa giai đoạn để giữ cho giao diện luôn đồng bộ với trạng thái bàn và các thành viên khác, đồng thời giảm thiểu tải cho máy chủ.

## 1. Vòng đời Đồng bộ

| Giai đoạn | Tần suất | Logic |
|-----------|----------|-------|
| **Kiểm tra phiên bản** | 1.5 Giây | Gọi `/api/restaurants/[resid]/sync`. Trả về một số `version`. |
| **Tải dữ liệu (Fetch)** | Khi Version thay đổi | Gọi `/api/restaurants/[resid]/live`. Trả về dữ liệu đầy đủ nếu `localVersion < remoteVersion`. |
| **Truy vấn Chat** | 5-10 Giây | Kiểm tra `/api/chat` để tìm các tin nhắn chưa đọc từ nhà hàng. |

## 2. Logic Polling dựa trên Phiên bản (Versioned Polling)
Để tránh việc truy vấn cơ sở dữ liệu nặng nề trong mọi lần poll, client sử dụng `localVersionRef`:
1. Server lưu trữ một `version` (timestamp hoặc bộ đếm) trong Redis/Cache cho mỗi phiên làm việc của bàn.
2. Bất kỳ thao tác ghi nào (đặt món, cập nhật bản nháp, gọi nhân viên) đều làm tăng số phiên bản này.
3. Việc poll của client chỉ tiến hành "Tải dữ liệu nặng" (Heavy Fetch) nếu số phiên bản đã tăng lên.

## 3. Nhận diện Thành viên Thời gian thực
Client theo dõi `seenMemberIds` bằng một `Set`:
- **Lần tải đầu tiên**: Tất cả các thành viên do API trả về đều được thêm vào set; không có thông báo nào được hiển thị.
- **Các lần poll tiếp theo**: Bất kỳ ID thành viên nào trong phản hồi mà không có trong `Set` sẽ được xác định là "Thành viên thực sự mới".
- **Tương tác**: Một thông báo toast sẽ được kích hoạt cho thành viên mới nhất được phát hiện: *"X vừa tham gia bàn!"*.

## 4. Hợp nhất Trạng thái (State Merging)
Khi dữ liệu trực tiếp mới được tải về, các trạng thái sau sẽ được đồng bộ hóa:
- `tableMembers`: Cập nhật các thành viên hiện tại và trạng thái của họ.
- `tableOrders`: Làm mới tất cả các đơn hàng đã xác nhận (kể cả những đơn hàng do người khác đặt).
- `isCheckoutRequested`: Kích hoạt khối giao diện "Chờ thanh toán" cho tất cả các thành viên.
- `isPaid`: Kích hoạt quá trình chuyển đổi thanh toán thành công và bảng phản hồi.
- `notifications`: Cập nhật danh sách các cảnh báo hệ thống.
