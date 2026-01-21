# Enforcement System Guide

This document explains the 5-layer enforcement system that ensures `.cursor/rules.md` compliance.

## 🎯 Overview

The enforcement system uses 5 layers to ensure architectural discipline:

1. **Cursor Config** - Automatic rule injection
2. **Prompt Ritual** - Human compliance
3. **CI/CD Checks** - Non-negotiable enforcement
4. **PR Checklist** - Removes debates
5. **AI Review** - Senior time protection

## 📋 Layer Details

### Layer 1: Cursor Config (`.cursor/config.json`)

**What it does:**
- Forces Cursor IDE to load `.cursor/rules.md` on every prompt
- `alwaysApplyRules: true` ensures rules are always active

**Setup:**
- Already included in template
- Copy `.cursor/` directory when creating new projects

**Verification:**
- Open Cursor IDE
- Ask AI to create a file in wrong location
- If it asks about placement → Working ✅

---

### Layer 2: Mandatory Prompt Header

**What it does:**
- Forces developers to consciously think about architecture
- Activates rules context in AI prompts

**Required format:**
```
Follow all rules defined in .cursor/rules.md.

Context:
- Stack: (Python / Node / React)
- Feature: <short description>
- Files expected to change:
  - <file path>
```

**Enforcement:**
- PR template requires this header
- PRs without it = rejected

---

### Layer 3: CI/CD Enforcement

**What it does:**
- Automatically runs on every push/PR
- Checks for architecture violations
- Blocks merges if violations found

**Files:**
- `.github/workflows/architecture-check.yml` - Main CI workflow
- `templates/backend-node/.eslintrc.js` - Node linting rules
- `templates/backend-node/scripts/validate-env.js` - Env validation
- `templates/backend-python/scripts/validate_architecture.py` - Python validation

**What it checks:**
- ✅ `.cursor/rules.md` exists
- ✅ `.cursor/config.json` exists
- ✅ No direct `process.env` / `os.getenv()` usage
- ✅ No layer violations (controllers → services → repositories)
- ✅ No hardcoded status codes
- ✅ Folder structure compliance

**Running locally:**
```bash
# Node projects
cd backend-node
npm run validate  # Runs lint + env validation

# Python projects
cd backend-python
python scripts/validate_architecture.py
```

---

### Layer 4: PR Checklist

**What it does:**
- GitHub automatically shows checklist when opening PR
- Removes debates - it's a contract, not opinion

**File:**
- `.github/PULL_REQUEST_TEMPLATE.md`

**Enforcement:**
- Reviewers check boxes during review
- Unchecked boxes = PR rejected

---

### Layer 5: AI Code Review

**What it does:**
- Optional tool for faster reviews
- AI flags architecture violations
- Senior reviews only flagged PRs

**File:**
- `.github/AI_REVIEW_PROMPT.md`

**Usage:**
1. Copy prompt from file
2. Paste PR changes
3. AI flags violations
4. Senior reviews flagged items only

---

## 🔧 Maintenance

### Adding New Folders

1. Update `.cursor/rules.md` (document new folder)
2. Update `.github/workflows/architecture-check.yml` (add to allowed list)
3. Update validation scripts if needed
4. Tell team about change

### Adding New Linting Rules

**Node.js:**
- Edit `templates/backend-node/.eslintrc.js`
- Add rules to `rules` section
- See: https://eslint.org/docs/rules/

**Python:**
- Edit `templates/backend-python/pyproject.toml`
- Add ruff rules to `[tool.ruff.lint]` section
- See: https://docs.astral.sh/ruff/rules/

### Updating Validation Scripts

**Node.js:**
- Edit `templates/backend-node/scripts/validate-env.js`
- Add new checks as needed

**Python:**
- Edit `templates/backend-python/scripts/validate_architecture.py`
- Add new validation functions

---

## 🚨 Troubleshooting

### CI Fails But Code Looks Fine

1. Check CI logs for specific error
2. Run validation locally: `npm run validate` or `python scripts/validate_architecture.py`
3. Fix violations
4. Push again

### Cursor Not Following Rules

1. Check `.cursor/config.json` exists
2. Check `.cursor/rules.md` exists
3. Restart Cursor IDE
4. Verify file is not corrupted

### False Positives in Validation

1. Check if it's a legitimate violation
2. If false positive, update validation script
3. Document why it's allowed

---

## 📊 Success Metrics

Track these to measure enforcement effectiveness:

- **CI Pass Rate**: % of PRs passing architecture checks
- **PR Rejection Rate**: % of PRs rejected for violations
- **Time to Fix**: Average time to fix violations
- **Violation Types**: Most common violations (focus training here)

---

## 🎓 Training

**For Junior Developers:**
1. Read `.cursor/rules.md`
2. Read `PROJECT_SETUP.md`
3. Use mandatory prompt header
4. Run validation locally before pushing

**For Senior Engineers:**
1. Use AI review prompt for faster reviews
2. Enforce PR checklist strictly
3. Update rules as architecture evolves
4. Train team on common violations

---

## 🔄 Continuous Improvement

The enforcement system should evolve with your needs:

1. **Monthly Review**: Check violation patterns
2. **Quarterly Update**: Update rules based on learnings
3. **Annual Audit**: Review entire system effectiveness

---

**Remember**: These rules exist to protect developers from rewriting code later. Compliance is self-defense, not control.
