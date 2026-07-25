import winston from 'winston';
import { env } from '../config/env.js';

const logger = winston.createLogger({
  level: env.logLevel,
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      format: winston.format.cli(),
    }),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
  ],
});

export default logger;
