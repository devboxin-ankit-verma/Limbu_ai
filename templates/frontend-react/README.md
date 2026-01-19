# Frontend React Template

This is a React/TypeScript frontend template following strict separation of concerns.

## Folder Structure

```
frontend-react/
├── src/
│   ├── routes/            # Route definitions ONLY
│   ├── pages/              # Layout + composition ONLY
│   ├── components/         # UI components ONLY
│   ├── hooks/              # Logic only, NO JSX
│   ├── services/           # API calls ONLY
│   ├── constants/          # All constants (no hardcoded values)
│   ├── config/              # App configuration
│   ├── types/               # TypeScript types
│   ├── utils/               # Utility functions
│   └── styles/              # Global styles
├── public/                  # Static assets
├── .env.example            # Environment variables template
└── package.json            # Dependencies
```

## Architecture Rules

### Strict Separation of Concerns

1. **Routes** (`src/routes/`)
   - Route definitions only
   - NO component logic
   - NO API calls
   - NO business logic

2. **Pages** (`src/pages/`)
   - Layout and composition only
   - NO API calls (use Services)
   - NO business logic (use Hooks)
   - Compose Components and Hooks

3. **Components** (`src/components/`)
   - UI rendering only
   - NO API calls
   - NO routing logic
   - NO business logic
   - Receive data via props, emit events via callbacks

4. **Hooks** (`src/hooks/`)
   - Logic and state management only
   - NO JSX/UI rendering
   - NO API calls (use Services)
   - Return data and functions for components

5. **Services** (`src/services/`)
   - API calls only
   - NO UI logic
   - NO routing
   - NO state management
   - Handle HTTP requests/responses

### Environment Variables

- NEVER access `import.meta.env` directly
- ALWAYS use `src/config`
- `.env` is never committed
- `.env.example` must exist with all variables

### Constants

- NO hardcoded values in code
- All constants in `src/constants/`
- Organized by domain (api.ts, routes.ts)

## Setup

1. Copy this template to your project
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and fill in values
4. Run dev server: `npm run dev`
5. Build for production: `npm run build`

## Development

- Run dev server: `npm run dev`
- Lint code: `npm run lint`
- Format code: `npm run format`

## Important

- Do NOT modify the folder structure
- Follow the strict separation of concerns
- Use constants instead of hardcoded values
- Always use the config layer for environment variables
- Routes → Pages → Components → Hooks → Services
