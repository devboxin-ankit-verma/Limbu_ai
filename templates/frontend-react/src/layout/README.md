# Layout Folder — Use and Importance

This folder holds **layout components** that define the shared structure (shell) of the app: header, main content area, and footer. Layouts wrap one or more pages so that navigation and chrome stay consistent while only the main content changes.

---

## What Goes Here

- **Layout components** that wrap page content (e.g. `MainLayout.tsx`).
- **Shared chrome**: header, navigation, footer, sidebars.
- **Re-exports** via `index.ts` so the rest of the app can import from `../layout` or `@/layout`.

Do **not** put page-specific UI, business logic, or API calls here. Layouts should only handle structure and shared navigation.

---

## Why It Matters

1. **Single source of truth** — One place for the global shell. Change header or footer once and it updates everywhere.
2. **Consistent UX** — Every page gets the same header, nav, and footer without duplicating markup.
3. **Easier maintenance** — Add a new nav link or change the brand in one file instead of every page.
4. **Clear separation** — Pages focus on *what* to show; layouts define *where* it sits (e.g. inside a header + main + footer).
5. **Nested routing** — With React Router, a layout renders an `<Outlet />` and child routes render inside it, so you can have multiple layouts (e.g. main app vs auth/public) without repeating structure.

---

## How It’s Used

- **Routes** — In `src/routes/index.tsx`, a parent `<Route element={<MainLayout />}>` wraps all page routes. Child routes render inside the layout’s `<Outlet />`.
- **Adding pages** — New pages are added as child routes of the layout; they automatically get the same header and footer.
- **Adding another layout** — Create e.g. `AuthLayout.tsx` (minimal shell for login/register) and a separate `<Route element={<AuthLayout />}>` with its own child routes.

---

## File Overview

| File            | Purpose                                      |
|-----------------|----------------------------------------------|
| `MainLayout.tsx`| Default app shell: header, `<Outlet />`, footer |
| `index.ts`      | Re-exports layout components                 |
| `README.md`     | This documentation                           |

---

## Summary

The **layout** folder is the place for shared structure and chrome. Using it keeps the app consistent, easier to change, and aligned with a single layout strategy across routes.
