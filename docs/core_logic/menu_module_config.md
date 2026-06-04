# Logic Cấu Hình Hiển Thị Menu

Tài liệu này thay thế cách hiểu cũ về các module riêng lẻ như `flash-sale`, `combo`, `best-sale`, `custom`, `menu-grid`.

Chi tiết ranh giới giữa **Thực đơn**, **Cấu hình hiển thị** và **Promotion** được định nghĩa tại:

- [menu_content_vs_display_configuration.md](./menu_content_vs_display_configuration.md)

## Quyết Định Mới

Không còn coi `Flash Sale`, `Combo Tiết Kiệm`, `Món Bán Chạy`, `Danh Mục Tuỳ Chỉnh`, `Menu Chính` là các module có vai trò dữ liệu riêng.

Tất cả được quy về một cấu trúc chung:

```ts
type MenuDisplayGroup = {
  id: string;
  name: string;
  sortOrder: number;
  isEnabled: boolean;

  sourceType: 'native_category' | 'custom_group';
  sourceCategoryId?: string;

  isSpecial: boolean;
  displayStyle?: 'default' | 'highlight' | 'hero' | 'compact';
  backgroundImageUrl?: string;

  isCountdown: boolean;
  countdownText?: string;

  scheduleSlots: MenuDisplaySlot[];
};
```

Trong đó:

- Nhóm gốc trong thực đơn cũng có thể được đưa vào cấu hình hiển thị.
- Nhóm tự tạo cũng chỉ là một `MenuDisplayGroup`.
- Nhóm đặc biệt không phải entity riêng; nó là `isSpecial = true`.
- Countdown là thuộc tính hiển thị của group, đếm ngược theo `endTime` của slot đang active.
- Giảm giá không nằm trong group; giảm giá thuộc Promotion/Campaign riêng.
- `Dành cho bạn` không thuộc cấu trúc này; đây là tính năng phụ fixed-top, chỉ có bật/tắt.

## Trách Nhiệm Của Cấu Hình Hiển Thị

Cấu hình hiển thị chỉ quản lý presentation:

- nhóm nào xuất hiện trên menu khách;
- thứ tự các nhóm;
- nhóm đang bật hay tắt;
- nhóm thường hay nhóm đặc biệt;
- style/background của nhóm đặc biệt;
- lịch hiển thị theo ngày/giờ/thứ;
- danh sách món được đưa vào từng khung giờ;
- countdown của group.

Nó không sửa dữ liệu gốc của món.

## Trách Nhiệm Không Thuộc Cấu Hình Hiển Thị

Không đặt các phần sau trong cấu hình hiển thị:

- sửa tên món;
- sửa ảnh món;
- sửa mô tả món;
- sửa giá mặc định;
- tạo/sửa category gốc;
- POS mapping;
- đồng bộ POS;
- campaign giảm giá;
- số lượng/tồn kho thật.

Các phần này thuộc:

- **Thực đơn**: nội dung món, nhóm gốc, dữ liệu POS.
- **Promotion**: giá giảm, chiến dịch sale, giới hạn số suất nếu là ưu đãi.

## Luồng Render

Storefront render theo thứ tự:

1. Load thực đơn gốc.
2. Load cấu hình hiển thị.
3. Load promotion active.
4. Nếu `Dành cho bạn` đang bật và khách có lịch sử, render block cá nhân hoá đầu tiên.
5. Với từng `MenuDisplayGroup`, tìm slot đang active.
6. Lấy `itemIds` trong slot, join sang thực đơn gốc.
7. Áp promotion nếu có.
8. Nếu còn món hợp lệ thì render group.
9. Nếu `isSpecial = true`, dùng style đặc biệt.
10. Nếu `isCountdown = true`, hiển thị countdown tới giờ kết thúc của slot active.

## Migration Từ Model Cũ

Các module cũ được migrate mềm như sau:

- `menu-grid` -> các group source từ category gốc.
- `custom` -> custom `MenuDisplayGroup`.
- `combo` -> custom `MenuDisplayGroup` có style đặc biệt nếu cần.
- `best-sale` -> custom `MenuDisplayGroup` hoặc group auto-generated từ analytics trong phase sau.
- `flash-sale` -> custom `MenuDisplayGroup` có `isSpecial = true`, `isCountdown = true`; giá sale chuyển sang Promotion.
- `for-you` -> tính năng phụ `Dành cho bạn`, không migrate thành `MenuDisplayGroup`.

Mục tiêu là admin chỉ cần hiểu một mô hình:

> Tạo nhóm, chọn món, đặt lịch, chọn cách hiển thị.

Riêng `Dành cho bạn`, admin chỉ cần hiểu:

> Bật lên thì hệ thống tự hiển thị món khách từng gọi ở đầu menu; tắt đi thì ẩn.
