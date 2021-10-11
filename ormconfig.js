// eslint-disable-next-line @typescript-eslint/no-var-requires
const { cleanEnv } = require('envalid');

const isProduction = process.argv[1].includes('dist/');
const env = cleanEnv(process.env, {});
/**
 * @type {import('typeorm').ConnectionOptions}
 */
const options = {
  type: 'sqlite',
  database: env.isTest ? ':memory:' : 'database.sqlite',
  synchronize: true,
  logging: false,
  entities: isProduction ? ['dist/entities/**/*.js'] : ['src/entities/**/*.ts'],
  migrations: isProduction
    ? ['dist/migrations/**/*.js']
    : ['src/migrations/**/*.ts'],
  subscribers: isProduction
    ? ['dist/subscribers/**/*.js']
    : ['src/subscribers/**/*.ts'],
  cli: {
    entitiesDir: 'src/entities',
    migrationsDir: 'src/migrations',
    subscribersDir: 'src/subscribers',
  },
};

module.exports = options;
