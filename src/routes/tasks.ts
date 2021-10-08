import { StatusCodes } from 'http-status-codes';
import router from 'koa-joi-router';
import { getManager } from 'typeorm';

import { Task } from '@/entities/task';
import * as schemas from '@/schemas/task';

const tasksRouter = router();
tasksRouter.prefix('/tasks');

tasksRouter.post(
  '/',
  {
    validate: {
      type: 'json',
      body: schemas.createTask,
      output: {
        201: {
          body: schemas.task,
        },
      },
      validateOptions: {
        abortEarly: false,
        stripUnknown: true,
      },
    },
  },
  async (context) => {
    const taskRepository = getManager().getRepository(Task);
    const task = taskRepository.create(context.request.body);

    context.status = StatusCodes.CREATED;
    context.body = await taskRepository.save(task);
  },
);

tasksRouter.get(
  '/',
  {
    validate: {
      output: {
        200: {
          body: schemas.listTask,
        },
      },
    },
  },
  async (context) => {
    const taskRepository = getManager().getRepository(Task);
    const tasks = await taskRepository.find();

    context.body = tasks;
  },
);

tasksRouter.get(
  '/:id',
  {
    validate: {
      params: {
        id: schemas.taskId,
      },
      output: {
        200: {
          body: schemas.task,
        },
      },
    },
  },
  async (context) => {
    const { id } = context.params;
    const taskRepository = getManager().getRepository(Task);
    const task = await taskRepository.findOne(id);

    if (!task) {
      context.throw(StatusCodes.NOT_FOUND, `Not found any todo with id: ${id}`);
      return;
    }

    context.body = task;
  },
);

tasksRouter.put(
  '/:id',
  {
    validate: {
      params: {
        id: schemas.taskId,
      },
      type: 'json',
      body: schemas.editTask,
      output: {
        200: {
          body: schemas.task,
        },
      },
      validateOptions: {
        abortEarly: false,
        stripUnknown: true,
      },
    },
  },
  async (context) => {
    const { id } = context.params;
    const taskRepository = getManager().getRepository(Task);
    const task = await taskRepository.findOne(id);

    if (!task) {
      context.throw(StatusCodes.NOT_FOUND, `Not found any todo with id: ${id}`);
      return;
    }

    taskRepository.merge(task, context.request.body);

    context.body = await taskRepository.save(task);
  },
);

tasksRouter.delete(
  '/:id',
  {
    validate: {
      params: {
        id: schemas.taskId,
      },
    },
  },
  async (context) => {
    const { id } = context.params;
    const taskRepository = getManager().getRepository(Task);
    const task = await taskRepository.findOne(id);

    if (!task) {
      context.throw(StatusCodes.NOT_FOUND, `Not found any todo with id: ${id}`);
      return;
    }

    await taskRepository.remove(task);

    context.body = null;
  },
);

export default tasksRouter;
