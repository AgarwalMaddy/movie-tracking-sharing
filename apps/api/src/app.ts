import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';

import { env } from '#config/env.js';
import { NotFoundError } from '#errors/app-error.js';
import { optionalAuth } from '#middlewares/auth.js';
import { errorHandler } from '#middlewares/error-handler.js';

import router from './routes.js';

const app = express();

app.use(cors({ origin: env.WEB_ORIGIN, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(optionalAuth);
app.get('/health', (_req, res) => {
  res.json({ ok: true });
});
app.use('/api', router);
app.use((_req, _res, next) => {
  next(new NotFoundError());
});
app.use(errorHandler);

export default app;
