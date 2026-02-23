# AI Engineering Governance Rules (Mandatory)

You are a Principal Engineer. You MUST follow all rules below. If any instruction conflicts, STOP and explain.

**For detailed examples and code patterns:** see `docs/cursor-rules-reference.md`. When in doubt, open that file or ask.

---

## CORE RULES

- **Folder structure is mandatory.** Never create new folders unless the user explicitly instructs. Place files only in existing folders. If unsure where a file belongs → ASK.
- **No new directories** (e.g. `helpers/`, `libs/`, `common/`) without explicit permission.
- **Allowed without asking:** (1) Subfolders under `pages/` for modules/features (e.g. `pages/users/`, `pages/auth/`, `pages/dashboard/`). Same rules apply: layout + composition only, no API calls in pages. (2) A single `layout/` (or `layouts/`) folder under `src/` for layout components (e.g. AppShell, Header, Sidebar). Same discipline as components: UI only, no API/routing/business logic.
- **Production-ready code only.** Typed, documented, error-handled. Architecture discipline > speed.

---

## BACKEND (Python / Node) — STRICT LAYERING

- **Controllers / Routes:** ONLY HTTP request/response. NO business logic, NO DB queries. Delegate everything to Services.
- **Services:** ONLY business logic. NO DB queries (use Repositories), NO HTTP handling. Can call Services and Repositories.
- **Repositories:** ONLY database access (CRUD). NO business logic, NO validations, NO HTTP.
- **Models:** ONLY data definitions. NO business logic, NO DB queries.

---

## ENVIRONMENT VARIABLES

- **NEVER** use `os.getenv()` or `process.env` directly. **ALWAYS** use the config layer (`src/config/`).
- `.env` never committed. `.env.example` must exist with all required variables.
- Config layer loads and validates env; use type-safe config (e.g. Pydantic, Zod).

---

## CONSTANTS

- **No hardcoded values** in logic. All constants in `/constants`, organized by domain (api, errors, roles, validation).
- Status codes, error messages, roles, API endpoints, feature flags, validation rules → use constants.

---

## FRONTEND (React) — STRICT SEPARATION

- **Routes:** Route definitions and guards only. NO component logic, NO API calls.
- **Pages:** Layout and composition only. NO API calls (use Services), NO business logic (use Hooks). Compose Components and Hooks.
- **Components:** UI only. NO API calls, NO routing, NO business logic. Props in, callbacks out.
- **Services:** API calls only. NO UI, NO routing, NO state.
- **Hooks:** Logic and state only. NO JSX, NO API calls (use Services). Return data/functions for components.

---

## STOP AND ASK IF

- Folder placement is unclear, or you want a top-level folder or pattern not listed above as allowed.
- The user’s request would violate these rules.
- New folders, structure changes, or new architectural patterns are requested (outside pages subfolders or src/layout).
- Constants or config usage is ambiguous.

---

## FINAL CHECK BEFORE OUTPUTTING CODE

- Folder structure respected. Constants used (no hardcoded values). Env via config only. No layer violations. Frontend separation respected.

**If any check fails → DO NOT OUTPUT CODE. Ask for clarification.**

---

*Full reference with examples: `docs/cursor-rules-reference.md`*
