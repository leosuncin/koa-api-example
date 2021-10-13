import router from 'koa-joi-router';

const root = router();

root.get('/', (context) => {
  context.body = 'Hello world';
});

export default root;
