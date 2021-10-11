import { StatusCodes } from 'http-status-codes';
import router from 'koa-joi-router';
import { getRepository } from 'typeorm';

import { User } from '@/entities/user';
import auth, { generateToken } from '@/middleware/auth';
import * as schemas from '@/schemas/auth';
import { errorResponse } from '@/schemas/common';

const authRouter = router();

authRouter.prefix('/auth');

authRouter.post(
  '/register',
  {
    validate: {
      body: schemas.registerUser,
      type: 'json',
      output: {
        201: {
          body: schemas.authResponse,
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
    const userRepository = getRepository(User);
    const user = userRepository.create(context.request.body as Partial<User>);
    const countUsers = await userRepository.count({
      where: { email: user.email },
    });

    if (countUsers > 0) {
      context.throw(
        StatusCodes.CONFLICT,
        `The email ${user.email} is already register`,
      );
    }

    await userRepository.save(user);
    const token = generateToken(user);

    context.status = StatusCodes.CREATED;
    context.body = { user, token };
  },
);

authRouter.post(
  '/login',
  {
    validate: {
      body: schemas.loginUser,
      type: 'json',
      output: {
        200: {
          body: schemas.authResponse,
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
    const userRepository = getRepository(User);
    const user = await userRepository.findOne({
      email: context.request.body.email,
    });

    if (!user) {
      context.throw(
        StatusCodes.UNAUTHORIZED,
        'Wrong email address for the user',
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    if (!user!.checkPassword(context.request.body.password)) {
      context.throw(StatusCodes.UNAUTHORIZED, 'Wrong password for the user');
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const token = generateToken(user!);

    context.body = { user, token };
  },
);

authRouter.get(
  '/me',
  {
    validate: {
      failure: StatusCodes.UNAUTHORIZED,
      header: schemas.withAuthenticationHeader,
      output: {
        200: {
          body: schemas.user,
        },
        '400-599': {
          body: errorResponse,
        },
      },
    },
  },
  auth,
  async (context) => {
    const userRepository = getRepository(User);
    const user = await userRepository.findOne({ id: context.state.user.sub });

    context.body = user;
  },
);

export default authRouter;
