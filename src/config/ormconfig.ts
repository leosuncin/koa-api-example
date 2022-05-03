import { DataSource, DataSourceOptions } from 'typeorm';

import env from '@/config/environment';
import { Task } from '@/entities/task';
import { User } from '@/entities/user';

const options: DataSourceOptions = {
  type: 'sqlite',
  database: env.isTest ? ':memory:' : 'database.sqlite',
  synchronize: true,
  entities: [Task, User],
};

export const dataSource = new DataSource(options);
