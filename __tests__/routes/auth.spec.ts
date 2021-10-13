import faker from 'faker';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import request from 'supertest';
import { Connection, createConnection } from 'typeorm';

import app from '@/app';
import { User } from '@/entities/user';
import { generateToken } from '@/middleware/auth';
import type { ErrorResponse } from '@/middleware/error';

describe('Auth routes', () => {
  let connection: Connection;
  let user: User;
  const url = {
    register: '/auth/register',
    login: '/auth/login',
    user: '/auth/me',
  };
  const password = 'Th€Pa$$w0rd!';

  beforeAll(async () => {
    connection = await createConnection();
  });

  beforeEach(async () => {
    const repo = connection.getRepository(User);
    user = repo.create({
      name: faker.name.findName(),
      email: faker.internet.email().toLowerCase(),
      password,
    });
    user = await repo.save(user);
  });

  afterEach(async () => {
    const repo = connection.getRepository(User);
    await repo.remove(user);
  });

  afterAll(async () => {
    await connection.close();
  });

  it('should register a new user', async () => {
    const payload = {
      name: faker.name.findName(),
      email: faker.internet.email().toLowerCase(),
      password: faker.internet.password(12),
    };

    await request(app.callback())
      .post(url.register)
      .send(payload)
      .expect(StatusCodes.CREATED)
      .expect(({ body }) => {
        expect(body).toMatchObject({
          token: expect.stringMatching(/.+\..+\..+/),
          user: {
            id: expect.any(Number),
            name: payload.name,
            email: payload.email,
          },
        });
      });
  });

  it('should fail to register a duplicate user', async () => {
    await request(app.callback())
      .post(url.register)
      .send({
        name: faker.name.findName(),
        email: user.email,
        password: faker.internet.password(12),
      })
      .expect(StatusCodes.CONFLICT)
      .expect(({ body }) => {
        expect(body).toMatchObject<ErrorResponse>({
          message: `The email ${user.email} is already register`,
          reason: ReasonPhrases.CONFLICT,
          statusCode: StatusCodes.CONFLICT,
        });
      });
  });

  it('should login with existing user', async () => {
    const payload = {
      email: user.email,
      password,
    };

    await request(app.callback())
      .post(url.login)
      .send(payload)
      .expect(StatusCodes.OK)
      .expect(({ body }) => {
        expect(body).toMatchObject({
          token: expect.stringMatching(/.+\..+\..+/),
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
          },
        });
      });
  });

  it('should fail to login with wrong email', async () => {
    await request(app.callback())
      .post(url.login)
      .send({
        email: faker.internet.exampleEmail().toLowerCase(),
        password: faker.internet.password(12),
      })
      .expect(StatusCodes.UNAUTHORIZED)
      .expect(({ body }) => {
        expect(body).toMatchObject<ErrorResponse>({
          message: 'Wrong email address for the user',
          reason: ReasonPhrases.UNAUTHORIZED,
          statusCode: StatusCodes.UNAUTHORIZED,
        });
      });
  });

  it('should fail to login with wrong password', async () => {
    await request(app.callback())
      .post(url.login)
      .send({
        email: user.email,
        password: faker.internet.password(12),
      })
      .expect(StatusCodes.UNAUTHORIZED)
      .expect(({ body }) => {
        expect(body).toMatchObject<ErrorResponse>({
          message: 'Wrong password for the user',
          reason: ReasonPhrases.UNAUTHORIZED,
          statusCode: StatusCodes.UNAUTHORIZED,
        });
      });
  });

  it('should get user from token', async () => {
    const token = generateToken(user);

    await request(app.callback())
      .get(url.user)
      .set('Authorization', `Bearer ${token}`)
      .expect(StatusCodes.OK)
      .expect(({ body }) => {
        expect(body).toMatchObject({
          id: user.id,
          name: user.name,
          email: user.email,
        });
      });
  });

  it('should fail to authenticate with an invalid JWT', async () => {
    // Generated at https://jwt.io
    const token =
      // eslint-disable-next-line no-secrets/no-secrets
      'eyJhbGciOiJIUzM4NCIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.SlHXzK2C1NhfGofbjyeqRhgh7RJg9t_0tIaUWLIye1mm_sZ6vvjqUAC4lkzqi84P';

    await request(app.callback())
      .get(url.user)
      .set('Authorization', `Bearer ${token}`)
      .expect(StatusCodes.UNAUTHORIZED)
      .expect(({ body }) => {
        expect(body).toMatchObject<ErrorResponse>({
          message: 'invalid signature',
          reason: 'Authentication Error',
          statusCode: StatusCodes.UNAUTHORIZED,
        });
      });
  });

  it('should require the JWT in the headers', async () => {
    await request(app.callback())
      .get(url.user)
      .expect(StatusCodes.UNAUTHORIZED)
      .expect(({ body }) => {
        expect(body).toMatchObject<ErrorResponse>({
          details: {
            authorization: '"Bearer Token" is required',
          },
          message: '"Bearer Token" is required',
          reason: ReasonPhrases.UNAUTHORIZED,
          statusCode: StatusCodes.UNAUTHORIZED,
        });
      });
  });

  it.each([
    { name: faker.name.findName() },
    { password, newPassword: faker.internet.password(12, true) },
    {
      name: faker.name.findName(),
      password,
      newPassword: faker.internet.password(12),
    },
  ])('should update my user with %o', async (payload) => {
    const token = generateToken(user);

    await request(app.callback())
      .put(url.user)
      .set('Authorization', `Bearer ${token}`)
      .send(payload)
      .expect(StatusCodes.OK)
      .expect(({ body }) => {
        expect(body).toMatchObject({
          id: user.id,
          name: payload.name ?? expect.any(String),
          email: user.email,
        });
      });
  });

  it('should fail to update my password when the current password is wrong', async () => {
    const token = generateToken(user);
    const payload = {
      password: faker.internet.password(12, true),
      newPassword: faker.internet.password(12),
    };

    await request(app.callback())
      .put(url.user)
      .set('Authorization', `Bearer ${token}`)
      .send(payload)
      .expect(StatusCodes.BAD_REQUEST)
      .expect(({ body }) => {
        expect(body).toMatchObject<ErrorResponse>({
          details: {
            password: '"password" is wrong',
          },
          message: '"password" is wrong',
          reason: ReasonPhrases.BAD_REQUEST,
          statusCode: StatusCodes.BAD_REQUEST,
        });
      });
  });

  it('should remove my user', async () => {
    const token = generateToken(user);

    await request(app.callback())
      .del(url.user)
      .set('Authorization', `Bearer ${token}`)
      .expect(StatusCodes.NO_CONTENT);
  });
});
