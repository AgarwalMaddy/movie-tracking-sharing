import { ERROR_CODES, type ErrorCode } from './error.constants.js';
import type { AppErrorOptions, ValidationIssue } from './error.types.js';

class AppError extends Error {
  readonly code: ErrorCode;
  readonly statusCode: number;
  readonly details?: readonly ValidationIssue[] | undefined;

  constructor({ code, message, details }: AppErrorOptions) {
    super(message ?? ERROR_CODES[code].message);

    this.name = new.target.name;
    this.code = code;
    this.statusCode = ERROR_CODES[code].statusCode;
    this.details = details;
  }
}

class NotFoundError extends AppError {
  constructor(message?: string) {
    super({ code: 'NOT_FOUND', message });
  }
}

class ValidationError extends AppError {
  constructor(message?: string, details?: ValidationIssue[]) {
    super({ code: 'VALIDATION', message, details });
  }
}

class UnauthorizedError extends AppError {
  constructor(message?: string) {
    super({ code: 'AUTH_REQUIRED', message });
  }
}

export { AppError, NotFoundError, UnauthorizedError, ValidationError };
