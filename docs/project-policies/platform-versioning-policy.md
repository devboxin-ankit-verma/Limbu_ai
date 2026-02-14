# AI Project Template

## Platform Versioning & Tag Management Policy

Repository:
https://github.com/ayushatwork27/ai_project_template

---

# 1. Purpose

This document defines how we manage:

- Platform versions
- Git tags
- Release lifecycle
- Upgrade policy
- Governance for the AI Project Template

This repository is treated as an internal engineering platform, not a regular project.

---

# 2. Branching Strategy

The repository follows a simple structure:

Branches:

- main → active development
- feature/\* → feature work
- hotfix/\* → urgent fixes

❌ We DO NOT create version-named branches (e.g., v1.0.0)
❌ We DO NOT develop directly on tags

All releases are managed via annotated Git tags.

---

# 3. Tagging Policy (MANDATORY)

We use annotated tags only.

### Creating a Release

When the platform is stable:

1. Ensure main is clean and tested.
2. Update:
   - CHANGELOG.md
   - platform/version.json (if applicable)
3. Pull latest changes:

   git checkout main
   git pull origin main

4. Create annotated tag:

   git tag -a v1.0.0 -m "Release: Initial stable platform version"

5. Push tag:

   git push origin v1.0.0

---

# 4. Versioning Rules

We follow semantic versioning:

vMAJOR.MINOR.PATCH

Example:
v1.0.0
v1.1.0
v1.1.1
v2.0.0

MAJOR:

- Breaking architectural changes
- Folder structure changes
- Layering changes

MINOR:

- Backward-compatible improvements
- Logging enhancements
- New optional modules

PATCH:

- Bug fixes
- Security patches
- Minor corrections

---

# 5. Who Can Create Tags?

Only:

- Platform owner
- Senior engineers explicitly authorized

Tag creation is considered a release action.
It must not be done casually.

---

# 6. Changelog Requirement

Every version must include updates to:

CHANGELOG.md

Structure:

## v1.1.0

### Added

- ...

### Changed

- ...

### Fixed

- ...

### Breaking Changes

- ...

This is mandatory before tagging.

---

# 7. Upgrade Policy for Client Projects

Client projects DO NOT auto-sync with the template.

Each project is permanently tied to the platform version
it was created from.

Upgrades happen only if:

- Security issue
- Critical bug
- Explicit architectural migration
- Client approval (if required)

Upgrade process:

1. Compare versions:

   git diff v1.0.0 v1.1.0

2. Review CHANGELOG.md
3. Create upgrade guide if breaking changes exist
4. Apply changes manually
5. Full testing required

We do NOT merge main into client projects.

---

# 8. Prohibited Practices

❌ No lightweight tags
❌ No version-named branches
❌ No direct edits to released tags
❌ No auto-merging template into live projects
❌ No skipping changelog updates

---

# 9. Platform Ownership Mindset

This repository is our internal engineering framework.

Treat it like:

- Laravel
- Django
- React

It must remain:

- Stable
- Predictable
- Version-controlled
- Disciplined

Architecture discipline > Speed
Stability > Experimentation
