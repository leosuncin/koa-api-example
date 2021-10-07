/* eslint-disable eslint-comments/disable-enable-pair, @typescript-eslint/no-var-requires */
const { cleanEnv, str } = require('envalid');

const env = cleanEnv(process.env, {
  DATABASE_USERNAME: str(),
  DATABASE_PASSWORD: str(),
  DATABASE_URL: str({
    example: 'localhost:1521/XEPDB1',
    devDefault: 'localhost:51521/XEPDB1',
  }),
});

/**
 * @type {import('typeorm').ConnectionOptions}
 */
const options = {
  ...(env.isTest
    ? {
        type: 'sqlite',
        database: ':memory:',
        synchronize: true,
      }
    : {
        type: 'oracle',
        username: env.DATABASE_USERNAME,
        password: env.DATABASE_PASSWORD,
        connectString: env.DATABASE_URL,
        synchronize: false,
      }),
  logging: false,
  entities: env.isProduction ? ['dist/entities/*.js'] : ['src/entities/*.ts'],
  migrations: env.isProduction
    ? ['dist/migrations/*.js']
    : ['src/migrations/*.ts'],
  cli: {
    entitiesDir: 'src/entities',
    migrationsDir: 'src/migrations',
    subscribersDir: 'src/subscribers',
  },
};

module.exports = options;
