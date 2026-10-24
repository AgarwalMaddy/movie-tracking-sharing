# AGENTS.md — API

Stack: Node · Express 5 · TypeScript (strict, `nodenext`) · Prisma · PostgreSQL (Neon) · Zod v4 · cookie sessions.

Commands (from `apps/api/`): `npm run dev` · `npm run typecheck` · `npm run lint` · `npm run lint:fix` · `npm run format`

Prisma schema lives at the repo root (`prisma/schema.prisma`). Generate from the repo root: `npx prisma generate`.

## Always follow

1. **Layers:** `routes → controller → service → repository`. HTTP stays in controllers, business rules in services, Prisma in repositories. Services never touch `req`/`res`.
2. **Validate every external input with zod** (body, params, query) before using it. No `any` on `req.*`.
3. **Never expose secrets or raw DB rows** in responses or logs. Map rows to public types in the service (`toPublicUser`, `publicTitle`).
4. **Prisma only.** Do not add raw SQL. Schema changes go through `prisma/schema.prisma` and `npx prisma db push` (or a migration if we start using them). Ask before changing the schema.
5. **Constants:** name any literal that is reused or whose meaning isn't obvious. Module-specific in `<module>.constants.ts`, shared in `src/constants/`.
6. **Imports:** `#alias/…` for cross-folder, relative within a module, always with the `.js` extension. Aliases live in `package.json` `imports` (`source` → `src/` for dev and typecheck, `default` → `dist/` if we ever emit). A new alias needs both entries.
7. **Env vars** go through `src/config/env.ts` only; never read `process.env` elsewhere.
8. **Errors:** throw `AppError` subclasses from `#errors/app-error.js` for expected failures; a plain `Error` for "can't happen" invariants. The central `errorHandler` builds `{ error, code }`. Never hand-build error JSON in new controller code.
9. **Where these docs are silent, follow the surrounding module.** Reference implementation: `src/modules/auth/`. Stop and ask before adding a dependency, changing the schema, or changing the `{ error, code }` client contract.
10. **Keep guidance current.** If your change makes this file or a doc wrong, update it in the same change.

**Before finishing:** run `npm run lint:fix`, then `npm run typecheck` and `npm run lint` from `apps/api/` (or the matching root scripts). `eslint.config.js` and `tsconfig.json` are the source of truth. Fix violations; don't work around them with `any`, `!`, or lint-disable comments.

## Read the matching doc before starting

| When you are…                                                       | Read                                         |
| ------------------------------------------------------------------- | -------------------------------------------- |
| Creating a module/file, deciding what goes where, or defining types | [docs/architecture.md](docs/architecture.md) |
| Writing controller/service code, naming, zod, errors                | [docs/conventions.md](docs/conventions.md)   |
