# Yêu cầu Kiến trúc & Logic Cấu hình Menu UI (Modular Design)

Tài liệu này ghi nhớ cấu trúc tuỳ biến thiết kế tại trang `Menu` / `Discovery` giúp người dùng/chủ quán có thể tự do **BẬT/TẮT, THÊM/BỚT** và **SẮP XẾP** linh hoạt.

## Kiến trúc 5 Module Chính
Toàn bộ luồng giao diện gọi món được phân mảnh thành 5 loại Module (Category) có thể tái sử dụng, trong đó **4 module đầu tiên có thể thay đổi thứ tự trên/dưới** tuỳ thuộc cấu hình:

### 1. Module "Dành cho bạn" (For You)
- **Trạng thái:** Chỉ có thể cấu hình `BẬT` (ON) hoặc `TẮT` (OFF) (không thể đổi tên hệ thống).
- **Thuật toán cá nhân hóa:** 
  1. Chỉ hiển thị dựa trên thông tin phiên Đăng nhập (`user login`).
  2. Truy vấn lịch sử Order của User: Mang ra những món có số lượng order cao nhất nằm top.
  3. Quét thiếu hụt: NẾU danh sách tìm được **< 3 món**, hệ thống tự động bốc thêm món **Best Sale** hoặc **Món Mới** khớp với "Sở thích Tag" của user.
  4. **Giới hạn hiển thị:** Tối đa 10 món.
- **Thiết kế Tag (Đặc quyền):** *"Đã gọi 3 lần"* / *"Bạn thích chua cay"* (v.v.).

### 2. Module "Combo tiết kiệm" (Value Combos)
- **Định nghĩa:** Tập hợp chung nhiều món được bán giảm giá so với mua lẻ.
- **Thiết kế Tag (Đặc quyền):** *"Tiết kiệm xx.000đ"*.

### 3. Module "Siêu phẩm bán chạy" (Best Sellers)
- **Nguồn Dữ liệu linh hoạt:** Phương thức cấp dữ liệu có thể thiết lập:
  - **Tự động:** Đẩy Data lên dựa theo lượt bán thực tế ghi nhận trên Database.
  - **Chỉnh tay:** Chủ quán chủ động dán nhãn thủ công các món ưu tiên để thúc đẩy sale.
- **Thiết kế Tag (Đặc quyền):** *"Đã bán xxx"* / *"Đang hot"*.

### 4. Module Custom Category (Danh mục tuỳ chỉnh)
- **Định nghĩa:** Cụm module linh động nhất, nơi Chủ quán được quyền tự tạo, tự gom nhóm món ăn và **TỰ ĐẶT TÊN** danh mục (Ví dụ: Menu mùa hè, Set trưa đồng giá...).
- **Giao diện:** Thiết kế trung tính (Neutral), kế thừa hệ style grid, không bị khóa cứng logic badge/tag hệ thống.

---

### 5. Module: "Menu Chính" (Core Menu Grid)
- **Cố định Tuyệt đối:** Chứa toàn thể cấu trúc nhóm món ăn của nhà hàng, luôn luôn bị "khóa cứng" ở vị trí **DƯỚI CÙNG** (Anchor Bottom).
- **Tuyệt đối không:** Không thể kéo thả Module này lên phía trên 4 nhóm Module Recommendation (đề xuất) ở bề mặt trên.

## Tổng kết Điểm mù (Review Note)
Tôi đã hiểu toàn bộ logic yêu cầu:
1. **Khóa 5:** Nhóm Menu gốc luôn nằm cố định để chốt hậu phương.
2. **Kéo thả 1-2-3-4:** 4 phần trên hoàn toàn Free-form (tùy ý chủ quán dời đổi thứ tự lên xuống, bật tắt).
3. **Module 1, 2, 3 "V.I.P":** Đã được dựng giao diện (UI) sẵn và mapping 1:1 với hệ thống Badge logic (Gắn cờ Tag theo thuật toán/Số liệu chứ không phải Badge tự gõ text thô).
