# AGENTS.md — Web

Stack: React 19 · TypeScript · Vite · React Router. Styling is the existing `src/styles.css` (no Tailwind, no MUI).

Commands (from `apps/web/`): `npm run dev` · `npm run lint` · `npm run lint:fix` · `npm run typecheck` · `npm run build`

## Always follow

1. **Imports:** `@/` alias for anything outside the current feature or folder. Relative imports within a feature. Type-only imports with `import { type X }`.
2. **Dependency direction:** `app → pages → features → components → lib`. Never import upward. Domain-aware code goes in `features/<name>/`, not `components/`.
3. **No** `any`, non-null `!`, or `console.log`. Prettier owns formatting. `jsx-a11y` is enforced.
4. **API errors** from `api()` are `ApiError` with `{ error, code }` from the server. Don't invent a second error shape.
5. **Secrets stay on the API.** The SPA has no TMDB key and no database URL.
6. **Before finishing:** `npm run lint` and `npm run typecheck` must pass. If you changed UI, verify the flow in the browser (click, type, submit, navigate). A screenshot is not verification.

## Read the matching doc before starting

| When you are…                                            | Read                                       |
| -------------------------------------------------------- | ------------------------------------------ |
| Creating or moving files, or adding cross-folder imports | [docs/structure.md](docs/structure.md)     |
| Writing a new component, hook, util, or env variable     | [docs/conventions.md](docs/conventions.md) |
