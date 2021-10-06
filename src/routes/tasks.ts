import { StatusCodes } from 'http-status-codes';
import Router from "koa-router";
import { getManager } from 'typeorm';

import { Task } from '@/entities/task';

const router = new Router({prefix: '/tasks'});

router.post("/", async (context) => {
  const taskRepository = getManager().getRepository(Task)
  const task = taskRepository.create(context.request.body)

  context.status = StatusCodes.CREATED;
  context.body = await taskRepository.save(task);
});

router.get("/", async (context) => {
  const taskRepository = getManager().getRepository(Task)
  const tasks = await taskRepository.find()

  context.body = tasks;
});

router.get("/:id", async (context) => {
  const { id } = context.params
  const taskRepository = getManager().getRepository(Task)
  const task = await taskRepository.findOne(id)

  if (!task) {
    context.throw(StatusCodes.NOT_FOUND, `Not found any todo with id: ${id}`);
    return
  }

  context.body = task;
});

router.put("/:id", async (context) => {
  const { id } = context.params
  const taskRepository = getManager().getRepository(Task)
  const task = await taskRepository.findOne(id)

  if (!task) {
    context.throw(StatusCodes.NOT_FOUND, `Not found any todo with id: ${id}`);
    return
  }

  taskRepository.merge(task, context.request.body)

  context.body = await taskRepository.save(task);
});

router.del('/:id', async (context) => {
  const { id } = context.params;
  const taskRepository = getManager().getRepository(Task);
  const task = await taskRepository.findOne(id);

  if (!task) {
    context.throw(StatusCodes.NOT_FOUND, `Not found any todo with id: ${id}`);
    return
  }

  await taskRepository.remove(task)

  context.body = null
});

export default router;
