import { env } from './src/config/env.js';
import app from './src/app.js';
import { sequelize } from './src/config/database.js';
import { connectRedis, disconnectRedis } from './src/config/redis.js';
import logger from './src/utils/logger.js';

async function start() {
  try {
    await sequelize.authenticate();
    logger.info('Database connected successfully');

    await connectRedis();

    app.listen(env.port, () => {
      logger.info(`Server running on port ${env.port} in ${env.nodeEnv} mode`);
    });
  } catch (err) {
    logger.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();

process.on('SIGTERM', async () => {
  await disconnectRedis();
  process.exit(0);
});

process.on('SIGINT', async () => {
  await disconnectRedis();
  process.exit(0);
});
