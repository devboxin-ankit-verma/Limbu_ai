# AI Project Template — Project Setup Guide

This guide is for developers starting a new project from the platform template.

**Base template repository:**  
https://github.com/ayushatwork27/ai_project_template

For versioning and release rules, see [platform-versioning-policy.md](./platform-versioning-policy.md).

---

# 1. IMPORTANT RULES

Before starting:

- You **MUST** follow `.cursor/rules.md`
- You **MUST NOT** modify the folder structure
- You **MUST NOT** create new directories without approval
- You **MUST** use the correct platform version (clone from a tag, not from `main`)

If unsure → **ASK** before proceeding.

---

# 2. Creating a New Project from a Platform Version

You must always create a new project from a **specific tag**. Never clone directly from `main`.

## Step 1: Clone from a Tag

Example for version `v1.0.0`:

```bash
git clone --branch v1.0.0 https://github.com/ayushatwork27/ai_project_template.git client-project-name
```

Or:

```bash
git clone -b v1.0.0 https://github.com/ayushatwork27/ai_project_template.git client-project-name
```

Replace `v1.0.0` with the tag you were assigned and `client-project-name` with your project name.

## Step 2: Remove Existing Git History

```bash
cd client-project-name
rm -rf .git
```

## Step 3: Initialize New Repository

```bash
git init
git add .
git commit -m "Initial commit from  Platform v1.0.0"
```

(Use the actual tag in the message, e.g. `v1.0.0`.)

## Step 4: Connect to Your New Remote

Create the new repository on GitHub (or your Git host), then:

```bash
git remote add origin <new-repo-url>
git branch -M main
git push -u origin main
```

---

# 3. Verify Platform Version

Confirm which platform version your project is based on:

- Check **`platform/version.json`** (if present), or
- Use the initial commit message (e.g. "Initial commit from Platform v1.0.0").

This version is the one you must follow for architecture and structure.

---

# 4. Cursor Usage Requirement

Every Cursor AI prompt **MUST** start with:

```
Follow all rules defined in .cursor/rules.md.
```

Failure to follow this and the rules in `.cursor/rules.md` will result in PR rejection.

---

# 5. Choose Setup Type and Stack

## Option A: Monorepo (Frontend + Backend in one repo)

**Use when:** Frontend and backend are tightly coupled, or you want one repo.

**Location:** Use/copy from the `monorepo/` directory (see [monorepo/README.md](../monorepo/README.md)).

## Option B: Separate Repos (Frontend and Backend in different repos)

**Use when:** Frontend and backend are independent or different teams own them.

**Location:** Copy from the `templates/` directory into separate project folders.

### Backend

- **Python:** `templates/backend-python/` — FastAPI/Django/Flask, strict layering
- **Node.js:** `templates/backend-node/` — Express/Nest.js, TypeScript

### Frontend

- **React:** `templates/frontend-react/` — Vite, TypeScript, strict separation

---

# 6. Copy the Template (If Not Using Full Clone as-Is)

If you need to copy only specific parts (e.g. one backend + one frontend):

### Monorepo

```bash
# From your cloned project root
cp -r monorepo/backend-python ./backend
cp -r monorepo/frontend-react ./frontend
# Or use backend-node instead of backend-python
```

### Separate repos

```bash
# Backend
cp -r templates/backend-python /path/to/your/backend-repo
# Or templates/backend-node

# Frontend (in another repo)
cp -r templates/frontend-react /path/to/your/frontend-repo
```

---

# 7. Copy Cursor Configuration (CRITICAL)

Ensure every project has the Cursor rules and config:

```bash
# From your project root
cp -r .cursor /path/to/your/project-root
# Or if .cursor already exists:
mkdir -p .cursor
cp .cursor/config.json /path/to/your/project-root/.cursor/
cp .cursor/rules.md /path/to/your/project-root/.cursor/
```

**Why:** `.cursor/config.json` makes Cursor apply rules on every prompt. Without it, architecture rules are not enforced.

**Check:** In Cursor, ask to create a file in a wrong place; it should ask for clarification if rules are loaded.

---

# 8. What You MUST NOT Do

- Do **not** clone from `main` to create a new project; use a tag.
- Do **not** change platform-level architecture or folder structure.
- Do **not** introduce new architectural patterns without approval.
- Do **not** bypass config/constants rules (env only via config; no hardcoded magic values).

---

# 9. Environment Variables and Dependencies

### Backend

```bash
cp .env.example .env
# Edit .env with database URL, secrets, CORS, etc.
```

### Frontend

```bash
cp .env.example .env.local
# Edit .env.local (e.g. API base URL)
```

### Install dependencies

- **Python:** `pip install -e .` or `poetry install`
- **Node/React:** `npm install` or `yarn install`

---

# 10. Start Development

- **Python:** `python src/main.py` or `uvicorn src.main:app --reload`
- **Node:** `npm run dev`
- **React:** `npm run dev`

---

# 11. If the Platform Releases a New Version

You do **not** upgrade automatically.

Upgrade only when:

- A senior engineer instructs you to, or
- A security or critical fix is required, or
- An official migration guide is provided for that version.

See [platform-versioning-policy.md](./platform-versioning-policy.md) for the full upgrade policy.

---

# 12. Development Workflow

1. Create a feature branch:  
   `git checkout -b feature/feature-name`
2. Develop the feature while following architecture rules.
3. Push the branch and open a PR.
4. Ensure the PR passes the architecture checklist (e.g. [.github/PULL_REQUEST_TEMPLATE.md](../.github/PULL_REQUEST_TEMPLATE.md)).

---

# 13. Architecture Rules (Summary)

- **Folder structure:** Use existing folders only; do not add new ones without approval.
- **Backend:** Routes/Controllers → Services → Repositories → Models (no logic in wrong layer).
- **Frontend:** Routes → Pages → Components → Hooks → Services (no API in components; no JSX in hooks).
- **Constants:** Use `/constants`; no hardcoded values in logic.
- **Environment:** Use the config layer only; no direct `process.env` or `os.getenv()`.

Details are in `.cursor/rules.md`.

---

# 14. Checklist Before Coding

- [ ] Project created from the correct **tag** (not `main`).
- [ ] Platform version verified (`platform/version.json` or commit message).
- [ ] `.cursor/` (including `config.json` and `rules.md`) present in project root.
- [ ] Environment variables set (`.env` / `.env.local`).
- [ ] Dependencies installed; app runs.
- [ ] Cursor prompt header used: "Follow all rules defined in .cursor/rules.md."

---

# 15. Remember

This template exists to:

- Prevent technical debt
- Enforce architecture discipline
- Standardize AI-generated code
- Improve scalability
- Reduce future rewrites

**Architecture discipline > Speed.**  
**Always ask if unsure.**
