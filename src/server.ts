import 'reflect-metadata';

import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import logger from 'koa-logger';
import { createConnection } from 'typeorm';

import env from '@/config/environment';
import errorHandler from '@/middleware/error';
import rootRoutes from '@/routes/root';
import taskRoutes from '@/routes/tasks';

const server = new Koa({ env: env.NODE_ENV });

server.use(errorHandler);
server.use(bodyParser());

if (!env.isTest) server.use(logger());

/*
 * Routes
 */
server.use(rootRoutes.routes()).use(rootRoutes.allowedMethods());
server.use(taskRoutes.routes()).use(taskRoutes.allowedMethods());

if (require.main === module) {
  createConnection()
    .then(() =>
      server.listen(env.PORT, () => {
        console.info(`Listening at http://localhost:${env.PORT}`);
      }),
    )
    .catch((error) =>
      setImmediate(() => {
        console.error(
          'Unable to run the server because of the following error:',
        );
        console.error(error);
        process.exitCode = 1;
      }),
    );
}

export default server;
