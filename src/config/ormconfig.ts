import { DataSource, DataSourceOptions } from 'typeorm';

import env from '@/config/environment';
import { Task } from '@/entities/task.entity';
import { User } from '@/entities/user.entity';

const options: DataSourceOptions = {
  type: 'better-sqlite3',
  database: env.isTest ? ':memory:' : 'database.sqlite',
  synchronize: true,
  entities: [Task, User],
};

export const dataSource = new DataSource(options);
