# 🚫 O2O Redesign Anti-Patterns

Tài liệu này là Lệnh Cấm Tuyệt Đối (Hard Blocks) đối với Agent. Nếu vi phạm, Agent sẽ đánh mất ngữ cảnh UI. Tự động được thêm vào khi có phản hồi lỗi từ User (Self-Evolving Flow).

## 1. Interaction & Touch Patterns
- 🚫 **Banned**: Dùng thẻ `<select>` gốc (Native Dropdown) của hệ điều hành.
- 💡 **Instead**: Sử dụng Bottom Sheet (Full/Half Drawer) hoặc Danh sách chọn trực tiếp (Inline Radio Buttons).
- 🚫 **Banned**: Touch Target nhỏ hơn 44px trên giao diện Mobile.
- 💡 **Instead**: Các nút luôn có padding tối thiểu, `minHeight: '44px'`, `minWidth: '44px'`.

## 2. Layout & Spacing
- 🚫 **Banned**: Desktop-mindset Sprawl (Dàn trải nội dung không giới hạn chiều dọc).
- 💡 **Instead**: Gom nhóm các dữ liệu cùng Cognitive Load (như Voucher & Payment) vào Settings-Group Components. Khung chứa chính (Root wrapper) trên mobile App-like phải fix `height: 100dvh` và `overflow: hidden`, để cuộn nội bộ (internal scroll).
- 🚫 **Banned**: Lặp từ ngữ / Dư thừa lớp bao bọc (Ví dụ: Header tiêu đề "ZaloPay" đè lên lựa chọn đầu tiên củng là "ZaloPay").
- 💡 **Instead**: Inline list phẳng. Đừng bọc Accordion vô ích.

## 3. Visual & Aesthetic
- 🚫 **Banned**: Đổ bóng (Box Shadow) đen xì (`rgba(0,0,0, 0.5)`) kiểu web 2.0.
- 💡 **Instead**: Box shadow nhạt, bồng bềnh (`0 4px 14px rgba(..., 0.05)`).
- 🚫 **Banned**: Dùng màu bệt (Solid color) cho Header cố định và Footer cố định. Trông ứng dụng sẽ bị cứng và chật chội.
- 💡 **Instead**: Cần có Backdrop Blur (`backdrop-filter: blur(16px)`) kết hợp với màu nền có độ trong suốt (`rgba(X, X, X, 0.8)`).
