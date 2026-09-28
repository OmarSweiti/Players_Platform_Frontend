<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Frontend — Sodara Players Platform

The Next.js web app. **The plan lives in the umbrella repository**, not here:

- inside `Players_Platform/frontend/`: read `../AGENTS.md`, then the frontier in
  `../docs/implementation/README.md`;
- in a standalone clone: clone https://github.com/OmarSweiti/Players_Platform with
  `--recurse-submodules` and work from its root.

Before editing, read `../.claude/rules/frontend.md` and `../.claude/rules/security.md`. Arabic and
English ship together; every string comes from the catalogs; logical CSS only; the API is called only
through the generated client on the same origin. Gate: `just check`. Titles carry the microstep ID; no
assistant attribution.
