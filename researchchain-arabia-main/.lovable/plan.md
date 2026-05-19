# ResearchChain Arabia — Build Plan

Lovable Cloud is now enabled (Postgres + Auth + server functions). This is a very large scope (~25 pages, 6 tables, RBAC, 2 dashboards, AI, mock blockchain). I'll deliver it in **3 phases** in a single build pass so the platform is usable end-to-end, then iterate on polish.

## Phase 1 — Foundation (this turn)

**Database (migration):**
- `profiles` (full_name, role enum researcher|participant|admin, nationality, age, gender, wallet_balance, trust_score, created_at) — linked to `auth.users` via id
- `user_roles` (separate table, `app_role` enum) + `has_role()` security-definer function (per security rules — roles NEVER on profiles)
- `research_studies`, `applications`, `payments`, `consent_ledger`, `notifications`
- RLS policies on every table (researcher sees own studies; participant sees own apps/payments/consent/notifications; public can read open studies)
- `handle_new_user()` trigger → auto-creates profile + assigns role from signup metadata
- Seed data: 4 sample studies, demo researcher + participant accounts not auto-created (users sign up themselves)

**Auth:**
- Email/password + Google OAuth (via Lovable broker)
- Signup with role picker (Researcher / Participant)
- Login, Forgot Password, /reset-password page
- `useAuth` hook + `_authenticated` route guard with role-based redirect

## Phase 2 — Public site + Dashboards (this turn)

**Public routes:** `/`, `/about`, `/features`, `/pricing`, `/contact`, `/login`, `/signup`, `/forgot-password`, `/reset-password`

**Home sections:** Hero, Problem, Solution, Features, How It Works, Dashboard Preview, Vision 2030, Founder Profile (Ali Alzahrani — CEO badge, KFUPM bio, quote), Testimonials, CTA Footer

**Researcher dashboard** (`/_authenticated/researcher/*`):
- Overview (stats, charts via recharts, AI recommendations panel)
- Create Study, Manage Studies, Applicants (approve/reject), Analytics, Payments, Profile

**Participant dashboard** (`/_authenticated/participant/*`):
- Overview (wallet, trust score, available studies)
- Browse Studies, Apply, My Studies, Wallet & Rewards, Consent Ledger (blockchain hashes), Notifications, Profile

## Phase 3 — AI + Blockchain simulation (this turn)

- **AI** via Lovable AI Gateway (`google/gemini-2.5-flash`) — server function `aiSuggestStudy` for researcher study-idea generator + `aiMatchStudies` for participant recommendations + fraud-score heuristic
- **Blockchain sim:** SHA-256 hashing of `{study_id, participant_id, timestamp}` server-side on apply → stored in `consent_ledger`; payments get fake `tx_hash`; immutable display in participant ledger

## Design system

Vision 2030 palette: emerald `#00875A` primary, dark navy `#0A1628` background, white, gold `#D4AF37` accents. Glassmorphism cards, subtle gradients, Tailwind animations. Arabic-ready (`dir` toggle in header, fonts work for both).

## Technical details

- TanStack Start file routes under `src/routes/`
- `createServerFn` for all writes (apply to study, approve applicant, payout, AI calls) — never direct DB writes from client for mutations that need hashing/validation
- `requireSupabaseAuth` middleware on all protected fns; `attachSupabaseAuth` added to `start.ts`
- Recharts for analytics; sonner for toasts; react-hook-form + zod for forms
- All UI uses semantic tokens (no hardcoded colors in components)

## Out of scope (call out)

- Real blockchain (Polygon/Ethereum) — simulated with SHA-256 hashes only
- Real Saudi payment rails (STC Pay, mada) — wallet_balance is numeric only
- Arabic translation strings — UI is bilingual-friendly (RTL works) but copy ships in English; full i18n is a follow-up
- Admin role dashboard — schema supports it, UI is researcher+participant only this pass
- Email delivery (password reset works via Lovable Cloud's built-in mailer)

Approve and I'll build all 3 phases in one pass.
