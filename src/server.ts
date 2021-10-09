import 'reflect-metadata';

import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import logger from 'koa-logger';
import { createConnection } from 'typeorm';

import env from '@/config/environment';
import errorHandler from '@/middleware/error';
import appRoutes from '@/routes';

const server = new Koa({ env: env.NODE_ENV });

server.use(errorHandler);
server.use(bodyParser());

/* istanbul ignore if  */
if (!env.isTest) server.use(logger());

server.use(appRoutes.middleware());

/* istanbul ignore if  */
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
