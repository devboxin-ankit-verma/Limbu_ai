# Project Setup Guide

This guide is for junior developers starting a new project using this template.

## 📋 Before You Start

1. **Read this entire document** before copying any files
2. **Understand** that the folder structure is fixed - you cannot modify it
3. **Know** that Cursor AI will enforce these rules automatically via `.cursor/rules.md`

## 🎯 Step 1: Choose Your Setup Type

You have two options:

### Option A: Monorepo (Frontend + Backend in one repo)

**Use this when:**
- Frontend and backend are tightly coupled
- You want shared code/types
- You prefer managing one repository

**Location:** Copy from `monorepo/` directory

### Option B: Separate Repos (Frontend and Backend in different repos)

**Use this when:**
- Frontend and backend are independent
- Different teams work on each
- You prefer separate deployments

**Location:** Copy from `templates/` directory

## 🔧 Step 2: Choose Your Backend

### Python Backend

**Use this when:**
- Team is familiar with Python
- Using FastAPI, Django, or Flask
- Need rapid development

**Template:** `backend-python/`

**Features:**
- FastAPI/Django/Flask compatible
- Pydantic for validation
- SQLAlchemy for database
- Strict layering enforced

### Node.js Backend

**Use this when:**
- Team is familiar with JavaScript/TypeScript
- Using Express or Nest.js
- Need TypeScript type safety

**Template:** `backend-node/`

**Features:**
- Express/Nest.js compatible
- TypeScript for type safety
- Strict layering enforced

## ⚛️ Step 3: Choose Your Frontend

### React Frontend

**Template:** `frontend-react/`

**Features:**
- Vite + TypeScript
- React Router
- Strict separation of concerns
- Hooks for logic, Services for API

## 📦 Step 4: Copy the Template

### For Monorepo Setup

```bash
# Navigate to your project directory
cd /path/to/your/project

# Copy the entire monorepo structure
cp -r /path/to/template/monorepo/* .

# Or copy specific components
cp -r /path/to/template/monorepo/backend-python ./backend
cp -r /path/to/template/monorepo/frontend-react ./frontend
```

### For Separate Repos Setup

```bash
# For Backend
cd /path/to/your/backend
cp -r /path/to/template/templates/backend-python/* .

# For Frontend (in a different directory)
cd /path/to/your/frontend
cp -r /path/to/template/templates/frontend-react/* .
```

## ⚙️ Step 5: Setup Environment Variables

### Backend Setup

1. **Copy** `.env.example` to `.env`
2. **Fill in** all required values:
   - Database connection string
   - Secret keys
   - API URLs
   - CORS origins

```bash
cp .env.example .env
# Edit .env with your values
```

### Frontend Setup

1. **Copy** `.env.example` to `.env.local`
2. **Fill in** all required values:
   - API base URL
   - App configuration

```bash
cp .env.example .env.local
# Edit .env.local with your values
```

## 📚 Step 6: Install Dependencies

### Python Backend

```bash
# Install dependencies
pip install -e .

# Or with poetry
poetry install
```

### Node Backend

```bash
# Install dependencies
npm install

# Or with yarn
yarn install
```

### React Frontend

```bash
# Install dependencies
npm install

# Or with yarn
yarn install
```

## 🚀 Step 7: Start Development

### Python Backend

```bash
# Run development server
python src/main.py

# Or with uvicorn
uvicorn src.main:app --reload
```

### Node Backend

```bash
# Run development server
npm run dev

# Or
yarn dev
```

### React Frontend

```bash
# Run development server
npm run dev

# Or
yarn dev
```

## ✅ Step 8: Verify Setup

1. **Check** that all environment variables are set
2. **Verify** that the application starts without errors
3. **Test** that you can access the health check endpoint (backend)
4. **Confirm** that the frontend loads in the browser

## 🎓 Step 9: Understand the Rules

### Folder Structure Rules

- ✅ **DO** place files in the correct existing folders
- ❌ **DON'T** create new folders without permission
- ❌ **DON'T** modify the folder structure
- ✅ **DO** ask if you're unsure where a file belongs

### Backend Layering Rules

```
Routes/Controllers → Services → Repositories → Models
```

- **Routes/Controllers**: Handle HTTP only, delegate to Services
- **Services**: Business logic only, use Repositories for data
- **Repositories**: Database access only, no business logic
- **Models**: Data definitions only

### Frontend Separation Rules

```
Routes → Pages → Components → Hooks → Services
```

- **Routes**: Route definitions only
- **Pages**: Compose components and hooks, no API calls
- **Components**: UI only, no logic, no API calls
- **Hooks**: Logic only, no JSX, use Services for API
- **Services**: API calls only

### Constants Rules

- ✅ **DO** use constants from `/constants` directory
- ❌ **DON'T** hardcode values in code
- ✅ **DO** organize constants by domain (api, errors, roles)

### Environment Variables Rules

- ✅ **DO** use the config layer (`src/config/`)
- ❌ **DON'T** access `process.env` or `os.getenv()` directly
- ✅ **DO** ensure `.env.example` exists with all variables

## 🆘 When You're Stuck

### If you're unsure where a file belongs:

1. **Check** the folder structure in the template
2. **Read** the `.cursor/rules.md` file
3. **Ask** your senior engineer or team lead
4. **Don't guess** - better to ask than violate architecture

### If Cursor AI suggests something that violates rules:

1. **Stop** and read the error message
2. **Check** `.cursor/rules.md` for the specific rule
3. **Ask** if the rule violation is necessary
4. **Don't proceed** until you understand the conflict

### If you need a new folder:

1. **Ask** your senior engineer first
2. **Explain** why the existing structure doesn't work
3. **Get approval** before creating new folders
4. **Update** `.cursor/rules.md` if approved

## 📝 Checklist

Before starting to code features, ensure:

- [ ] Template copied correctly
- [ ] Environment variables configured
- [ ] Dependencies installed
- [ ] Application starts without errors
- [ ] You understand the folder structure
- [ ] You understand the layering rules
- [ ] You know where constants go
- [ ] You know how to use the config layer
- [ ] Cursor IDE is set up with `.cursor/rules.md`

## 🎯 Next Steps

1. **Start coding features** - The structure is ready
2. **Follow the rules** - Cursor will help enforce them
3. **Use examples** - Each template has example code showing patterns
4. **Ask questions** - When in doubt, ask

## 💡 Remember

- **Architecture discipline > Speed** - Follow the rules even if it seems slower
- **Consistency > Creativity** - In structure, not in features
- **Ask > Assume** - Better to ask than violate rules
- **Template > Design** - Copy, don't redesign

---

**You're ready to start!** The template provides the structure, you provide the features. Let Cursor AI help you maintain discipline.
