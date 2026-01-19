# Agency AI Project Template

A comprehensive Git template repository for software agencies with strict architectural discipline enforced by Cursor AI.

## 🎯 Purpose

This template eliminates architectural debates and ensures consistency across all projects. Junior developers and AI tools follow pre-defined structures and rules, allowing you to focus on features, not architecture.

## 🏗️ Repository Structure

```
agency-ai-project-template/
├── README.md                      # This file
├── PROJECT_SETUP.md               # Step-by-step guide for juniors
├── .cursor/
│   └── rules.md                   # CRITICAL: Cursor AI governance rules
├── templates/
│   ├── backend-python/            # Standalone Python backend template
│   ├── backend-node/              # Standalone Node backend template
│   └── frontend-react/            # Standalone React frontend template
├── monorepo/
│   ├── backend-python/            # Python backend for monorepo
│   ├── backend-node/              # Node backend for monorepo
│   └── frontend-react/            # React frontend for monorepo
└── scripts/
    └── setup.sh                   # Optional setup automation script
```

## 🚀 Quick Start

### For Junior Developers

1. **Read** `PROJECT_SETUP.md` first
2. **Choose** your setup type (Monorepo or Separate Repos)
3. **Choose** your backend (Python or Node)
4. **Copy** the appropriate template(s)
5. **Follow** the folder structure - DO NOT modify it
6. **Let Cursor** enforce the rules via `.cursor/rules.md`

### For Senior Engineers

1. Mark this repository as a **GitHub Template Repository**
2. Share the repository link with your team
3. Ensure all developers have Cursor IDE with `.cursor/rules.md` active
4. Review code for architectural compliance

## 📋 Available Templates

### Backend Options

- **Python** (`templates/backend-python/` or `monorepo/backend-python/`)
  - FastAPI/Django/Flask compatible
  - Strict layering: API → Services → Repositories → Models
  - Pydantic for config and validation

- **Node.js** (`templates/backend-node/` or `monorepo/backend-node/`)
  - Express/Nest.js compatible
  - Strict layering: Routes → Controllers → Services → Repositories → Models
  - TypeScript for type safety

### Frontend Options

- **React** (`templates/frontend-react/` or `monorepo/frontend-react/`)
  - Vite + TypeScript
  - Strict separation: Routes → Pages → Components → Hooks → Services
  - React Router for routing

## 🎯 Key Principles

1. **Zero Architectural Debates** - Structure is fixed, no discussions
2. **AI-Enforced** - Cursor rules prevent violations automatically
3. **Template-Based** - Juniors copy, don't design
4. **Monorepo OR Separate** - Both options supported
5. **Strict Layering** - Prevents technical debt
6. **Constants Isolation** - Easy to maintain and update
7. **Config Layer** - Safe environment variable handling

## 📐 Architecture Rules

### Backend Layering (STRICT)

```
Routes/Controllers → Services → Repositories → Models
```

- **Routes/Controllers**: HTTP request/response ONLY
- **Services**: Business logic ONLY
- **Repositories**: Database access ONLY
- **Models**: Data definitions ONLY

### Frontend Separation (STRICT)

```
Routes → Pages → Components → Hooks → Services
```

- **Routes**: Route definitions ONLY
- **Pages**: Layout + composition ONLY
- **Components**: UI rendering ONLY
- **Hooks**: Logic only, NO JSX
- **Services**: API calls ONLY

### Constants & Config

- **NO hardcoded values** - All constants in `/constants`
- **NO direct env access** - Always use config layer
- **`.env.example` required** - All projects must have this

## 🔧 Cursor AI Governance

The `.cursor/rules.md` file enforces all architectural rules automatically. When developers use Cursor IDE:

- ✅ Folder structure violations are prevented
- ✅ Layer violations are caught
- ✅ Constants usage is enforced
- ✅ Config layer usage is required
- ✅ AI asks before violating any rule

## 📚 Documentation

- **PROJECT_SETUP.md** - Step-by-step guide for juniors
- **Template READMEs** - Each template has its own README with specific instructions
- **.cursor/rules.md** - Complete AI governance rules

## 🎓 How Juniors Use This

### Option A: Monorepo

```bash
git clone agency-ai-project-template
cd agency-ai-project-template
cp -r monorepo/backend-python my-project/backend
cp -r monorepo/frontend-react my-project/frontend
cd my-project
# Start coding features
```

### Option B: Separate Repos

```bash
git clone agency-ai-project-template
cd agency-ai-project-template
cp -r templates/backend-python ../my-backend
cp -r templates/frontend-react ../my-frontend
cd ../my-backend
# Start coding features
```

## ⚠️ Important Rules

1. **DO NOT modify folder structure** - It's fixed for consistency
2. **DO NOT create new folders** - Ask if you need something
3. **DO NOT access env directly** - Always use config layer
4. **DO NOT hardcode values** - Use constants
5. **DO NOT violate layering** - Each layer has one responsibility

## 🔐 Why This Works

| Problem | Solution |
|---------|----------|
| AI hallucinating structure | Cursor rules |
| Junior architectural decisions | Template |
| Inconsistent repos | Single source |
| Senior review overload | AI + structure |
| Scaling team size | System, not people |

## 🧠 Final Mindset Shift

You are not managing developers anymore. You are managing:

- ✅ Code generation pipelines
- ✅ AI behavior
- ✅ Architectural contracts

This setup makes your agency:

- ✅ Senior-light
- ✅ Predictable
- ✅ Scalable
- ✅ AI-native

## 📝 License

This template is provided as-is for use within your agency.

## 🤝 Contributing

This is an internal template. Update it as your agency's needs evolve.

---

**Remember**: Architecture discipline > Speed. Consistency > Creativity (in structure).
