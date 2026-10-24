# Conventions

Read this when writing controller/service code, naming things, or using zod.

## Naming

- Files: `<entity>.<layer>.ts` (`auth.service.ts`). Constants: `<entity>.constants.ts`.
- Controller handlers are named for the action (`signup`, `show`). Services/repositories are named for the operation (`createList`, `findUserByEmail`).
- Zod schemas: `camelCase` + `Schema` suffix (`loginSchema`); inferred types are PascalCase (`LoginInput`).
- Constants: `UPPER_SNAKE_CASE` (`SESSION_COOKIE_NAME`).

## Controller shape

```ts
const handler: RequestHandler = async (req, res, next) => {
  try {
    const input = someSchema.parse(req.body);
    const result = await someService.doThing(input);

    res.json({ thing: result });
  } catch (error) {
    next(error);
  }
};
```

Real example: `src/modules/auth/auth.controller.ts`.

- Never `return res.json(...)`; send, then `return;` only where an early exit is needed.
- Don't send twice.

## Validation

- Use `parse` where invalid input should fail the request. `ZodError` reaches `errorHandler` and becomes `{ error, code: "VALIDATION" }` with status 400.
- Use `safeParse` on login (and other security-sensitive bodies) and throw `ValidationError` / `INVALID_CREDENTIALS` without Zod issue details.
- Zod v4: top-level formats (`z.email()`), not `z.string().email()`.
- Express 5 params can be `string | string[]`. Use `paramString` / `queryString` from `#middlewares/auth.js`.

## Error handling

Errors live in `src/errors/`. `src/middlewares/error-handler.ts` turns them into `{ error, code }` JSON. That shape is the SPA contract; do not nest `error` as an object.

- **Throw, don't respond.** Throw an `AppError` subclass. Don't hand-build error JSON in new controller code.
- **Add a new error** as a code in `error.constants.ts` (status and default message live there).
- **Security-sensitive endpoints** (login): don't let a `ZodError` through.

### Two kinds of error

|             | Operational                            | Invariant (a bug)                           |
| ----------- | -------------------------------------- | ------------------------------------------- |
| Meaning     | Expected failure the client can act on | A condition the code assumes is always true |
| Throw       | `AppError` subclass with a code        | Plain `Error` with a descriptive message    |
| Client sees | That code and message                  | Generic `INTERNAL_ERROR`                    |
| Server log  | Not logged (unless 5xx)                | Logged by `errorHandler`                    |

If a user can trigger it through normal use, it is operational. Never throw an `AppError` for an invariant: its message is sent to the client.

- **Repository:** a lookup that finds nothing returns `null`/`undefined`. No business rules.
- **Service:** decides what a missing row means and throws the `AppError`. Never touches `req`/`res`.
- **Controller:** `try/catch → next(error)`.
- **`errorHandler`:** the only place that builds error responses and logs 5xx.

## Prisma

- All database access goes through a repository. Services import repositories, not `db`.
- Do not return `passwordHash` or session tokens except the login/signup payload the SPA already stores.
- `npx prisma generate` / `db push` from the repo root.
