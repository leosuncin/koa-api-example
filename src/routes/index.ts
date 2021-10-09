import router from 'koa-joi-router';
import { SwaggerAPI } from 'koa-joi-router-docs';

import loadRootRoutes from '@/routes/root';
import loadTaskRoutes from '@/routes/tasks';

const appRouter = router();

loadRootRoutes(appRouter);
loadTaskRoutes(appRouter);

const generator = new SwaggerAPI();

generator.addJoiRouter(appRouter);

const spec = generator.generateSpec({
  info: {
    title: 'Example API',
    description: 'API for creating and editing examples.',
    version: '1.1',
  },
  basePath: '/',
  tags: [
    {
      name: 'tasks',
      description:
        'A task represents a job, duty, chore, responsibility, etc. that you need to do and keep a track of all of them',
    },
  ],
});

/**
 * Swagger JSON API
 */
appRouter.get('/api.json', async (context) => {
  context.body = JSON.stringify(spec, null, 2);
});

/**
 * API documentation
 */
appRouter.get('/docs', async (context) => {
  context.type = 'html';
  context.body = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Example API</title>
  </head>
  <body>
    <redoc spec-url='/api.json' lazy-rendering></redoc>
    <script src="https://cdn.jsdelivr.net/npm/redoc@next/bundles/redoc.standalone.js"></script>
  </body>
</html>`;
});

export default appRouter;
