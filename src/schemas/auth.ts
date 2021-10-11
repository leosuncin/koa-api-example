import { Joi } from 'koa-joi-router';

const email = Joi.string()
  .email()
  .lowercase()
  .required()
  .description('The email of the user')
  .example('john@doe.me');
const name = Joi.string()
  .required()
  .description('The name of the user')
  .example('John Doe');
const password = Joi.string()
  .min(12)
  .max(32)
  .required()
  .description('The password of the user');

export const registerUser = Joi.object({
  name,
  email,
  password,
}).description('Register a new user');

export const loginUser = Joi.object({
  email,
  password,
}).description('Login with existing user');

export const user = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .description('The identifier of the task')
    .example(1),
  name,
  email,
})
  .options({ stripUnknown: true })
  .description('The user object');

export const authResponse = Joi.object({
  token: Joi.string()
    .required()
    .description('The JSON Web Token necessary to authenticate the user'),
  user,
}).description("The JWT and the user's information");

export const withAuthenticationHeader = Joi.object({
  authorization: Joi.string()
    .regex(/Bearer .+/)
    .required()
    .label('Bearer Token')
    .description('Bearer token that needs to be a JSON Web Token'),
}).options({ allowUnknown: true });
