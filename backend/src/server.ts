import { app } from './app';
import { env } from './config/env';
import { logger } from './utils/logger';

const start = () => {
  const server = app.listen(env.port, () => {
    logger.info(`Server listening on port ${env.port}`);
  });

  const shutdown = () => {
    logger.info('Shutting down server...');
    server.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
};

start();
