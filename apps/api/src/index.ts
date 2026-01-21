import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { swagger } from '@elysiajs/swagger';
import { registryRoutes } from './routes/registry';
import { uploadRoutes } from './routes/upload';
import { previewRoutes } from './routes/preview';

const app = new Elysia()
  .use(cors())
  .use(swagger({
    documentation: {
      info: {
        title: 'ShadcnForge API',
        version: '0.1.0',
        description: 'Transform TSX/MD code into CLI-installable shadcn components',
      },
    },
  }))
  .get('/', () => ({
    message: 'ShadcnForge API',
    version: '0.1.0',
    docs: '/swagger',
  }))
  .get('/health', () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
  }))
  .use(registryRoutes)
  .use(uploadRoutes)
  .use(previewRoutes)
  .listen(3001);

console.log(`🦊 ElysiaJS running at http://localhost:${app.server?.port}`);
console.log(`📚 API Documentation: http://localhost:${app.server?.port}/swagger`);
