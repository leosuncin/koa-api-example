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

export type RegisterUser = {
  name: string;
  email: string;
  password: string;
};

export const registerUser = Joi.object<RegisterUser>({
  name,
  email,
  password,
}).description('Register a new user');

export type LoginUser = {
  email: string;
  password: string;
};

export const loginUser = Joi.object<LoginUser>({
  email,
  password,
}).description('Login with existing user');

export type UserJSON = {
  id: number;
  name: string;
  email: string;
};

export const user = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .description('The identifier of the user')
    .example(1),
  name,
  email,
})
  .options({ stripUnknown: true })
  .description('The user object');

export type AuthResponse = {
  user: UserJSON;
  token: string;
};

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

export type UpdateUser = {
  name: string;
  password: string;
  newPassword: string;
};

export const updateUser = Joi.object<UpdateUser>({
  name,
  password,
  newPassword: password
    .optional()
    .not(Joi.ref('password'))
    .label('new password')
    .description('The new password of the user'),
})
  .with('newPassword', 'password')
  .when('.newPassword', {
    is: Joi.exist(),
    then: Joi.object({ name: Joi.optional(), password: Joi.required() }),
    otherwise: Joi.object({ name: Joi.required(), password: Joi.forbidden() }),
  })
  .when('.password', {
    is: Joi.exist(),
    then: Joi.object({ name: Joi.optional() }),
  })
  .description("Update user's information");
