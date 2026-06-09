# Next.js Routing Audit Report

**Date:** 2026-06-09  
**Primary frontend:** `apps/web` → `http://localhost:3000`  
**Auditor scope:** Full monorepo

---

## 1. Routing bugs found

| # | Severity | Issue | Root cause |
|---|----------|-------|------------|
| 1 | **Critical** | `/pricing` opens on `localhost:5174` | Dev server started in `monorepo/frontend-react` (Vite), not `apps/web` (Next.js) |
| 2 | **High** | Duplicate frontend apps | `apps/web` (Next.js) + `monorepo/frontend-react` (Vite + React Router) both serve marketing routes |
| 3 | **Medium** | Vite default catch-all sent unauthenticated users to `/pricing` on port 5173/5174 | `frontend-react/src/routes/index.tsx` (fixed → redirects to 3000) |
| 4 | **Low** | `CORS_ORIGINS` included `localhost:5173` | `monorepo/backend-node/.env.example` (fixed) |
| 5 | **Low** | `window.location.href` for internal navigation | `workflows-dashboard.tsx` (fixed → `router.push`) |
| 6 | **Info** | OAuth/billing redirects use `window.location.href` | **Correct** — external Stripe/OAuth URLs require full navigation |

---

## 2. Files causing the issue

### Primary culprit (user action)
- **Terminal cwd:** `monorepo/frontend-react` running `npm run dev` → Vite on **5173/5174**
- **Config:** `monorepo/frontend-react/vite.config.ts` (`port: 5173`)

### Legacy Vite marketing app
- `monorepo/frontend-react/src/App.tsx` — `BrowserRouter`
- `monorepo/frontend-react/src/routes/index.tsx` — React Router routes
- `monorepo/frontend-react/src/pages/PricingPage.tsx` — Vite pricing UI
- `monorepo/frontend-react/index.html` — Vite entry

### Correct Next.js app (use this)
- `apps/web/app/(marketing)/page.tsx` → `/`
- `apps/web/app/(marketing)/pricing/page.tsx` → `/pricing`
- `apps/web/app/(marketing)/features/page.tsx` → `/features`
- `apps/web/app/(marketing)/about/page.tsx` → `/about`
- `apps/web/app/(marketing)/contact/page.tsx` → `/contact`
- `apps/web/app/(auth)/login/page.tsx` → `/login`
- `apps/web/app/(auth)/register/page.tsx` → `/register`
- `apps/web/app/(protected)/dashboard/page.tsx` → `/dashboard`
- `apps/web/app/(protected)/settings/page.tsx` → `/settings`

---

## 3. Multiple frontends detected

| Project | Port | Stack | Status |
|---------|------|-------|--------|
| **`apps/web`** | **3000** | Next.js 15 App Router | ✅ **Primary — use for all UI** |
| `apps/api` | 3002 | Next.js API | Backend only |
| `apps/admin` | 3003 | Next.js Admin | Separate admin console |
| `apps/worker` | 3001 | Node worker | Background jobs |
| `monorepo/frontend-react` | 5173/5174 | Vite + React Router | ⚠️ Legacy — auto-redirects to 3000 |
| `monorepo/app-flutter` | — | Flutter mobile | Mobile client |
| `monorepo/backend-node` | 8000 | Express (legacy) | Legacy API |

**Recommendation:** Run only `apps/web` for marketing + product UI. Do not start `monorepo/frontend-react` unless testing legacy redirect.

---

## 4. Next.js App Router review

- ✅ Uses `app/` directory (App Router)
- ✅ No `pages/` router in `apps/web`
- ✅ Route groups: `(marketing)`, `(auth)`, `(protected)`
- ✅ Shared marketing layout: `app/(marketing)/layout.tsx`
- ✅ `middleware.ts` — auth only; no redirects to 5174
- ✅ `next.config.ts` — rewrites `/uploads` to API (3002) only

---

## 5. Link audit (`apps/web` marketing)

