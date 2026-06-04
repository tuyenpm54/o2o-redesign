# Logic Phân Tách Thực Đơn Và Cấu Hình Hiển Thị

Tài liệu này định nghĩa ranh giới giữa **Cấu hình thực đơn** và **Cấu hình hiển thị** để tránh trùng vai trò khi tổ chức menu gọi món cho khách.

## Vấn Đề Cốt Lõi

Trong sản phẩm O2O, menu khách nhìn thấy không chỉ là danh sách món gốc. Nhà hàng cần:

- chỉnh nội dung món: tên, ảnh, giá, mô tả, trạng thái bán, đồng bộ POS;
- tạo hoặc quản lý nhóm món: món chính, đồ uống, bánh ngọt, combo, menu sáng;
- điều chỉnh cách menu được trình bày: thứ tự nhóm, nhóm nào được highlight, khung giờ nào hiện món nào, bật countdown;
- tạo các chiến dịch giá hoặc khuyến mãi riêng.

Nếu gom tất cả vào một màn **Cấu hình hiển thị**, trang này sẽ vô tình trở thành nơi sửa thực đơn. Ngược lại, nếu đưa logic highlight, thứ tự, khung giờ vào **Cấu hình thực đơn**, phần quản lý nội dung sẽ bị nhiễu bởi logic presentation.

Vì vậy cần tách rõ:

- **Thực đơn là nguồn dữ liệu nội dung.**
- **Cấu hình hiển thị là lớp điều phối cách trình bày nội dung đó trên menu khách.**

## Nguyên Tắc Phân Quyền

### 1. Cấu Hình Thực Đơn

Trang cấu hình thực đơn quản lý **dữ liệu gốc** của món và nhóm món.

Nó trả lời câu hỏi:

> Nhà hàng đang bán gì, nội dung món là gì, dữ liệu đó đồng bộ từ đâu?

Thuộc trách nhiệm của cấu hình thực đơn:

- Tạo, sửa, xoá món.
- Sửa tên món.
- Sửa ảnh món.
- Sửa mô tả món.
- Sửa giá gốc hoặc giá bán mặc định.
- Bật/tắt trạng thái món có còn bán hay không.
- Quản lý tồn kho cơ bản nếu có.
- Gán món vào nhóm gốc/category.
- Tạo, sửa, xoá nhóm món gốc.
- Sửa tên nhóm gốc.
- Sửa ảnh/cover của nhóm nếu đây là metadata nội dung.
- Cấu hình đồng bộ POS.
- Mapping món O2O với món POS.
- Xử lý lỗi đồng bộ, món thiếu mapping, giá lệch POS.

Ví dụ:

- Đổi tên món `Bánh mì pate` thành `Bánh mì pate nhà làm`.
- Upload ảnh mới cho `Trà đào cam sả`.
- Tạo nhóm gốc `Bánh ngọt`.
- Đồng bộ giá món từ POS về O2O.
- Tắt món `Salad cá hồi` vì bếp hết nguyên liệu.

### 2. Cấu Hình Hiển Thị

Trang cấu hình hiển thị quản lý **cách các món/nhóm được sắp xếp và trình bày trên menu khách**.

Nó trả lời câu hỏi:

> Với dữ liệu thực đơn hiện có, khách sẽ thấy nhóm nào, ở đâu, vào lúc nào, với style nào?

Thuộc trách nhiệm của cấu hình hiển thị:

- Bật/tắt một nhóm trên menu khách.
- Sắp xếp thứ tự các nhóm hiển thị.
- Tạo nhóm hiển thị mới bằng cách pick món từ thực đơn.
- Chọn một nhóm gốc để đưa vào layout menu.
- Đánh dấu một nhóm là **nhóm đặc biệt**.
- Chọn style hiển thị cho nhóm đặc biệt.
- Cấu hình background image nếu nó chỉ phục vụ presentation của nhóm đặc biệt.
- Cấu hình nhiều khung giờ hiển thị cho một nhóm.
- Chọn danh sách món hiển thị trong từng khung giờ.
- Cấu hình ngày lặp lại: hằng ngày, theo thứ trong tuần.
- Cấu hình ngày đặc biệt/exception.
- Bật/tắt countdown cho group.
- Đặt text countdown, ví dụ `Kết thúc sau`, `Còn lại`.

Ví dụ:

- Đưa nhóm `Bánh mì & Cafe sáng` lên đầu menu từ 07:00-10:30 các ngày T2-T6.
- Tạo nhóm đặc biệt `Xả bánh cuối ngày`, chọn các món bánh còn bán trong ngày, hiện từ 16:00-18:00.
- Bật countdown cho nhóm `Ưu đãi giờ vàng`.
- Tắt nhóm `Combo gia đình` khỏi menu khách trong ngày thường.
- Đổi thứ tự các nhóm do nhà hàng quản lý, ví dụ `Bánh mì & Cafe sáng` đứng trước `Menu chính`.

Lưu ý: `Dành cho bạn` / `Món bạn từng gọi` không phải là `MenuDisplayGroup`. Đây là tính năng cá nhân hoá phụ, chỉ có bật/tắt và luôn nằm trên cùng menu khi được bật.

