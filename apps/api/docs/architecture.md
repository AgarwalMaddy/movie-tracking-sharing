# Architecture: what goes where

Read this when creating a module or file, or when unsure which layer some code belongs to.

## Layout

```
src/
├── app.ts               # middleware + route mounting
├── server.ts            # listen + collection seed
├── routes.ts            # mounts module routers under /api
├── config/              # env.ts, db.ts
├── constants/           # constants shared by 2+ modules
├── errors/              # AppError + subclasses, error codes, error types
├── integrations/        # third-party clients (tmdb.ts)
├── middlewares/         # shared Express middlewares
├── shared/utils/        # pure helpers used by 2+ modules
├── types/               # types shared by 2+ modules
└── modules/<resource>/
    ├── <entity>.routes.ts
    ├── <entity>.controller.ts
    ├── <entity>.service.ts
    ├── <entity>.repository.ts
    ├── <entity>.schema.ts      # zod inputs
    ├── <entity>.types.ts       # row type + public type
    └── <entity>.constants.ts
```

Naming: the folder is the plural resource (`lists/`, `titles/`); the file prefix is the singular noun (`list.controller.ts`). Where they are the same word (`auth/auth.service.ts`), use it for both.

Create a file only when it has content. A small module may skip `schema`, `types`, or `constants`. Never create empty placeholders or pass-through layers.

## Layers

Ask: "what would change if Express or Prisma were swapped out?" That code belongs in the layer that owns it.

| Layer      | Owns                                                               | Never contains             |
| ---------- | ------------------------------------------------------------------ | -------------------------- |
| routes     | method + path → controller, middleware                             | logic                      |
| controller | `req` parsing (zod), calling one service fn, status, cookies, JSON | business decisions, Prisma |
| service    | rules, orchestration, row → public mapping                         | `req`, `res`, Prisma       |
| repository | Prisma queries                                                     | rules, HTTP, tokens        |

A controller does four things: **parse input → call service → set status/cookies → send JSON**. An `if` about the domain in a controller belongs in the service.

## Types: where each lives

| Type   | What                             | Where                                           |
| ------ | -------------------------------- | ----------------------------------------------- |
| Row    | one table row                    | `<entity>.types.ts` or inferred from Prisma     |
| Public | what the API exposes; no secrets | `<entity>.types.ts` or `src/types/` if shared   |
| Input  | request shape                    | `z.infer` of the schema in `<entity>.schema.ts` |

Mapping row → public happens **once, in the service**. Controllers only ever see public types.

When a second module needs a type or constant, move it to `src/types/` or `src/constants/`. Not before.

## Adding a new endpoint

1. Write the contract: method, path, input, success output, failure cases.
2. If it needs new tables or columns: change `prisma/schema.prisma` first (ask).
3. Schema for the input.
4. Repository function(s).
5. Service function with the rules.
6. Controller + route, mount in `src/routes.ts`.
7. Call it (curl / browser) before moving on.

## `app.ts` order

`cors`, `express.json()`, `cookieParser()`, then `optionalAuth`. Health at `GET /health`. API routers under `/api`. After all routes: 404 (`NotFoundError`), then `errorHandler` last.

Bind the HTTP server to `0.0.0.0:$PORT` in `server.ts`.
