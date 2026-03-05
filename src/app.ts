import express from 'express';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import YAML from 'yaml';
import { requestLogger } from './middleware/logger';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth.routes';
import bookRoutes from './routes/books.routes';
import authorRoutes from './routes/authors.routes';
import userRoutes from './routes/users.routes';

const swaggerDocument = YAML.parse(
  fs.readFileSync(path.join(__dirname, '../docs/openapi.yaml'), 'utf8')
);

const app = express();

app.use(express.json());
app.use(requestLogger);

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/auth', authRoutes);
app.use('/books', bookRoutes);
app.use('/authors', authorRoutes);
app.use('/users', userRoutes);

app.use(errorHandler);

export default app;
