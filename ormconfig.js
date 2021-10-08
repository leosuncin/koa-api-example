const isProduction = process.argv[1].includes('dist/');
/**
 * @type {import('typeorm').ConnectionOptions}
 */
const options = {
  type: 'sqlite',
  database: 'database.sqlite',
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
