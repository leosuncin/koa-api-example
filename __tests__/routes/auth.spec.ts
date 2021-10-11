import faker from 'faker';
import { StatusCodes } from 'http-status-codes';
import request from 'supertest';
import { Connection, createConnection } from 'typeorm';

import { User } from '@/entities/user';
import { generateToken } from '@/middleware/auth';
import type { ErrorResponse } from '@/middleware/error';
import server from '@/server';

describe('Auth routes', () => {
  let connection: Connection;
  let user: User;

  beforeAll(async () => {
    connection = await createConnection();
  });

  beforeEach(async () => {
    const repo = connection.getRepository(User);
    user = await repo.save(
      repo.create({
        name: faker.name.findName(),
        email: faker.internet.email().toLowerCase(),
        password: 'Th€Pa$$w0rd!',
      }),
    );
  });

  afterEach(async () => {
    const repo = connection.getRepository(User);
    await repo.delete(user.id);
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

    await request(server.callback())
      .post('/auth/register')
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

  it('should login with existing user', async () => {
    const payload = {
      email: user.email,
      password: 'Th€Pa$$w0rd!',
    };

    await request(server.callback())
      .post('/auth/login')
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

  it('should get user from token', async () => {
    const token = generateToken(user);

    await request(server.callback())
      .get('/auth/me')
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

    await request(server.callback())
      .get('/auth/me')
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
});