| Component | Status |
|-----------|--------|
| `marketing-nav.tsx` | ✅ `next/link` for all internal routes |
| `marketing-footer.tsx` | ✅ `next/link` for all internal routes |
| `marketing-button.tsx` | ✅ `Link` for internal; `<a>` only for `http`/`mailto` |
| `hero-section.tsx` | ✅ `/dashboard`, `/features` |
| `pricing-page.tsx` | ✅ `/register` |
| `landing-content.ts` | ✅ Relative paths only |

---

## 6. Redirect audit

| File | Finding |
|------|---------|
| `apps/web/middleware.ts` | No port 5174 redirects |
| `apps/web/next.config.ts` | Rewrites to API 3002 only |
| `monorepo/frontend-react/index.html` | ✅ Instant redirect 5173/5174 → 3000 |
| `monorepo/frontend-react/src/components/WebAppRedirect.tsx` | ✅ JS fallback redirect |

---

## 7. Environment variables

| Variable | Expected value | Apps |
|----------|----------------|------|
| `NEXTAUTH_URL` | `http://localhost:3000` | web |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | web (added) |
| `NEXT_PUBLIC_WEB_APP_URL` | `http://localhost:3000` | admin |
| `VITE_WEB_APP_URL` | `http://localhost:3000` | frontend-react (legacy) |

**Removed from CORS:** `localhost:5173`

---

## 8. Development server scripts

### Correct (use these)
```bash
cd apps/web && npm run dev    # → localhost:3000
# or from root:
npm run dev                   # → workspace @limbu/web port 3000
```

### Do NOT use for marketing/product UI
```bash
cd monorepo/frontend-react && npm run dev  # → 5173/5174 (legacy)
```

`apps/web/package.json`:
```json
"dev": "next dev --port 3000"
```

---

## 9. Improvements applied

- [x] Instant HTML redirect in Vite `index.html` (5173/5174 → 3000)
- [x] React Router routes in legacy app → `WebAppRedirect`
- [x] Marketing pages consolidated under `app/(marketing)/`
- [x] Nav/footer internal `Link` components
- [x] `workflows-dashboard.tsx` → `useRouter().push()`
- [x] `NEXT_PUBLIC_APP_URL` in `.env.local.example`
- [x] CORS example updated (removed 5173)
- [x] Root `npm run dev` → `@limbu/web`

---

## 10. Performance & quality suggestions

| Area | Suggestion |
|------|------------|
| Routing | Deprecate `monorepo/frontend-react` entirely when admin is fully in Next.js |
| SEO | Add `metadata` + `canonical` using `APP_URL` from `lib/site-url.ts` |
| Images | Continue using `next/image` in marketing components |
| Animations | Hero 3D scene: lazy-load with `dynamic(..., { ssr: false })` ✅ |
| Accessibility | Add `aria-label` to orbit cards in 3D hero |
| Duplication | Merge `LandingPage` and `MarketingPageShell` patterns |
| State | Prefer Next.js server components for static marketing sections |

---

## 11. Final verification checklist

- [ ] Stop any Vite server (`monorepo/frontend-react`)
- [ ] Run `cd apps/web && npm run dev`
- [ ] Open `http://localhost:3000/` — home loads
- [ ] Open `http://localhost:3000/pricing` — pricing loads
- [ ] Open `http://localhost:3000/features` — features loads
- [ ] Open `http://localhost:3000/dashboard` — dashboard (auth required)
- [ ] Open `http://localhost:3000/settings` — settings (auth required)
- [ ] Open `http://localhost:3000/login` — login page
- [ ] Open `http://localhost:3000/register` — register page
- [ ] Navbar links stay on port 3000
- [ ] If Vite accidentally running: `localhost:5174/pricing` redirects to `localhost:3000/pricing`

---

## Quick reference — all routes on port 3000

```
/           Home
/pricing    Pricing
/features   Features
/about      About
/contact    Contact
/blog       Blog
/login      Login
/register   Register
/dashboard  Dashboard
/settings   Settings
```
