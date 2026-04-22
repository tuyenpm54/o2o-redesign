# 🎨 O2O Redesign Design DNA (Pro Max Standards)

Bản đồ DNA Ứng dụng này là Bộ Luật Kiến Trúc Thẩm Mỹ gốc. Mọi UI mới sinh ra đều phải trích xuất khuôn mẫu từ đây ra, tuyệt đối không "sáng tạo" làm loãng Context.

## A. Product DNA (Dual Platform Profiles)
Dự án được chia làm 2 phân hệ độc lập, KHÔNG DÙNG CHUNG chung chung quy tắc thẩm mỹ:

### Phân hệ 1: Customer Storefront (Web Mobile) & Landing Page (Marketing)
- **Target Subject**: Khách hàng ngồi tại bàn hoặc đối tác truy cập trang chủ. Cần Tốc độ, Sang trọng, Sức sống (Vitality) và Hiệu ứng thị giác bùng nổ.
- **Core Value**: Vibrant Glassmorphism (Kính mờ kết hợp ánh sáng), Spatial (Layout rộng mở), Touchable (Touch Target lớn >=44px).
- **Aesthetic**: Dynamic & Vibrant (Sử dụng các màu nhấn mạnh như Red #DF1B41, Orange, Gold để tăng nhận diện và cảm xúc).
  - *Cụ thể cho Landing Page*: Giữ Layout tối giản, trọng tâm, nhưng BẮT BUỘC bơm "sức sống" bằng **Ambient Glow** (Ánh sáng môi trường dạng gradient mờ ảo `blur-[100px]`) hắt từ phía sau khối nội dung. Các nút bấm gọi hành động (CTA) và điểm chạm tương tác phải sử dụng tông màu rực rỡ (Đỏ/Cam/Vàng) để điều hướng mắt thay vì phong cách lạnh lẽo thuần Đen/Trắng.

### Phân hệ 2: Admin Console (Web Desktop)
- **Target Subject**: Quản lý cửa hàng, nhân viên điều phối (HQ), làm việc trong ca dài qua màn hình lớn.
- **Core Value**: Information Density, "Apple-Class" settings, Minimalist & Professional.
- **Aesthetic**: Monochrome & Calm (Sử dụng Black/White/Slate làm chủ đạo). Chỉ báo động màu sắc (Semantic colors) khi có dữ liệu cảnh báo (Rose/Amber). Hạn chế viền rườm rà, dùng Spacing và Soft Shadow (`0 2px 20px rgba(0,0,0,0.04)`) để chia phân vùng. Tuyệt đối KHÔNG LẠM DỤNG `uppercase font-black` gây nhiễu và mỏi mắt.

## B. Aesthetic Tokens & Primitives
### 1. Theming Variables
- Luôn sử dụng biến từ `useMenuContext()`: `theme.bg`, `theme.textPrimary`, `theme.accent`.
- `interactiveBg`: `isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)'`
- `interactiveBorder`: `isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'`
- **Không bao giờ hardcode mã màu HEX trực tiếp cho layout** nếu nó thay đổi theo theme Sáng/Tối.

### 2. Glassmorphism Layers (Depth & Space)
- Các layer dính cố định (Sticky Header / Sticky Bottom Footer) phải có hiệu ứng Kính:
  - `background: rgba(Color, 0.8)`
  - `backdropFilter: blur(16px)`

### 3. Apple-Class Settings Grouping
- Thay vì ném các Setting Options rời rạc, hãy gom nhóm chúng lại thành **Card Settings** (bo tròn `20px` hoặc `24px`).
- Đường kẻ giữa các tuỳ chọn phải là hairline mờ (`1px solid interactiveBorder`), lùi vào (margin-left) 12px để không bị cắt gắt.

## C. Animation & Feedback
- Mở Modal / Bottom Sheet: `animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)`
- Background Overlay: `animation: fadeIn 0.2s ease-out`
- Chuyển trạng thái: `transition: all 0.2s`
