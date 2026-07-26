import { sequelize } from '../src/config/database.js';
import { connectRedis, disconnectRedis } from '../src/config/redis.js';

beforeAll(async () => {
  await sequelize.sync({ force: true });
  await connectRedis();
});

afterAll(async () => {
  await sequelize.close();
  await disconnectRedis();
});
