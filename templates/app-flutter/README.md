# App Flutter Template

This is a Flutter application template following Clean Architecture principles with strict separation of concerns.

## Folder Structure

```
app-flutter/
├── lib/
│   ├── core/
│   │   ├── config/          # Environment config and routing ONLY
│   │   ├── constants/       # All constants (no hardcoded values)
│   │   ├── network/         # HTTP client configuration ONLY
│   │   ├── services/        # Shared service base classes
│   │   └── utils/           # Utility functions
│   │
│   ├── features/            # Feature modules (one folder per feature)
│   │   ├── auth/
│   │   │   ├── data/        # API models and repositories ONLY
│   │   │   ├── domain/      # Entities and business logic ONLY
│   │   │   └── presentation/ # Screens, widgets, and providers ONLY
│   │   └── home/
│   │       ├── data/
│   │       ├── domain/
│   │       └── presentation/
│   │
│   ├── shared/
│   │   ├── widgets/         # Reusable UI components ONLY
│   │   ├── components/      # Composite UI components ONLY
│   │   └── themes/          # App theme definitions ONLY
│   │
│   └── main.dart            # Application entry point
│
├── assets/
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── test/                    # Test files
├── pubspec.yaml             # Dependencies
├── analysis_options.yaml    # Lint rules
└── .env.example             # Environment variables template
```

## Architecture Rules

### Clean Architecture Layers

1. **Presentation** (`features/*/presentation/`)
   - UI screens and Riverpod providers only
   - NO business logic
   - NO direct API calls (use repositories via providers)
   - Delegates ALL logic to Domain and Data layers

2. **Domain** (`features/*/domain/`)
   - Entities and business logic only
   - NO framework dependencies
   - NO network or database access
   - Pure Dart classes

3. **Data** (`features/*/data/`)
   - Repositories and API models only
   - NO business logic
   - Maps API responses to domain entities
   - Handles all network and local storage operations

### Environment Variables

- NEVER access `dotenv.env` directly
- ALWAYS use `core/config/app_config.dart`
- `.env` is never committed
- `.env.example` must exist with all variables

### Constants

- NO hardcoded values in code
- All constants in `core/constants/`
- Organized by domain (`api_constants.dart`, `app_constants.dart`)

### Feature Structure

- ALL features must live inside `features/`
- Each feature follows the `data/`, `domain/`, `presentation/` split
- Shared UI only in `shared/widgets/` or `shared/components/`
- Network client only in `core/network/`
- Base services only in `core/services/`

## Setup

1. Copy this template to your project
2. Install Flutter SDK: https://flutter.dev/docs/get-started/install
3. Install dependencies: `flutter pub get`
4. Copy `.env.example` to `.env` and fill in values
5. Run the app: `flutter run`

## Development

- Run app: `flutter run`
- Run tests: `flutter test`
- Analyze code: `flutter analyze`
- Format code: `dart format lib/ test/`

## Build

- Android: `flutter build apk --release`
- iOS: `flutter build ipa --release`
- Web: `flutter build web --release`

## Environment Configuration

Copy `.env.example` to `.env`:

```
API_BASE_URL=https://api.example.com
APP_ENV=development
APP_NAME=Flutter App
APP_VERSION=1.0.0
```

## Dependencies

| Package | Purpose |
|---------|---------|
| `flutter_riverpod` | State management |
| `dio` | HTTP networking |
| `flutter_dotenv` | Environment variables |
| `go_router` | Navigation and routing |
| `hive_flutter` | Local storage |

## Important

- Do NOT modify the folder structure
- Follow the Clean Architecture layers strictly
- All features must live inside `features/`
- Shared UI components must go in `shared/widgets/`
- API services must be inside `core/services/`
- Network clients must be in `core/network/`
- Avoid business logic inside UI widgets
- Use constants instead of hardcoded values
- Always use the config layer for environment variables
- Presentation → Domain → Data (never skip layers)
