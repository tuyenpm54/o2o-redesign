# Landing Page and Login Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a product marketing landing page with pricing and a secure login gate for the CMS admin.

**Architecture:** 
- New routes: `/home` (landing), `/login` (auth).
- Use `lucide-react` for icons and `tailwind-css` for styling.
- Implement a client-side auth check component to protect `/admin`.

**Tech Stack:** Next.js (App Router), TailwindCSS, Lucide React.

---

### Task 1: Create Login Page

**Files:**
- Create: `src/app/login/page.tsx`
- Create: `src/components/auth/LoginForm.tsx`

**Step 1: Write minimal implementation**
Create a professional login form with email/password fields. Add validation and a "Login" button that sets a mock cookie or localStorage flag and redirects to `/admin`.

**Step 2: Commit**
```bash
git add src/app/login/page.tsx src/components/auth/LoginForm.tsx
git commit -m "feat: add login page and form"
```

### Task 2: Implement Auth Gate for Admin

**Files:**
- Modify: `src/app/admin/layout.tsx`
- Create: `src/components/auth/AuthCheck.tsx`

**Step 1: Write minimal implementation**
Create `AuthCheck` component that checks for the existence of the mock auth flag. Wrap the `AdminLayout` with `AuthCheck`. Redirect to `/login` if not authenticated.

**Step 2: Commit**
```bash
git add src/app/admin/layout.tsx src/components/auth/AuthCheck.tsx
git commit -m "feat: implement auth gate for admin routes"
```

### Task 3: Build Landing Page Hero & Features

**Files:**
- Create: `src/app/home/page.tsx`
- Create: `src/components/landing/Hero.tsx`
- Create: `src/components/landing/Features.tsx`

**Step 1: Write minimal implementation**
Implement a modern hero section with a strong headline and CTA. List key features (Smart suggestions, Multi-user ordering, Cross-sale, CMS Admin).

**Step 2: Commit**
```bash
git add src/app/home/page.tsx src/components/landing/Hero.tsx src/components/landing/Features.tsx
git commit -m "feat: add landing page hero and features"
```

### Task 4: Build Pricing Section

**Files:**
- Create: `src/components/landing/Pricing.tsx`
- Modify: `src/app/home/page.tsx`

**Step 1: Write minimal implementation**
Create two cards: "Cơ Bản" (Free) and "Nâng Cao" (Paid). Highlight "Tùy chỉnh giao diện" as a Pro-only feature. Link CTA buttons to `/login`.

**Step 2: Commit**
```bash
git add src/components/landing/Pricing.tsx src/app/home/page.tsx
git commit -m "feat: add pricing section to landing page"
```

### Task 5: Update Navigation Redirects

**Files:**
- Modify: `next.config.ts`
- Modify: `src/components/admin/AdminSidebar.tsx`

**Step 1: Write minimal implementation**
Update `next.config.ts` to redirect `/` to `/home`. Add a "Logout" button to the `AdminSidebar` that clears the auth flag and redirects to `/home`.

**Step 2: Commit**
```bash
git add next.config.ts src/components/admin/AdminSidebar.tsx
git commit -m "feat: update redirects and add logout functionality"
```
