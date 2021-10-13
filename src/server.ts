import { createServer } from 'node:http';
import { createConnection } from 'typeorm';

import app from '@/app';
import env from '@/config/environment';

const server = createServer(app.callback());

createConnection()
  .then(() =>
    server.listen(env.PORT, () => {
      console.info(`Listening at http://localhost:${env.PORT}`);
    }),
  )
  .catch((error) =>
    setImmediate(() => {
      console.error('Unable to run the server because of the following error:');
      console.error(error);
      process.exitCode = 1;
    }),
  );
