import express from 'express';
import helmet from 'helmet';
import cors from 'cors';

import { authRouter } from './modules/auth/auth.routes';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';

export const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/auth', authRouter);

app.use(errorHandler);

app.on('mount', () => {
  logger.info('Application mounted');
});
