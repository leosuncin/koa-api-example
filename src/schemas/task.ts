import { Joi } from 'koa-joi-router';

export const createTask = Joi.object({
  text: Joi.string().min(3).required(),
});

export const taskId = Joi.number().integer().positive().required().example(1);

export const task = Joi.object({
  id: taskId,
  text: Joi.string(),
  done: Joi.boolean(),
  createdAt: Joi.date(),
  updatedAt: Joi.date(),
});

export const listTask = Joi.array().items(task);

export const editTask = Joi.object({
  text: Joi.string().min(3),
  done: Joi.boolean(),
});
