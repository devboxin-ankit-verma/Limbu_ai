# Backend Python Template

This is a Python backend template following strict architectural layering.

## Folder Structure

```
backend-python/
├── src/
│   ├── api/              # HTTP request/response handling ONLY
│   ├── services/          # Business logic ONLY
│   ├── repositories/      # Database access ONLY
│   ├── models/            # Data definitions ONLY
│   ├── constants/         # All constants (no hardcoded values)
│   ├── config/            # Environment configuration
│   ├── utils/             # Utility functions
│   └── main.py            # Application entry point
├── tests/                 # Test files
├── .env.example          # Environment variables template
└── pyproject.toml        # Dependencies
```

## Architecture Rules

### Strict Layering

1. **API/Routes** (`src/api/`)
   - Handle HTTP request/response only
   - Delegate ALL business logic to Services
   - NO database queries

2. **Services** (`src/services/`)
   - Business logic only
   - Use Repositories for data access
   - NO HTTP concerns, NO direct database access

3. **Repositories** (`src/repositories/`)
   - Database access only
   - NO business logic
   - Pure CRUD operations

4. **Models** (`src/models/`)
   - Data definitions only
   - NO business logic methods

### Environment Variables

- NEVER access `os.getenv()` directly
- ALWAYS use `src.config.settings`
- `.env` is never committed
- `.env.example` must exist with all variables

### Constants

- NO hardcoded values in code
- All constants in `src/constants/`
- Organized by domain (api.py, errors.py, roles.py)

## Setup

1. Copy this template to your project
2. Install dependencies: `pip install -e .`
3. Copy `.env.example` to `.env` and fill in values
4. Run the application: `python src/main.py`

## Development

- Run tests: `pytest`
- Format code: `black src/ tests/`
- Type check: `mypy src/`

## Important

- Do NOT modify the folder structure
- Follow the strict layering rules
- Use constants instead of hardcoded values
- Always use the config layer for environment variables
