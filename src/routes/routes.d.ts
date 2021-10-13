import { Config, Handler } from 'koa-joi-router';

import { User } from '@/entities/user';
import { JwtPayload } from '@/middleware/auth';

declare module 'koa' {
  interface Context {
    params: {
      id: number;
      [parameter: string]: string | number;
    };
  }
  interface Context {
    state: {
      user: JwtPayload & { sub: User['id'] };
    };
    route: {
      path: string;
      method: string[];
      handler: Handler | Handler[];
      validate: Config['validate'];
    };
  }
}
