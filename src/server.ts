import gracefulShutdown from 'http-graceful-shutdown';
import { createServer, Server } from 'node:http';
import { createConnection } from 'typeorm';

import app from '@/app';
import env from '@/config/environment';

const server = createServer(app.callback());

void (async (server: Server) => {
  try {
    const connection = await createConnection();

    server.listen(env.PORT, () => {
      console.info(`Listening at http://localhost:${env.PORT}`);
      console.log('Press Ctrl-C to shutdown');
    });

    gracefulShutdown(server, {
      development: env.isDevelopment,
      onShutdown: async () => {
        await connection.close();
      },
      finally: () => {
        console.info('Server graceful shut down completed.');
      },
    });
  } catch (error) {
    console.error('Unable to run the server because of the following error:');
    console.error(error);
    process.exitCode = 1;
  }
})(server);

export default server;
