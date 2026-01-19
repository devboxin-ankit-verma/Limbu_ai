# Backend Node Template

This is a Node.js/TypeScript backend template following strict architectural layering.

## Folder Structure

```
backend-node/
├── src/
│   ├── routes/            # Route definitions ONLY
│   ├── controllers/        # Request/response handling ONLY
│   ├── services/           # Business logic ONLY
│   ├── repositories/       # Database access ONLY
│   ├── models/             # Data definitions ONLY
│   ├── constants/          # All constants (no hardcoded values)
│   ├── config/              # Environment configuration
│   ├── middleware/          # Express middleware
│   ├── utils/               # Utility functions
│   └── app.ts               # Application entry point
├── tests/                   # Test files
├── .env.example            # Environment variables template
└── package.json            # Dependencies
```

## Architecture Rules

### Strict Layering

1. **Routes** (`src/routes/`)
   - Route definitions only
   - NO business logic
   - NO request/response handling (use Controllers)

2. **Controllers** (`src/controllers/`)
   - Request/response handling only
   - Delegate ALL business logic to Services
   - NO database queries

3. **Services** (`src/services/`)
   - Business logic only
   - Use Repositories for data access
   - NO HTTP concerns, NO direct database access

4. **Repositories** (`src/repositories/`)
   - Database access only
   - NO business logic
   - Pure CRUD operations

5. **Models** (`src/models/`)
   - Data definitions only
   - TypeScript interfaces/types

### Environment Variables

- NEVER access `process.env` directly
- ALWAYS use `src/config`
- `.env` is never committed
- `.env.example` must exist with all variables

### Constants

- NO hardcoded values in code
- All constants in `src/constants/`
- Organized by domain (api.ts, errors.ts, roles.ts)

## Setup

1. Copy this template to your project
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and fill in values
4. Build: `npm run build`
5. Run: `npm start` or `npm run dev`

## Development

- Run in dev mode: `npm run dev`
- Run tests: `npm test`
- Lint code: `npm run lint`
- Format code: `npm run format`

## Important

- Do NOT modify the folder structure
- Follow the strict layering rules
- Use constants instead of hardcoded values
- Always use the config layer for environment variables
