# Component and code conventions

Read this when writing a new component, hook, or utility.

## Components

- Function components. Page files are kebab-case (`title.tsx`) and export a named function (`TitlePage`). Feature components use a name that matches the export.
- Accessibility: every icon-only button has `aria-label`. Use semantic elements and real labels. `jsx-a11y` is enforced.
- Keep using existing CSS classes in `src/styles.css`. Do not add Tailwind or MUI. Do not add a new CSS file for one-off layout unless the existing sheet cannot cover it.
- Inline `style` is allowed only where the current screens already use it; prefer a class when you touch that markup.

## Imports

- Use the `@/` alias for anything outside the current feature or folder. Use relative imports within the same feature.
- Type-only imports use `import { type X }` (enforced).
- Order (enforced): builtin → external → `@/` internal → relative, blank line between groups, alphabetical within.

## TypeScript and lint limits

- No `any`. No non-null `!` assertions (use a guard). No `console.log` (only `warn`/`error`).
- Complexity 15, depth 4, max 4 function params. Nested ternaries warn.

## Formatting

Prettier is the source of truth. Run `npx prettier --write <files>` on files you touch.

## Environment variables

The SPA talks to `/api` through the Vite proxy. It does not read `VITE_*` secrets. If you add a public env var, it must start with `VITE_`, be typed in `src/vite-env.d.ts`, and listed in `.env.example`. Never commit real keys.

## Data fetching

Use `api()` / `peek()` / `prefetch()` from `@/lib/api`. Don't add a second fetch wrapper. Session token lives in `localStorage` (`mts_token`) and is also sent as the `mts_session` cookie when the proxy allows it.
