import { StatusCodes } from 'http-status-codes';
import router, { Joi } from 'koa-joi-router';

import { dataSource } from '@/config/ormconfig';
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
    const userRepository = dataSource.getRepository(User);
    const user = userRepository.create(
      context.request.body as schemas.RegisterUser,
    );
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
    const { email, password } = context.request.body as schemas.LoginUser;
    const userRepository = dataSource.getRepository(User);
    const user = await userRepository.findOneBy({ email });

    if (!user) {
      context.throw(
        StatusCodes.UNAUTHORIZED,
        'Wrong email address for the user',
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    if (!user!.checkPassword(password)) {
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
    const userRepository = dataSource.getRepository(User);
    const user = await userRepository.findOneBy({ id: context.state.user.sub });

    context.body = user;
  },
);

authRouter.put(
  '/me',
  {
    validate: {
      header: schemas.withAuthenticationHeader,
      body: schemas.updateUser,
      type: 'json',
      output: {
        200: {
          body: schemas.user,
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
  auth,
  async (context) => {
    const { newPassword, password } = context.request
      .body as schemas.UpdateUser;
    const userRepository = dataSource.getRepository(User);
    const user = await userRepository.findOneBy({ id: context.state.user.sub });

    /* eslint-disable @typescript-eslint/no-non-null-assertion */
    if (newPassword && !user!.checkPassword(password)) {
      context.throw(
        StatusCodes.BAD_REQUEST,
        // hack the validation: koi-joi-router do not support `validateAsync`, so the error has to be thrown manually
        new Joi.ValidationError(
          '"password" is wrong',
          [
            {
              path: ['password'],
              message: '"password" is wrong',
              type: 'wrong_password',
            },
          ],
          null,
        ),
      );
    }

    userRepository.merge(user!, context.request.body as schemas.UpdateUser);
    await userRepository.save(user!);
    /* eslint-enable @typescript-eslint/no-non-null-assertion */

    context.body = user;
  },
);

authRouter.delete(
  '/me',
  {
    validate: {
      header: schemas.withAuthenticationHeader,
      failure: StatusCodes.UNAUTHORIZED,
      output: {
        '400-599': {
          body: errorResponse,
        },
      },
    },
  },
  auth,
  async (context) => {
    const userRepository = dataSource.getRepository(User);
    const user = await userRepository.findOneBy({ id: context.state.user.sub });

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    await userRepository.remove(user!);

    context.status = StatusCodes.NO_CONTENT;
    context.body = null;
  },
);

export default authRouter;
