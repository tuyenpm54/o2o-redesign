# Design Analysis: Invoice List Redesign (Context-Aware)

Analysis for the transformation of the basic Invoice List into a priority-driven, interactive historical record.

## 1. Context Matrix

- **Page Type**: List / History
- **Device**: Mobile-First (PWA)
- **User Intent**: Verification, Tax Compliance (VAT), Feedback (Rating), Loyalty Tracking
- **Data States**:
    - **Populated**: List of cards with varying status (Rated/Unrated, VAT/No-VAT)
    - **Empty**: Informative state with "Dine Now" CTA
    - **Loading**: Skeleton cards reflecting the priority structure

## 2. Content Priority & Visual Mapping

| Level | Content Element | Visual Treatment (Phase 2 Strategy) |
| :--- | :--- | :--- |
| 🔴 **Critical** | **Invoice ID (Code)** | Large, Monospace font, High contrast. Positioned at the top-left of each card. |
| 🟡 **Important** | **Time & Total Amount** | Medium-Bold, paired together for cognitive grouping. Total in Primary Brand Color. |
| 🟡 **Important** | **Rating Status** | Visual stars if rated; "Rate experience" button if missing. High interaction priority. |
| 🔵 **Supportive** | **Item/People Count, Table ID** | Muted secondary text, small icons, compact layout. |
| ⚪ **On-demand** | **VAT Action Button** | Secondary button style or icon-only trigger to keep the card clean. |

## 3. Design Philosophy Justification

- **Fitts's Law**: The "Rate Now" and "VAT" buttons will have clear tap targets (min 44px) to ensure ease of navigation on mobile.
- **Visual Hierarchy**: Using "Mã hoá đơn" as the anchor ensures that the user can scan the list by transaction code without being distracted by secondary numbers.
- **Contextual Action**: The VAT button shouldn't dominate. It is a utility action ("On-demand") that supports the main "Critical" information.
- **Feedback Loop**: Integrating Rating directly into the list view reduces friction (Progressive Disclosure), encouraging more user reviews.

## 4. Layout Pattern
- **Card-based List**: Each invoice is a self-contained card with clear borders and subtle shadows (Glassmorphism look).
- **Grid density**: Spacious vertically to accommodate multiple actions per item.
