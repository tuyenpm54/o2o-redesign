# Modular UI Architecture: Scenario-Driven "View Composition"

**Status**: Proposal
**Date**: 2026-01-28
**Objective**: Architect a flexible, configuration-driven UI system where a single codebase supports multiple dining scenarios (Fast Order, Consultative, Social/Shared) through toggleable modules.

## 1. Core Concept: "Zone-Based" Layout System

Instead of hardcoding pages, we define the application as a collection of **Zones**. Each Zone can host specific **Modules** (Components). The "Scenario" determines which Modules are loaded into which Zones.

### The Zones
1.  **Header Zone** (Sticky Top): Identity, Table Info, Search.
2.  **Hero Zone** (Scrollable Top): Context, Greetings, Promotions, Wizard.
3.  **Navigation Zone** (Sticky Anchor): Categories, Filters.
4.  **Content Zone** (Main Area): The Product Catalog.
5.  **Engagement Zone** (Overlays): Upsells, Floating Assistants (FAB).
6.  **Action Zone** (Sticky Bottom): Cart, Payment, Shared Cart Status.

---

## 2. The Module Library (Lego Blocks)

### A. Discovery & Context Modules (Hero Zone)
*   `WelcomeBanner`: Simple "Good Morning" text.
*   `SmartConsultant`: The "Going with 4 people?" wizard.
*   `FlashSaleCarousel`: Horizontal scroll of hot deals.
*   `PersonalizedSuggestions`: "Based on your history" row.

### B. Catalog Modules (Content Zone)
*   `DenseGridList`: 2-column, small image, minimal text (For Fast Order).
*   `RichCardList`: 1-column, large image, description text (For Discovery).
*   `InteractiveMenu`: Drag-and-drop builder (For Hotpot/Pizza).

### C. Functional Modules (Action/Overlay Zones)
*   `MiniToastCart`: Subtle notification (For Fast Order).
*   `LiveSharedCart`: Real-time avatar bubbles & "Sync" status (For Social Mode).
*   `SupportFAB`: Floating button for service.
*   `SplitBillWidget`: Advanced payment tools.

---

## 3. Scenario Configurations (The "Presets")

The Restaurant Owner (or System) selects a "Mode", which applies a JSON configuration.

### Scenario 1: "Fast Food / Lunch Rush" (Speed Focus)
*   **Hero Zone**: `FlashSaleCarousel` (Trigger impulse buy).
*   **Content Zone**: `DenseGridList` (Show max items).
*   **Action Zone**: `MegaCheckoutButton` (Immediate pay).
*   **Disabled**: `SmartConsultant`, `SharedCart`.

### Scenario 2: "Family Dinner / Tourists" (Consultant Focus)
*   **Hero Zone**: `SmartConsultant` (Wizard to help choose).
*   **Content Zone**: `RichCardList` (Entice with visuals).
*   **Engagement**: `UpsellPopup` (Suggest drinks/desserts).
*   **Action Zone**: Standard Cart.

### Scenario 3: "Pub / Buffet / Hotpot" (Social Focus)
*   **Hero Zone**: `PersonalizedSuggestions` ("Món nhậu").
*   **Content Zone**: `DenseGridList` (Easy re-ordering).
*   **Action Zone**: `LiveSharedCart` (The Star Feature).
    *   *Behavior*: Shows distinct avatars for User A, User B.
    *   *Logic*: Syncs via WebSocket. Prevents checkout collision.

---

## 4. Technical Implementation Strategy

### 4.1 Config Schema Example
```typescript
interface ScenarioConfig {
  modeId: 'FAST_ORDER' | 'DISCOVERY' | 'SOCIAL';
  layout: {
    hero?: ['BANNER', 'WIZARD', 'NONE'];
    catalogView: 'GRID_2_COL' | 'LIST_CARD' | 'MASONRY';
    cartMode: 'TOAST' | 'SHARED_LIVE' | 'standard';
  };
  features: {
    enableUpsell: boolean;
    enableSplitBill: boolean;
    enableGuestSync: boolean; // Activates Shared Cart logic
  };
}
```

### 4.2 The "View Orchestrator" Component
A React HOC (High Order Component) or Context Provider that takes the `ScenarioConfig` and renders:

```tsx
const MainLayout = ({ config }) => {
  return (
    <div className="app-shell">
      <Header />
      
      {/* Hero Zone: Conditional Render */}
      {config.layout.hero === 'WIZARD' && <SmartConsultantWizard />}
      {config.layout.hero === 'BANNER' && <FlashSaleCarousel />}
      
      {/* Catalog Zone: Dynamic Component */}
      <CatalogResolver viewType={config.layout.catalogView} />
      
      {/* Engagement Zone */}
      {config.features.enableGuestSync && <SharedCartOverlay />}
      
      {/* Action Zone */}
      <FooterCart mode={config.layout.cartMode} />
    </div>
  );
};
```

## 5. Visualizing the "Shared Cart" Module
When `config.features.enableGuestSync` is **TRUE**:
1.  **Top Bar**: Shows "Session Code: #1234" + Avatars of joined users.
2.  **Product Card**: When User A adds an item, User B sees a small bubble +1 with A's avatar fly into the cart.
3.  **Cart View**:
    *   Section: "My Items" vs "Table Items".
    *   Action: "Lock Order" (Host only) or "Ready" (Voting system).

---

## 6. Summary for Owner
The owner simply toggles a switch: **"Enable Party Mode?"**.
*   **Yes**: Webview transforms -> Loads `LiveSharedCart` module, enables WebSocket, switches catalog to `DenseGridList`.
*   **No**: Webview remains standard -> Individual cart, local storage only.
