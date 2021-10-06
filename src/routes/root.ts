import Router from "koa-router";

const router = new Router();

router.get("/", async (context) => {
  context.body = "Hello world";
});

export default router;
