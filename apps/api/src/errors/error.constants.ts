export const ERROR_CODES = {
  NOT_FOUND: {
    statusCode: 404,
    message: 'Not found',
  },
  VALIDATION: {
    statusCode: 400,
    message: 'Invalid input',
  },
  INTERNAL_ERROR: {
    statusCode: 500,
    message: 'Server error',
  },
  AUTH_REQUIRED: {
    statusCode: 401,
    message: 'Sign in required',
  },
  INVALID_CREDENTIALS: {
    statusCode: 401,
    message: 'Invalid email or password',
  },
  UNVERIFIED: {
    statusCode: 403,
    message: 'Verify your email first',
  },
  USERNAME_REQUIRED: {
    statusCode: 403,
    message: 'Choose a username',
  },
  NOT_FRIENDS: {
    statusCode: 403,
    message: 'Friends only',
  },
  EMAIL_TAKEN: {
    statusCode: 409,
    message: 'Email already registered',
  },
  USERNAME_TAKEN: {
    statusCode: 409,
    message: 'Username taken',
  },
  USERNAME_RESERVED: {
    statusCode: 400,
    message: 'That username is reserved',
  },
  INVALID_TOKEN: {
    statusCode: 400,
    message: 'Invalid link',
  },
  EXPIRED_TOKEN: {
    statusCode: 400,
    message: 'Link expired',
  },
  TMDB: {
    statusCode: 502,
    message: 'TMDB error',
  },
} as const;

export type ErrorCode = keyof typeof ERROR_CODES;