## Điều Cấm Để Tránh Trùng Vai Trò

### Cấu hình hiển thị không được sửa nội dung món

Không sửa trong cấu hình hiển thị:

- tên món;
- ảnh món;
- mô tả món;
- giá mặc định;
- category gốc của món;
- POS mapping;
- trạng thái đồng bộ;
- dữ liệu tồn kho nguồn.

Nếu chủ quán muốn sửa những thông tin này, UI phải dẫn họ về trang **Thực đơn**.

### Cấu hình thực đơn không được quyết định presentation runtime

Không đặt trong cấu hình thực đơn:

- nhóm nào nằm đầu menu khách;
- nhóm nào là highlight trên storefront;
- countdown;
- background riêng cho một campaign hiển thị;
- lịch hiện theo giờ/ngày;
- danh sách món override theo từng khung giờ hiển thị.

Nếu chủ quán muốn thay đổi các yếu tố này, UI phải dẫn họ về trang **Cấu hình hiển thị**.

## Model Khái Niệm

### Menu Catalog

`MenuCatalog` là dữ liệu gốc của nhà hàng.

```ts
type MenuItem = {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  basePrice: number;
  categoryId: string;
  isAvailable: boolean;
  posMapping?: {
    provider: string;
    externalItemId: string;
    syncStatus: 'synced' | 'missing' | 'conflict';
  };
};

type MenuCategory = {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  sortOrder: number;
  isActive: boolean;
};
```

Đây là source of truth cho nội dung.

### Menu Display Group

`MenuDisplayGroup` là lớp presentation. Nó tham chiếu tới món từ `MenuCatalog`, không sở hữu nội dung món.

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

type MenuDisplaySlot = {
  id: string;
  name: string;
  isEnabled: boolean;

  repeatMode: 'once' | 'daily' | 'weekly';
  startDate?: string;
  weekdays?: number[];
  startTime: string;
  endTime: string;

  itemIds: string[];
  exceptions?: MenuDisplayException[];
};

