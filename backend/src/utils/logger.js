import winston from 'winston';
import WinstonCloudWatch from 'winston-cloudwatch';
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

if (env.nodeEnv === 'production' && env.aws.accessKeyId && env.aws.secretAccessKey) {
  logger.add(new WinstonCloudWatch({
    logGroupName: 'hospital-backend',
    logStreamName: `api-${new Date().toISOString().split('T')[0]}`,
    awsRegion: env.aws.region,
    awsAccessKeyId: env.aws.accessKeyId,
    awsSecretKey: env.aws.secretAccessKey,
    messageFormatter: ({ level, message, ...meta }) => `${level}: ${message} ${JSON.stringify(meta)}`,
  }));
}

export default logger;
