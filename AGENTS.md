# Repository Guidelines

## Project Structure & Module Organization
- App code in `src/` with key areas:
  - `src/pages/` (route views, e.g., `Dashboard.tsx`), `src/components/` (UI), `src/lib/` (utils, Supabase, DB access), `src/hooks/`, `src/contexts/`, `src/data/`, `src/types/`.
- Static assets in `public/`; build output in `dist/`.
- Import alias: `@` → `src` (see `vite.config.ts`). Example: `import Button from '@/components/ui/button'`.
 - Data schema: see `database_creation.sql`; the database is deployed in Supabase Cloud.

## Build, Test, and Development Commands
- `npm run dev` — Start Vite dev server on `http://localhost:8080`.
- `npm run build` — Production build to `dist/`.
- `npm run build:dev` — Development-mode build (useful for debugging bundles).
- `npm run preview` — Serve the built app locally.
- `npm run lint` — Run ESLint over the codebase.

## Coding Style & Naming Conventions
- Language: TypeScript + React (functional components).
- Indentation: 2 spaces; include semicolons; prefer single quotes.
- File naming: `PascalCase.tsx` for components/pages, `camelCase.ts` for utilities/hooks (hooks start with `use...`).
- Styling: Tailwind CSS; prefer utility classes and co-locate minimal component styles.
- Linting: ESLint (see `eslint.config.js`); fix warnings before commit.
- Simplicity: Prefer simple code over over-engineered and solutions.

## Testing Guidelines
- No formal test runner configured yet. For changes with business logic, include small, testable helpers in `src/lib/` and keep components thin.
- If introducing tests, prefer Vitest + React Testing Library; name files `*.test.ts(x)` adjacent to sources.
- Perform manual verification via `npm run dev` for routing, forms, and Supabase flows.

## Commit & Pull Request Guidelines
- Commit style: Prefer Conventional Commits (e.g., `feat: ...`, `fix: ...`). Keep subjects imperative and ≤72 chars.
- PRs include: summary, linked issues, screenshots/GIFs for UI changes, and notes on DB or env changes.
- If schema or seed data changes, update SQL files (e.g., `database_creation.sql`, `migrate_*.sql`) and describe migration steps.

## Security & Configuration Tips
- Environment: define `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`. For local admin/dev, `VITE_USE_SERVICE_ROLE=true` with `VITE_SUPABASE_SERVICE_ROLE_KEY`.
- Never use service-role keys in production builds. Store real secrets outside VCS.

## Agent-Specific Tips
- Respect the `@` import alias and existing directory structure.
- Avoid broad refactors; keep changes scoped and incremental.
- When adding modules, prefer `src/lib/` for logic and keep components presentational.
