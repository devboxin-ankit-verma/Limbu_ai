# AI Code Review Prompt

Copy and paste this into Cursor AI or ChatGPT for PR reviews:

---

Review this PR ONLY for architecture violations.

Rules source: .cursor/rules.md

Focus ONLY on:
- Folder misuse (new folders created?)
- Layering violations (Controllers → Services → Repositories → Models)
- Environment variable misuse (direct process.env/os.getenv)
- Constants misuse (hardcoded values)
- Frontend separation violations (Routes → Pages → Components → Hooks → Services)

Ignore:
- Business logic correctness
- UI/UX quality
- Performance optimizations
- Test coverage (unless architecture-related)

Output format:
- List each violation with file path and line number
- Suggest specific fix based on .cursor/rules.md
- Mark as ✅ if no violations found

---

**Usage:** 
1. Copy PR diff or file changes
2. Paste this prompt
3. Paste the code changes
4. AI will flag architecture violations
