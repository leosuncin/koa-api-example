import { StatusCodes } from 'http-status-codes';
import { Router } from 'koa-joi-router';
import { getManager } from 'typeorm';

import { Task } from '@/entities/task';
import { errorResponse } from '@/schemas/common';
import * as schemas from '@/schemas/task';

export default (taskRouter: Router): void => {
  taskRouter.prefix('/tasks');

  taskRouter.post(
    '/',
    {
      meta: {
        swagger: {
          summary: 'Create a new task',
          description: 'Add a new pending task',
          tags: ['tasks'],
        },
      },
      validate: {
        type: 'json',
        body: schemas.createTask,
        output: {
          201: {
            body: schemas.task,
          },
          '400-599': {
            body: errorResponse,
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

  taskRouter.get(
    '/',
    {
      meta: {
        swagger: {
          summary: 'Find all tasks',
          description: 'Get the list of tasks',
          tags: ['tasks'],
        },
      },
      validate: {
        output: {
          200: {
            body: schemas.listTask,
          },
          '400-599': {
            body: errorResponse,
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

  taskRouter.get(
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
        context.throw(
          StatusCodes.NOT_FOUND,
          `Not found any todo with id: ${id}`,
        );
      }

      context.body = task;
    },
  );

  taskRouter.put(
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
        context.throw(
          StatusCodes.NOT_FOUND,
          `Not found any todo with id: ${id}`,
        );
      }

      taskRepository.merge(task!, context.request.body);

      context.body = await taskRepository.save(task!);
    },
  );

  taskRouter.delete(
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
        context.throw(
          StatusCodes.NOT_FOUND,
          `Not found any todo with id: ${id}`,
        );
      }

      await taskRepository.remove(task!);

      context.body = null;
    },
  );
};
