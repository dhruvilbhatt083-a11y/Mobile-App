import { NextFunction, Request, Response } from 'express';

import { logger } from '../utils/logger';

export class HttpError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.status = status;
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
  const status = err instanceof HttpError ? err.status : 500;
  const message = err.message || 'Internal server error';

  if (status >= 500) {
    logger.error(err, 'Unhandled error');
  }

  res.status(status).json({ error: message });
};
