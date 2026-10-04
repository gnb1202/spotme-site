# SPOT ME website scope

- This session/project scope is `D:/Github/spotme-site`, not `D:/Github/SpotMe` (the application repository).
- The active Next.js website is at the repository root (`app/`, `src/`, `public/`), migrated with user approval on 2026-10-05. Old implementations can be restored from commit `c8a4637`. Frozen design data lives in `design-reference/`, reports in `reports/`, and historical tools in `scripts/archive/v3/` (not executable in the current layout). Previous environment settings are retained in ignored `local-archive/`. Do not modify `.vercel/` or environment files during local preview work.
- The authoritative delivered artwork is `design-reference/assets/delivery-260925/` in this repository. Use these files for matching Figma artwork; record exact source paths and hashes. Never invent assets or silently substitute an unrelated image with a similar name.
- Keep the current frozen Figma data and source-defined geometry/text/navigation. No added visible elements or effects.
- Missing delivery assets (for example a device shell or Figma-composed artwork) must be explicitly documented before using a same-version Figma asset fallback.
- No deployment, Git push, destructive cleanup or edits to the application repository unless separately requested.
