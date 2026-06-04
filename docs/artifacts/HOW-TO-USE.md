# Hướng dẫn dùng file Artifact với Claude

## Cách sử dụng

### Bước 1: Copy file
Mở file `.tsx` cần dùng → **Select All** → **Copy**

### Bước 2: Paste vào Claude chat
Vào [claude.ai](https://claude.ai) → New conversation → Paste code, kèm theo:

```
Render this React component as an artifact. 
Use Tailwind CSS for styling. I want to redesign [describe what you want to change].
```

### Bước 3: Claude sẽ hiển thị live preview
Bạn có thể:
- Click vào các phần UI muốn thay đổi và hỏi Claude
- "Make the cards darker", "Change the chart colors to blue"
- "Add a traffic heatmap section below the SLA chart"
- "Redesign the complaint analysis section to use a donut chart"

---

## Files có sẵn

| File | Trang gốc | Nội dung |
|------|-----------|----------|
| `dashboard-analytics.tsx` | `/admin/dashboard` | 4 pillars: O2O ROI, Vận hành bếp, CSAT, Hành vi khách |

## Lưu ý khi chỉnh sửa trong Claude

- Claude Artifacts hỗ trợ: **React, Tailwind, lucide-react, recharts**
- **Không** hỗ trợ: Next.js `Image`, `Link`, `useRouter`, server components
- Khi muốn copy design ngược lại vào codebase: thay mock data bằng real API calls

## Tips thiết kế hiệu quả

```
# Thay đổi màu sắc theme
"Change the primary color from indigo to blue throughout"

# Thêm dark mode
"Add a dark mode toggle to the header"

# Thay đổi layout
"Change the hero metrics from 4 columns to 2 columns on mobile"

# Thêm tính năng
"Add a date range picker to filter the charts"

# So sánh phương án
"Show me 2 different versions of the SLA section"
```
