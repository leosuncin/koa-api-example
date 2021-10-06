import Koa from "koa";
import bodyParser from "koa-bodyparser";
import logger from "koa-logger";

import env from "@/config/environment";
import rootRoutes from "@/routes/root";

const server = new Koa({ env: env.NODE_ENV });

server.use(bodyParser());
server.use(logger());

/*
 * Routes
 */
server.use(rootRoutes.routes()).use(rootRoutes.allowedMethods());

if (require.main === module) {
  server.listen(env.PORT, () => {
    console.info(`Listening at http://localhost:${env.PORT}`);
  });
}

export default server;
