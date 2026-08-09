# App Name: Hishab

**হিসাব** — the Bangla word for "the count / the reckoning." One word, instantly understood by every Bangladeshi user, easy to brand with a blue-to-green gradient wordmark. Tagline: *"আপনার প্রতিটা টাকার হিসাব, একদম নিজে নিজে।"*

(Alt names if you want options: TakaWise, Poysha, MoneyBondhu — but Hishab is the strongest: short, native, brandable, and works as both the app name and the in-app vocabulary — "আজকের হিসাব", "মাসের হিসাব".)

---

## 1. Product Summary

Hishab is an automatic personal finance tracker for Bangladesh. It reads bKash/Nagad/Rocket/upay SMS and notifications, silently builds a full picture of the user's money, and presents it through a premium, animated, effortless dashboard — with insight features (Money Story, price memory, predictive bills, health score) that no competitor currently has.

**Primary competitor:** Lenden (MFS Finance Tracker) — feature-complete but very low adoption, meaning the market is still open for whoever executes best on UI quality, speed, and trust.

---

## 2. Critical Build Rules for Antigravity (read this before writing any code)

These rules exist to prevent the two most common failure modes of AI-assisted app builds: **static/fake data** and **a UI that visibly "looks AI-generated."** Follow them on every screen, no exceptions.

### 2.1 Everything must be dynamic — no static/hardcoded data anywhere
- Every number, chart, list, and card on every screen must be computed from the real local database at render time — never hardcoded sample arrays left in production code.
- Categories must be a real editable table (user can rename, add, recolor, re-icon), not a fixed enum baked into the UI.
- Budgets, the Health Score, and the Money Story must be calculated live from actual transaction data — not templated text with numbers swapped in.
- Empty states matter: every screen needs a real "no data yet" state (e.g., before any SMS is read) — don't let the UI ever fall back to placeholder/demo data silently.
- Onboarding must end in a genuine permission + first-sync flow, not a fake "loading..." animation with no real SMS read behind it.

### 2.2 The UI must not look AI-generated
AI-generated UIs have a recognizable "tell" — avoid every one of these:
- No default purple-to-pink gradient hero sections, no generic centered-headline-with-3-feature-cards landing layout.
- No uniform, everywhere-the-same border-radius and shadow — real premium apps (Revolut, Cred, Wise) use deliberate visual hierarchy: some elements flat, some elevated, some full-bleed, some inset.
- No generic stock/system icon packs for categories — use a small custom icon set designed once and reused consistently.
- No lorem-ipsum-style filler copy — every microcopy string should be real, specific, and in natural Bangla/English mix the way Bangladeshi fintech apps actually write it (see bKash/Nagad's own tone for reference).
- Typography should have real intentional hierarchy (one distinctive display font for balances, one clean body font) — not default system font at uniform weight everywhere.
- Motion should be purposeful (balance count-up, chart draw-in, card press feedback) — not decorative animation added everywhere for its own sake.

### 2.3 Definition of done for any screen
A screen is not complete until: it pulls real data from the local DB, has a loading state, has an empty state, has an error state (e.g., SMS permission denied), and matches the design system tokens (not one-off styling).

---

## 3. Tech Architecture

- **Mobile app:** React Native (needed for a native SMS/Notification Listener background service — this cannot be done in a pure web/PWA wrapper). Use a foreground service for reliability on budget Android devices.
- **Local storage:** SQLite (via a Room-style ORM) as the source of truth — app must be fully usable offline. This is what "dynamic" data is read from on every screen.
- **Backend (optional, for backup/sync only):** Node.js + PostgreSQL — used only for the optional encrypted cloud backup and multi-device sync. Core app functionality must never depend on the backend being reachable.
- **AI layer:** A server-side call (backend proxies this, never call the AI API directly from the client) to generate the monthly "Money Story" narrative text from the user's real aggregated monthly stats — the AI only writes the sentence, it never invents numbers.
- **Permissions handling:** SMS read + notification listener permissions must be requested with a clear, honest explanation screen before the OS prompt — Play Store review is strict about this category of permission.

---

## 4. Data Model (high level)

- **Account** — provider (bKash/Nagad/Rocket/upay), type (MFS/bank/cash), current balance
- **Transaction** — account_id, amount, type (in/out), category_id, merchant_text (raw parsed), timestamp, source (auto-parsed vs manual)
- **Category** — name, icon, color, user-editable, has monthly budget_limit (nullable)
- **Budget** — category_id, month, limit_amount
- **Vendor** — normalized merchant name, first_seen, price_history (derived from transactions, for the price-memory feature)
- **HealthScoreSnapshot** — month, score, breakdown (savings_rate, consistency, bill_punctuality)

---

## 5. Roadmap

### Phase 1 — MVP (get this fully working and polished before touching anything else)
- SMS/notification parsing for bKash + Nagad only (add Rocket/upay after MVP validates)
- Home dashboard: real-time balance, this month's spend, recent transactions
- Transaction list with search/filter, auto-categorization with manual override
- Basic budgets per category with progress bars
- Onboarding + permission flow
- Full dark mode
- **Goal:** this phase alone must feel more polished than Lenden's entire app.

### Phase 2 — Retention features
- Analytics screen (pie/line charts, income vs expense trend)
- Predictive bill reminders (recurring pattern detection)
- Financial Health Score
- Push notifications for budget overspend

### Phase 3 — Differentiator/growth features
- Money Story monthly shareable recap card (this is the viral growth loop — prioritize once retention is solid)
- Vendor price memory insights
- One-tap transaction split with friends
- Family/shared wallet mode
- Zero-account QR device sync

### Phase 4 — Scale
- Rocket + upay support
- Optional encrypted cloud backup
- Play Store optimization, review-response loop, iterate on real user feedback

---

## 6. Non-Functional Requirements
- Cold start under 2 seconds on a 2GB RAM Android device
- 60fps scroll performance everywhere, including long transaction lists (must be virtualized/paginated, never render the full list at once)
- Zero crashes on missing/malformed SMS formats — parsing failures must fail silently into a "review manually" queue, never crash the app
- All financial data encrypted at rest on-device

---

## 7. What "done" looks like for the whole app
A first-time user installs Hishab, grants SMS permission in under 30 seconds because the explanation screen is clear, sees their real bKash/Nagad transactions appear automatically within a minute, and by the end of month one gets a Money Story card good enough that they screenshot and share it unprompted. That last part is the actual success metric — not feature count.
