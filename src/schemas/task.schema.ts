import { Joi } from 'koa-joi-router';

export const createTask = Joi.object({
  text: Joi.string()
    .min(3)
    .required()
    .example('Make a sandwich')
    .description('The thing to do'),
}).description('Add a new task');

export const taskId = Joi.number()
  .integer()
  .positive()
  .required()
  .example(1)
  .description('The identifier of the task');

export const task = Joi.object({
  id: taskId,
  text: Joi.string()
    .required()
    .example('Make a sandwich')
    .description('The thing to do'),
  done: Joi.boolean().required().description('Is the task pending?'),
  createdAt: Joi.date()
    .required()
    .description('The time when the task was created'),
  updatedAt: Joi.date()
    .required()
    .description('The time when the task was updated'),
}).description('The task object');

export const listTask = Joi.array()
  .items(task)
  .required()
  .description('The list of tasks');

export const editTask = Joi.object({
  text: Joi.string()
    .min(3)
    .example('Make a salad')
    .description('Change the action'),
  done: Joi.boolean().description('Is the task done?'),
}).description('Update a task');
