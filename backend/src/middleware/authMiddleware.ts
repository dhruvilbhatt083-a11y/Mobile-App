import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { env } from '../config/env';
import { HttpError } from './errorHandler';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

export const authMiddleware = (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw new HttpError('Unauthorized', 401);
  }

  const token = authHeader.slice(7);

  try {
    const payload = jwt.verify(token, env.jwt.accessSecret) as { id: string; role: string };
    req.user = payload;
    next();
  } catch (error) {
    throw new HttpError('Invalid or expired token', 401);
  }
};
