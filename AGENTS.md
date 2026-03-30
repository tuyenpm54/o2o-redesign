# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

O2O Redesign is a QR-code-based restaurant ordering system built for Vietnamese dining. Customers scan a QR code at a table and get a web-based ordering experience. The app supports multiple ordering models and dining scenarios (dine-in, food court/mall, discovery mode).

## Commands

- **Dev server:** `npm run dev` (runs on http://localhost:3000)
- **Build:** `npm run build`
- **Production start:** `npm start`
- **Lint:** `npm run lint` (ESLint with next/core-web-vitals + typescript configs)

There is no test framework configured in this project.

## Tech Stack

- **Next.js 16** with App Router, **React 19**, **TypeScript**
- **React Compiler** enabled (`reactCompiler: true` in `next.config.ts`)
- **Tailwind CSS 3** + **CSS Modules** (`.module.css` files per component)
- **PostgreSQL** (`pg` pool) for user sessions, orders, carts, and user data via `DATABASE_URL`.
- **next-themes** for dark mode (class-based, `darkMode: 'class'` in Tailwind config)
- **lucide-react** for all icons — never use emoji as UI icons
- Deployed on **Netlify** (see `netlify.toml`)

## Path Alias

`@/*` maps to `./src/*` (configured in `tsconfig.json`).

## Architecture

### Three Shop Models

Configured in `src/config/shopConfig.ts`, with UI copy in `src/constants/copy.ts`:

- **Model A** — "Trả sau" (post-pay dine-in): customer orders, staff serves, pay after eating
- **Model B** — "Trả trước tại bàn" (pre-pay at table): order and pay immediately, staff delivers
- **Model C** — "Trả trước tại quầy" (pre-pay at counter): order, pay, pick up at counter

### Key Pages (App Router — `src/app/`)

- `/` → redirects to `/customer`
- `/customer` — Main storefront preview with dynamic module rendering driven by `localStorage` config (`preview_storefront_config`). This is the primary customer-facing ordering page.
- `/discovery?resid=&tableid=` — Restaurant-specific menu page entered via QR scan. Fetches restaurant data, menu, and table members from APIs. Has a guided wizard, cart drawer, item detail modal, and food pairing recommendations.
- `/mall` — Multi-store food court ordering (similar structure to `/customer` but with multiple store sources like KFC, Phở 24, Highlands Coffee).
- `/admin` → redirects to `/admin/dashboard`. Protected by `AuthCheck`. Uses sidebar layout (`AdminSidebar`). Sub-pages: `/dashboard`, `/appearance`, `/display`, `/modules`.
- `/account`, `/account/settings`, `/account/vouchers` — User profile and settings.
- `/chat` — Customer-restaurant messaging.
- `/bill`, `/customer/bill`, `/mall/bill` — Bill/payment views.
- `/customer/orders`, `/mall/orders`, `/order-history` — Order tracking with rounds.
- `/login` — Login page.
- `/home` — Landing page (Hero, Features, Pricing).

### API Routes (`src/app/api/`)

All API routes use Next.js Route Handlers. Data access is handled through PostgreSQL via `src/lib/db.ts`.

- `/api/auth/login`, `/api/auth/guest`, `/api/auth/logout`, `/api/auth/me`, `/api/auth/preferences` — Session-based auth using cookies (`session_id`). Guest and registered users share the same `users` table via the `isGuest` boolean.
- `/api/restaurants`, `/api/restaurants/[resid]`, `/api/restaurants/[resid]/live` — Restaurant data.
- `/api/cart` — Cart operations (GET/POST), keyed by `{userId}_{resId}`.
- `/api/orders` — Place orders from cart. Includes simulated order status progression (Pending → Confirmed → Cooking → Ready → Served).

### User Data & Billing Architecture
- **Table Sessions vs Invoices**: A physical table's lifecycle is tracked in `table_sessions` (`status = 'ACTIVE'`). When customers pay via the dashboard, the `table_sessions` row is marked `'PAID'`, and an immutable `invoices` object is automatically created.
- **History & Progression**: `visit_count` and `points` are never randomly incremented. They are rigidly calculated during Invoice generation. Meaningful customer insights (like spicy preferences or popular ordered items) are accurately aggregated EXCLUSIVELY from the exact `order_items` that the specific `user_id` ordered, ensuring high-fidelity AI recommendations.
- **VAT & Reviews**: 1 Invoice strictly equals 1 VAT document (First-come, first-served based on the user requesting billing checkout). However, the Invoice permits multi-tenant reviews, wherein ANY registered presence (`user_id`) at the table boundary gets an individual permission to submit a 1-5 star review.
- `/api/restaurants`, `/api/restaurants/[resid]`, `/api/restaurants/[resid]/live` — Restaurant data.
- `/api/cart` — Cart operations (GET/POST), keyed by `{userId}_{resId}`.
- `/api/orders` — Place orders from cart. Includes simulated order status progression (Pending → Confirmed → Cooking → Ready → Served) using `setTimeout` chains.
- `/api/chat` — Messaging between customer and restaurant.
- `/api/payment/request` — Payment request.

### Data Layer (`src/lib/db.ts`)

- Uses **PostgreSQL** (`pg` pool) for all persisting data (users, sessions, orders, carts, messages).
- The previously used `src/data/*.json` files and SQLite database are deprecated and should not be used as the source of truth.
- `mock-*.ts` files — Client-side mock data for UI development (menu, table members, order history, profile).

### Context Providers (wrap the entire app in `src/app/layout.tsx`)

- `ThemeProvider` (`src/components/ThemeProvider.tsx`) — Dark/light mode via `next-themes`.
- `LanguageProvider` (`src/context/LanguageContext.tsx`) — Bilingual support (Vietnamese `vi` / English `en`). Translations are inline in this file. Use `useLanguage()` hook and its `t()` function for translated strings.
- `AuthProvider` (`src/context/AuthContext.tsx`) — Auth state. Use `useAuth()` hook for `isLoggedIn`, `user`, `login()`, `loginAsGuest()`, `logout()`.

### Modular UI System

The customer storefront (`/customer`) uses a zone-based modular architecture (documented in `docs/modular_ui_architecture.md`). Modules are rendered dynamically from a config stored in `localStorage`. Module types include: `hero-banner`, `group-ordering`, `guided-discovery`, `bill-discount-progress`, `flash-sales`, `collection-grid`, `menu-grid`, `smart-suggestions`.

The admin panel (`/admin/modules`, `/admin/display`) configures which modules appear and in what order, pushing config to the customer storefront via `localStorage` / `postMessage`.

### Component Organization

- `src/components/` — Shared components (ThemeProvider, ThemeToggle, Account section, auth components, landing page components).
- `src/modules/customer/components/` — Customer-facing feature modules, each in its own folder with `.tsx` + `.module.css`. Examples: `ContextBanner`, `Greeting`, `Header`, `FlashSale`, `SmartSuggestion`, `Buffet`, `LoyaltyCard`, `OnboardingGuide`, `MemberLobby`, `ActiveOrder`, `BannerSlider`, `FilterTagsBar`, `PromotionStrip`.
- `src/modules/admin/components/` — Admin panel components (sidebar, charts, config panels, previews).
- `src/app/discovery/components/` — Discovery-page-specific components (Header, Footer, ItemDetailModal, CartDrawer, DiscoveryWizard).

## Styling Conventions

- Use **Tailwind CSS** for utility styling and **CSS Modules** (`.module.css`) for component-specific styles. Most customer modules use CSS Modules; admin and layout code tends to use Tailwind directly.
- The design system uses a custom color palette: primary red (`#DF1B41`), secondary orange (`#F56B0F`), CTA gold (`#F9B208`) — defined in `tailwind.config.js`.
- Font family: **DM Sans** for all text (sans, heading, display).
- Dark mode classes use Tailwind's `dark:` prefix. Background: `bg-slate-50` / `dark:bg-[#050510]`.

## UI/UX Workflow

There is a UI/UX Pro Max workflow at `.agent/workflows/ui-ux-pro-max.md` with a searchable design database. Key rules from it:
- Use **lucide-react** SVG icons, never emoji as UI icons
- All clickable elements must have `cursor-pointer`
- Hover states must provide visual feedback without layout shift
- Transitions should be 150–300ms
- Ensure light/dark mode contrast (4.5:1 minimum for text)
- Test at 320px, 768px, 1024px, 1440px breakpoints

## Important Notes

- The root URL `/` redirects to `/customer`, and `/customer` redirects via `next.config.ts` from `/` to `/home` for the landing page. The primary ordering flow starts at `/customer` or `/discovery?resid=...&tableid=...`.
- Vietnamese is the default language (`vi`). All UI copy and translations are in `src/context/LanguageContext.tsx`.
- Order status simulation in `/api/orders` uses `setTimeout` to mimic real-time kitchen progression — this is intentional mock behavior.
- The system connects to a PostgreSQL database via `DATABASE_URL`. Do not write new features relying on local JSON files or SQLite.
