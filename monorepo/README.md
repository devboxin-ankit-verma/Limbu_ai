# Monorepo Setup Guide

This directory provides instructions for setting up a monorepo using the templates from `../templates/`.

## 🎯 Purpose

The `templates/` directory is the **single source of truth** for all code. This guide shows you how to combine those templates into a monorepo structure.

## 📦 How to Create a Monorepo

### Step 1: Choose Your Stack

Decide which backend and frontend you want to use:

- **Backend Options:**
  - `../templates/backend-python/` - Python/FastAPI backend
  - `../templates/backend-node/` - Node.js/Express backend

- **Frontend Options:**
  - `../templates/frontend-react/` - React/TypeScript frontend

### Step 2: Copy Templates to Your Project

#### Option A: Manual Copy

```bash
# Navigate to your new project directory
cd /path/to/your/new-project

# Copy backend (choose one)
cp -r /path/to/template/templates/backend-python ./backend
# OR
cp -r /path/to/template/templates/backend-node ./backend

# Copy frontend
cp -r /path/to/template/templates/frontend-react ./frontend

# Copy Cursor rules (important!)
cp -r /path/to/template/.cursor ./
```

#### Option B: Using Git Template

If this is a GitHub template repository:

1. Click "Use this template" on GitHub
2. Create your new repository
3. Clone it locally
4. Copy templates:

```bash
# Copy backend
cp -r templates/backend-python ./backend
# OR
cp -r templates/backend-node ./backend

# Copy frontend
cp -r templates/frontend-react ./frontend

# Copy Cursor rules
cp -r .cursor ./
```

### Step 3: Set Up Workspace Configuration

#### For npm/yarn workspaces:

Create `package.json` at the root:

```json
{
  "name": "my-project",
  "private": true,
  "workspaces": [
    "backend",
    "frontend"
  ],
  "scripts": {
    "dev:backend": "cd backend && npm run dev",
    "dev:frontend": "cd frontend && npm run dev",
    "dev": "npm run dev:backend & npm run dev:frontend"
  }
}
```

#### For pnpm workspaces:

Create `pnpm-workspace.yaml` at the root:

```yaml
packages:
  - 'backend'
  - 'frontend'
```

#### For Python + Node monorepo:

You can mix Python and Node.js:

```json
{
  "name": "my-project",
  "private": true,
  "workspaces": [
    "frontend"
  ],
  "scripts": {
    "dev:backend": "cd backend && python src/main.py",
    "dev:frontend": "cd frontend && npm run dev"
  }
}
```

### Step 4: Configure Environment Variables

Each component has its own `.env.example`. Copy and configure:

```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your values

# Frontend
cp frontend/.env.example frontend/.env.local
# Edit frontend/.env.local with your values
```

### Step 5: Install Dependencies

```bash
# Backend (if Node.js)
cd backend && npm install

# Backend (if Python)
cd backend && pip install -e .

# Frontend
cd frontend && npm install
```

### Step 6: Update API URLs

In your frontend `.env.local`, make sure the API URL points to your backend:

```env
VITE_API_BASE_URL=http://localhost:8000
```

## 📁 Final Monorepo Structure

After setup, your project should look like:

```
my-project/
├── .cursor/
│   └── rules.md              # Cursor AI governance (copied from template)
├── backend/                  # Copied from templates/backend-python or templates/backend-node
│   ├── src/
│   ├── .env.example
│   ├── .gitignore
│   └── ...
├── frontend/                 # Copied from templates/frontend-react
│   ├── src/
│   ├── .env.example
│   ├── .gitignore
│   └── ...
├── package.json              # Root workspace config (if using npm/yarn/pnpm)
├── pnpm-workspace.yaml       # If using pnpm
└── README.md                 # Your project README
```

## 🎯 Key Points

1. **Single Source of Truth**: All code comes from `templates/` - never modify `monorepo/` directory
2. **Copy, Don't Link**: Always copy templates to your project, don't create symlinks
3. **Cursor Rules**: Make sure to copy `.cursor/rules.md` to maintain AI governance
4. **Independent Components**: Each component (backend/frontend) maintains its own structure and dependencies
5. **Workspace Config**: Set up workspace configuration only if you want shared dependencies

## 🔄 Updating Templates

When templates are updated:

1. **Don't update your project directly** - update the templates in the template repository
2. **Copy updated templates** to your project
3. **Merge changes** carefully if you've made customizations

## 📝 Example: Complete Setup Script

Here's a complete setup script you can use:

```bash
#!/bin/bash

# Set your project name
PROJECT_NAME="my-project"
BACKEND_TYPE="python"  # or "node"

# Create project directory
mkdir -p $PROJECT_NAME
cd $PROJECT_NAME

# Copy backend
if [ "$BACKEND_TYPE" == "python" ]; then
  cp -r ../templates/backend-python ./backend
else
  cp -r ../templates/backend-node ./backend
fi

# Copy frontend
cp -r ../templates/frontend-react ./frontend

# Copy Cursor rules
cp -r ../.cursor ./

# Create workspace config (for Node.js projects)
if [ "$BACKEND_TYPE" == "node" ]; then
  cat > package.json << EOF
{
  "name": "$PROJECT_NAME",
  "private": true,
  "workspaces": ["backend", "frontend"]
}
EOF
fi

echo "Monorepo setup complete!"
echo "Next steps:"
echo "1. Configure .env files in backend/ and frontend/"
echo "2. Install dependencies"
echo "3. Start development"
```

## ⚠️ Important Reminders

- **Do NOT modify folder structures** - Each template has a fixed structure
- **Do NOT create new folders** - Follow the template structure exactly
- **Always use config layer** - Never access environment variables directly
- **Use constants** - No hardcoded values in code
- **Follow layering rules** - Routes → Services → Repositories → Models (backend)
- **Follow separation rules** - Routes → Pages → Components → Hooks → Services (frontend)

## 🆘 Need Help?

- Read `../PROJECT_SETUP.md` for detailed setup instructions
- Check each template's README for component-specific instructions
- Review `../.cursor/rules.md` for architectural rules

---

**Remember**: The `templates/` directory is the single source of truth. This `monorepo/` directory only contains instructions - no code!
