# Design Review: Admin Menu Tag Filter Bar

**Status**: 🔴 Context Breach Detected (Visual Cognitive Overload)
**Scope**: Tag filtering system in `/admin/menu`

---

## 1. Context Detection

| Vector | Detail |
| --- | --- |
| **Page Type** | Admin Management List |
| **Device** | Desktop (Wide Viewport) |
| **Role** | Admin (Efficiency-focused) |
| **User Intent** | Filtering & Navigation |
| **Data State** | Over-populated (High-density tags) |
| **Flow Stage** | Regular Use |

---

## 2. Content Priority Audit

| Element | Level | Logic / Philosophy |
| --- | --- | --- |
| **Menu Item Rows** | 🔴 Critical | The primary object of the page. |
| **Search & Status Filter** | 🟡 Important | Quickest way to find specific items. |
| **Category Tabs** | 🟡 Important | Primary structure of the menu. |
| **Tag Filter Bar** | 🔵 Supportive | Secondary filtering. Currently over-emphasized. |

---

## 3. Context Breaches (Why it fails)

1. **Cognitive Load Theory Violation**: The "Cloud" pattern works for 5-10 tags. For 50+ tags (as seen in screenshot), it becomes "Visual Noise". The brain cannot scan it efficiently; it becomes a wall of text.
2. **Spatial Hierarchy Breach**: Supportive elements (Tags) are taking up more vertical real estate than the Important elements (Search/Tabs), pushing Critical content off-screen.
3. **Fitts's Law Inefficiency**: With so many small targets scattered in a wrap-layout, the travel distance for the cursor is high and unpredictable.

---

## 4. Proposed Actionable Fixes (Strategy)

### 🌿 Proposal A: The "Active Horizon" (Horizontal Scroll)
- **Visual**: Keep tags in a single line.
- **Interaction**: Use `overflow-x-auto` with a subtle fade effect on the right. 
- **Benefit**: Restores vertical space. Critical content moves up.

### 🔍 Proposal B: The "Searchable Registry" (Dropdown)
- **Visual**: Replace the cloud with a "Tags" button + search input for tags.
- **Interaction**: Clicking "Tags" opens a multi-select popover.
- **Benefit**: Scales to hundreds of tags without breaking the layout.

### 🛡️ Proposal C: "Dynamic Pinned" (Hybrid)
- **Visual**: Show only the top 5 most used tags + a [+ More] button.
- **Interaction**: Clicking [+ More] expands the full list or opens a drawer.
- **Benefit**: Quick access to common filters without the noise.

---

## 5. Decision Needed

> [!IMPORTANT]
> **Recommend Proposal B or C**. Proposal A is good for mobile but on Desktop Admin, a searchable registry is much more professional.
> Which approach do you prefer? 
