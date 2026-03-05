# Product Requirements Document (PRD): Prioritized Order Status Display

**Status**: Draft
**Date**: 2026-01-24
**Author**: [Your Name/AI Agent]

## 1. Executive Summary

**Purpose**: Optimizing the display of ordered items in the "Order History" or "Order Status" list to reduce customer anxiety and improve clarity.

**Problem Statement**: When a customer orders multiple items, they often worry about whether their order has been received, especially for pending items. A disorganized list can hide these critical status updates.

**Proposed Solution**: Implement a "Status-Based Priority Sort" logic for the order list. Items needing confirmation appear at the top, followed by cooking items, and finally served items.

**Business Impact**:
-   Reduced customer anxiety and "did you get my order?" inquiries to staff.
-   Improved perceived transparency and service speed.
-   Better user experience for multi-round ordering.

## 2. Problem Definition

### 2.1 Customer User Story
> "As a hungry diner who just placed an order, I want to see immediately if the restaurant has acknowledged my request, so that I don't have to worry if the system failed or if I need to call a waiter."

### 2.2 Insight
Customers prioritize information based on anxiety levels:
1.  **Highest Anxiety**: "Is my order received/confirmed?" (Status: Pending/Confirming)
2.  **Medium Anxiety**: "Is my food being made? How long?" (Status: Cooking)
3.  **Low Anxiety**: "I have my food." (Status: Served)

## 3. Solution Overview

### 3.1 Sorting Logic (The Core Feature)

The order list on the Customer Side (Order History / Active Order Card) must sorting items using the following priority (Desc):

1.  **Priority 1 (Top)**: `PENDING` / `WAITING_CONFIRMATION`
    *   *Rationale*: Immediate feedback loop. User needs to know the "handshake" happened.
2.  **Priority 2**: `CONFIRMED` / `COOKING`
    *   *Rationale*: Progress update. "It's happening."
3.  **Priority 3 (Bottom)**: `SERVED` / `COMPLETED` / `CANCELLED`
    *   *Rationale*: History. Least urgent.

### 3.2 Visual Hierarchy

*   **Pending Items**: Should potentially use visual cues (e.g., slight pulse, distinct border, or "top of list" placement) to draw attention until confirmed.
*   **Grouping**: Optionally group by status if the list is long (e.g., "Chờ xác nhận (2)", "Đang nấu (3)").

## 4. Functional Requirements

| ID | Requirement | Priority | Acceptance Criteria |
| :--- | :--- | :--- | :--- |
| **FR1** | **Status Sorting** | **P0** | The order list MUST automatically re-sort items so that `PENDING` items are always at the top. |
| **FR2** | **Real-time Reordering** | **P1** | When an item status changes from `PENDING` to `COOKING`, it should visually move down (or stay if `COOKING` is next highest), maintaining the sort order without confusing the user (smooth transition preferred). |
| **FR3** | **Quantity Consolidation** | **P2** | If multiple rounds of the same item exist but have different statuses, they should generally be prioritized by the *most urgent* status fraction. (e.g., if 1/2 is Pending, the item row stays high). |

## 5. User Flow Scenarios

1.  **User places Order Round 1**: Items A, B. Status: `PENDING`. -> displayed at top.
2.  **Staff accepts Order**: Items A, B become `COOKING`. -> positions remain relative, but visually status updates.
3.  **User places Order Round 2**: Item C. Status: `PENDING`.
    *   *Display*: Item C (Pending) jumps to **Top**.
    *   Item A, B (Cooking) move to **Bottom/Below**.
4.  **Item A is Served**: Status `SERVED`.
    *   *Display*: Item C (Pending) -> Item B (Cooking) -> Item A (Served).

## 6. Technical Specifications

### Data Model Impact
No change to DB schema, but the Frontend `selector` or `hook` fetching the order list must apply a client-side sort:

```javascript
const STATUS_PRIORITY = {
  'PENDING': 0,
  'CONFIRMED': 1,
  'COOKING': 2,
  'SERVED': 3,
  'CANCELLED': 4
};

const processedList = items.sort((a, b) => {
  return STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status];
});
```

## 7. Future Considerations
*   **Time-based sorting tied-break**: If two items have the same status, sort by `created_at` (newest first).
*   **Estimated Wait Time**: Display specific ETA for `COOKING` items.
