import { Router } from 'koa-joi-router';

export default (router: Router): void => {
  router.get('/', async (context) => {
    context.body = 'Hello world';
  });
};
