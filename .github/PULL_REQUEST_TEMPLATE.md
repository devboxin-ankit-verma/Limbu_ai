## Architecture Checklist (MANDATORY)

- [ ] `.cursor/rules.md` is present in project root
- [ ] `.cursor/config.json` is present in project root
- [ ] No new folders added (verify with git diff)
- [ ] All constants moved to `/constants` directory
- [ ] Environment variables accessed only via config layer
- [ ] Controllers/Routes contain no business logic
- [ ] Services contain no database queries
- [ ] Repositories contain no business logic
- [ ] Frontend separation respected (Routes → Pages → Components → Hooks → Services)
- [ ] No hardcoded status codes (use constants)
- [ ] No hardcoded error messages (use constants)
- [ ] Cursor rules followed (verify with AI review)

## Prompt Header Used

```
[Paste the prompt header you used with Cursor AI]

Example:
Follow all rules defined in .cursor/rules.md.

Context:
- Stack: Node
- Feature: User authentication
- Files expected to change:
  - src/routes/v1/authRoutes.ts
  - src/controllers/authController.ts
  - src/services/authService.ts
```

## CI Status

- [ ] All CI checks passing
- [ ] Linting passed
- [ ] Architecture validation passed

---

**❌ PRs failing any checkbox will be rejected without discussion.**
This is a contract, not an opinion.
