# Design Analysis: HQ Review Management (High Density)

## 1. Context Detection
- **Page Type**: Management dashboard / Operational list
- **User Role**: HQ Admin / Operations Manager
- **Intent**: High-speed scanning, issue detection, and status management
- **Device**: Desktop (optimized for productivity)

## 2. Content Priority Analysis

| Element | Priority | Philosophy Justification |
| :--- | :--- | :--- |
| **Review List (Comment & Store)** | 🔴 Critical | The core data user needs to scan for operational insight. |
| **Filters (Store, Type, Status)** | 🟡 Important | Necessary to narrow down target data in a large chain. |
| **Overall Good Rate %** | 🟡 Important | The "Health Indicator" for the entire chain. |
| **Handling Status Toggle** | 🟡 Important | The primary action (Outcome) for each review. |
| **Detailed User Info (Phone, Visit Count)** | 🔵 Supportive | Contextual, needed only if the admin decides to act/investigate. |
| **KPI Breakdown Cards (Total, Good, etc)** | ⚪ On-demand | Can be collapsed into a summary bar to save vertical space. |

## 3. Context Breaches & Friction Points
- **Vertical Sprawl**: Current design uses ~500px of vertical space before the first review item is even visible.
- **Low Information Density**: Each review takes up ~250px height. On a standard screen, only 2-3 reviews are visible.
- **Visual Noise**: The right-side "Khách hàng" panel is too heavy for a list view. It feels like a "Detail" view forced into a "List".

## 4. Proposed Layout Redesign (Compact/High-Density)

### 1. Unified Header & Stats (Horizontal Bar)
- Place the Title on the left.
- Place compact KPI chips (mini pills with numbers) next to the title or in the center.
- Place the Satisfaction % on the right.
- *Outcome*: Saves ~200px of header height.

### 2. Streamlined Filter Row
- Merge Search and Dropdowns into a single horizontal bar.
- Use icon-based labels or placeholder text to save space.

### 3. Review Table-Card Hybrid
- Transform the massive card into a "Data Row".
- **Column 1**: Type Icon + Store Name + Time.
- **Column 2 (Wide)**: Comment (truncated to 2 lines, expands on hover/click).
- **Column 3**: Tags/Reasons.
- **Column 4**: User initials/avatar + Handled status.
- **Column 5**: Quick handle button (Icon-based).
- *Outcome*: Reduces card height from 250px to ~80px. Triples visible entries.

### 4. Details on Expansion
- Move secondary data (handling notes, visit counts, phone) into an expandable section or a side-drawer when a row is clicked.

## 5. Visual Hierarchy Strategy
- **Background**: Neutral slate for the dashboard base.
- **Rows**: Clean white/neutral-dark background with subtle separators. No bulky shadows for every item.
- **Contrast**: Use text weight (Bold for Store/Count) instead of heavy background colors.

---
**Decision needed**: Should we use a full Table layout or a Compact Card list?
*Recommendation: Compact Card list for readability of long comments, but restricted to 2-3 lines height.*