type MenuDisplayException = {
  date: string;
  mode: 'replace_items' | 'hide_group' | 'force_show';
  itemIds?: string[];
};
```

Điểm quan trọng:

- `itemIds` chỉ là tham chiếu tới món.
- Nếu món đổi tên/ảnh/giá ở `MenuCatalog`, mọi group hiển thị tự nhận dữ liệu mới.
- Nếu món bị tắt `isAvailable = false`, storefront không cho gọi món, dù group vẫn đang active.
- Nếu một slot active nhưng toàn bộ item không hợp lệ/không available, group không hiển thị.

### Promotion Campaign

Giảm giá không thuộc `MenuDisplayGroup`.

```ts
type PromotionCampaign = {
  id: string;
  name: string;
  isEnabled: boolean;
  startAt: string;
  endAt: string;
  itemRules: Array<{
    itemId: string;
    discountType: 'fixed_price' | 'percent' | 'amount';
    value: number;
    quantityLimit?: number;
  }>;
};
```

Promotion trả lời câu hỏi:

> Giá nào đang áp dụng cho món này trong thời điểm này?

Display group trả lời câu hỏi:

> Món này có được đưa vào nhóm hiển thị này không, và nhóm đó đang được render ở đâu?

Hai lớp có thể phối hợp:

- Group `Xả bánh cuối ngày` chọn các món bánh cần đẩy bán.
- Promotion `Giảm 30% bánh cuối ngày` áp giá sale cho cùng các món đó.
- Storefront render group từ display config, còn giá sale lấy từ promotion engine.

## Luồng Render Storefront

Khi khách mở menu:

1. Load `MenuCatalog`.
2. Load `MenuDisplayConfig`.
3. Load `PromotionCampaign` active nếu có.
4. Nếu tính năng `Dành cho bạn` được bật và khách có lịch sử gọi món, render block cá nhân hoá ở đầu menu.
5. Với mỗi `MenuDisplayGroup`:
   - kiểm tra `isEnabled`;
   - tìm `scheduleSlot` đang active;
   - lấy `itemIds` trong slot;
   - join sang `MenuCatalog`;
   - loại món không tồn tại hoặc không hợp lệ;
   - áp promotion price nếu có campaign active;
   - nếu group còn item hợp lệ thì render.
6. Nếu `isSpecial = true`, dùng style đặc biệt.
7. Nếu `isCountdown = true`, countdown tới `endTime` của slot active.

## Luồng Admin

### Trang Thực Đơn

Nên có các khu vực chính:

- Danh sách món.
- Chi tiết món.
- Nhóm/category gốc.
- Đồng bộ POS.
- Trạng thái dữ liệu: thiếu ảnh, thiếu giá, lệch POS, hết hàng.

CTA chính:

- `Thêm món`
- `Sửa món`
- `Tạo nhóm`
- `Đồng bộ POS`

### Trang Cấu Hình Hiển Thị

Nên có các khu vực chính:

- Danh sách group hiển thị.
- Thứ tự group.
- Toggle bật/tắt group.
- Badge group thường / group đặc biệt.
- Drawer cấu hình group:
  - chọn source category hoặc custom;
  - chọn món cho từng khung giờ;
  - cấu hình lịch;
  - cấu hình style highlight;
  - cấu hình countdown.
- Khu vực tính năng phụ:
  - bật/tắt `Dành cho bạn`;
  - không cho kéo thả thứ tự;
  - không cho chọn món thủ công.

CTA chính:

- `Tạo nhóm hiển thị`
- `Sửa hiển thị`
- `Sắp xếp`
- `Bật/Tắt`
- `Xuất bản lên menu khách`

Không đặt CTA `Sửa món`, `Sửa ảnh món`, `Đồng bộ POS` ở đây, trừ khi là link điều hướng sang trang thực đơn.

## Ví Dụ Phân Tách Theo Nhu Cầu Thực Tế

### Menu sáng và menu chiều

Nội dung ở trang thực đơn:

- Món `Cafe sữa đá`
- Món `Bánh mì pate`
- Món `Bánh ngọt`
- Món `Trà hoa quả`

Cấu hình hiển thị:

- Group `Sáng nay ăn gì`
  - `isSpecial = true`
  - slot T2-T6 07:00-10:30
  - itemIds: cafe, bánh mì pate
- Group `Trà chiều & bánh ngọt`
  - `isSpecial = true`
  - slot daily 14:00-17:00
  - itemIds: bánh ngọt, trà hoa quả

### Flash sale xả hàng cuối ngày

Nội dung ở trang thực đơn:

- Món bánh có tên, ảnh, giá gốc, trạng thái bán.

Cấu hình hiển thị:

- Group `Xả bánh cuối ngày`
  - `isSpecial = true`
  - `isCountdown = true`
  - slot daily 16:30-18:00
  - itemIds: các món bánh cần đẩy lên đầu menu

Promotion:

- Campaign `Giảm bánh cuối ngày`
  - active daily 16:30-18:00
  - áp giá sale hoặc phần trăm giảm cho itemIds tương ứng

### Nhóm đặc biệt trùng với nhóm gốc

Nếu menu đã có category gốc `Đồ uống`, vẫn có thể tạo display group:

- sourceType: `native_category`
- sourceCategoryId: `drinks`
- isSpecial: `true`
- displayStyle: `highlight`
- scheduleSlots: chỉ hiện một số món đồ uống vào khung giờ thấp điểm

Không cần tạo khái niệm riêng `nhóm đặc biệt` tách khỏi category. Một group bất kỳ có thể là special nếu bật `isSpecial`.

## Quy Tắc Validation

### Menu Catalog

- Món cần có tên.
- Món cần có giá hợp lệ.
- Món nên có ảnh nếu được bật bán.
- Món đồng bộ POS cần mapping hợp lệ.
- Category gốc cần có tên.

### Menu Display Group

- Group cần có tên.
- Group cần có `sortOrder`.
- Group enabled cần ít nhất một slot enabled.
- Slot enabled cần giờ bắt đầu và giờ kết thúc hợp lệ.
- Slot weekly cần ít nhất một weekday.
- Slot once cần `startDate`.
- Slot active cần ít nhất một item hợp lệ.
- Nếu `isCountdown = true`, countdown lấy từ `endTime` của slot active.
- Nếu group không có item hợp lệ ở thời điểm render, không hiển thị group.

### Promotion

- Campaign cần thời gian bắt đầu/kết thúc hợp lệ.
- Rule giảm giá cần item hợp lệ.
- Giá sale hoặc discount không được tạo giá âm.
- Quantity limit thuộc promotion/inventory, không thuộc display group.

## Anti-Patterns

Không nên:

- Tạo module riêng cứng như `flash-sale`, `combo`, `best-sale` nếu bản chất chỉ là group hiển thị với style/lịch khác nhau.
- Lưu tên món/ảnh món duplicate trong display config.
- Cho sửa giá sale trong display config.
- Để `MenuDisplayGroup` quyết định tồn kho thật.
- Để promotion campaign quyết định group nằm ở đâu trên menu.
- Để category gốc quyết định nó có phải highlight trên storefront hay không.

## Quyết Định Sản Phẩm

Hướng đi mới:

- Tất cả nhóm trên menu khách được nhìn như `MenuDisplayGroup`.
- Nhóm có thể đến từ category gốc hoặc do admin tạo mới.
- Nhóm đặc biệt chỉ là một flag/style trên group, không phải một loại module riêng.
- `Dành cho bạn` không phải `MenuDisplayGroup`; đây là tính năng cá nhân hoá fixed-top, chỉ bật/tắt.
- Cấu hình hiển thị quản lý thứ tự, bật/tắt, style, lịch, countdown, chọn món theo slot.
- Cấu hình thực đơn quản lý nội dung món/nhóm và đồng bộ dữ liệu.
- Promotion quản lý giá/ưu đãi, tách khỏi display.

Ranh giới này giúp admin dễ hiểu hơn:

- Muốn sửa món bán gì: vào **Thực đơn**.
- Muốn món/nhóm hiện ra thế nào trên menu khách: vào **Cấu hình hiển thị**.
- Muốn giảm giá: vào **Khuyến mãi/Promotion**.
