import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';

import { AppError, ValidationError } from '#errors/app-error.js';

const isMalformedJsonError = (err: unknown): boolean => {
  return (
    err instanceof SyntaxError &&
    'type' in err &&
    err.type === 'entity.parse.failed'
  );
};

const toAppError = (err: unknown): AppError => {
  if (err instanceof AppError) {
    return err;
  }

  if (err instanceof ZodError) {
    return new ValidationError(
      err.issues[0]?.message ?? 'Invalid input',
      err.issues.map((issue) => ({
        field: issue.path.map(String).join('.'),
        message: issue.message,
      })),
    );
  }

  if (isMalformedJsonError(err)) {
    return new ValidationError('Must be valid JSON', [
      { field: 'body', message: 'Must be valid JSON' },
    ]);
  }

  return new AppError({ code: 'INTERNAL_ERROR' });
};

const errorHandler: ErrorRequestHandler = (err, _req, res, next) => {
  if (res.headersSent) {
    next(err);

    return;
  }

  const appError = toAppError(err);

  if (appError.statusCode >= 500) {
    console.error(err);
  }

  // Keep the existing client shape `{ error, code }` used by the SPA.
  res.status(appError.statusCode).json({
    error: appError.message,
    code: appError.code,
  });
};

export { errorHandler };
