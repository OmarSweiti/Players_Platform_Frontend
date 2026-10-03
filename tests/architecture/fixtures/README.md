# Boundary fixtures

`src/architecture/boundaries.test.ts` runs the real rules of `.dependency-cruiser.cjs`, and the browser
boundary of `scripts/client-boundary.mjs`, over this tree. Each file marked "Breaks" breaks exactly one
rule, once. Every other import here is allowed and must stay unflagged. The tree is never part of the
application: the boundary check cruises `app/` and `src/` only, and type-checking, linting and the
build leave this directory out. It imports `server-only`, which the application installs only in 0.9.4.
