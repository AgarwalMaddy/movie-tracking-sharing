import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import { env } from '#config/env.js';
import { NotFoundError } from '#errors/app-error.js';
import { optionalAuth } from '#middlewares/auth.js';
import { errorHandler } from '#middlewares/error-handler.js';
import { apiLimiter } from '#middlewares/rate-limit.js';

import router from './routes.js';

const app = express();
const here = path.dirname(fileURLToPath(import.meta.url));
const webDist = path.resolve(here, '../../web/dist');
const indexHtml = path.join(webDist, 'index.html');

app.set('trust proxy', 1);
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
);
app.use(cors({ origin: env.WEB_ORIGIN, credentials: true }));
app.use(express.json({ limit: '32kb' }));
app.use(cookieParser());
app.use(optionalAuth);
app.get('/health', (_req, res) => {
  res.json({ ok: true });
});
app.use('/api', apiLimiter, router);

if (existsSync(indexHtml)) {
  app.use(express.static(webDist));
  app.get(/^(?!\/api)(?!\/health).*/, (req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      next();

      return;
    }

    res.sendFile(indexHtml);
  });
}

app.use((_req, _res, next) => {
  next(new NotFoundError());
});
app.use(errorHandler);

export default app;
