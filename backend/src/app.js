import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUI from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';
import { env } from './config/env.js';
import { errorHandler } from './middlewares/errorHandler.js';
import routes from './routes/index.js';

const app = express();

const corsOrigins = env.nodeEnv === 'production'
  ? ['https://hms-nu-vert.vercel.app', 'https://www.hms-nu-vert.vercel.app']
  : '*';

app.use(helmet());
app.use(cors({ origin: corsOrigins }));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));
app.use('/api/v1', routes);

app.use(errorHandler);

export default app;
